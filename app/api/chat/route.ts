import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
    ToolLoopAgent,
    createAgentUIStreamResponse,
    createUIMessageStream,
    createUIMessageStreamResponse,
    tool,
} from 'ai';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import { embed } from 'ai';
import { KnowledgeDocument } from '@/lib/models';


const rawSite3Url = process.env.SITE_3_URL || 'http://localhost:3002';
const SITE_3_URL = rawSite3Url.replace(/\/+$/, '');

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

// Helper: Query MongoDB for a vehicle record


// 1. RAG Knowledge Tool: Vector Search over official rules
const searchKnowledgeBaseTool = tool({
    description: 'Search official rules, fees, timelines, and document requirements for public services.',
    parameters: z.object({
        query: z.string().describe('The procedural or informational question asked by the citizen.'),
    }),
    execute: async ({ query }: { query: string }) => {
        try {
            await connectToDatabase();

            // Convert user query to 768-dim vector
            const { embedding } = await embed({
                model: google.textEmbeddingModel('gemini-embedding-001'),
                value: query,
                providerOptions: {
                    google: {
                        outputDimensionality: 768,
                    }
                }
            });

            // MongoDB Atlas Vector Search Pipeline
            const results = await KnowledgeDocument.aggregate([
                {
                    $vectorSearch: {
                        index: 'vector_index',
                        path: 'embedding',
                        queryVector: embedding,
                        numCandidates: 10,
                        limit: 3,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        content: 1,
                        score: { $meta: 'vectorSearchScore' },
                    },
                },
            ]);

            if (!results.length) {
                return { message: 'No specific official guidelines found matching this query.' };
            }

            return { guidelines: results.map((r) => r.content).join('\n\n') };
        } catch (err: any) {
            console.error('Vector Search Error, attempting keyword fallback:', err?.message || err);
            try {
                const words = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w: string) => w.length > 2);
                if (words.length > 0) {
                    const regex = new RegExp(words.slice(0, 3).join('|'), 'i');
                    const fallbackDocs = await KnowledgeDocument.find({ content: { $regex: regex } }).limit(3);
                    if (fallbackDocs.length > 0) {
                        return { guidelines: fallbackDocs.map((d: any) => d.content).join('\n\n') };
                    }
                }
            } catch (fallbackErr) {
                console.error('Keyword fallback error:', fallbackErr);
            }
            return { error: 'Knowledge search temporarily unavailable.' };
        }
    },
} as any);

// 2. Pure Communication Tool: Live HTTP Fetch to Site 3
const trackPassportTool = tool({
    description: 'Track the live status of an existing passport application from the Passport Seva microservice.',
    parameters: z.object({
        applicationId: z.string().optional().describe('The passport application reference ID (e.g. APP-2026-537272).'),
        draftId: z.string().optional().describe('Alias for applicationId. The passport application reference ID.'),
    }),
    execute: async (args: any) => {
        console.log('[trackPassport] Called with args:', JSON.stringify(args));

        try {
            // Accept both field names — Gemini uses applicationId, legacy code uses draftId
            const draftId = args?.applicationId || args?.draftId;

            // Safety Check: If no ID provided, return an instruction for the AI (not an error for the UI)
            if (!draftId) {
                return {
                    status: 'NEED_INPUT',
                    instruction: 'Ask the citizen to provide their Application ID in format APP-YYYY-XXXXXX.',
                };
            }

            // Regex extraction to ensure clean Application ID
            const match = String(draftId).match(/APP-\d{4}-\d+/i);
            const cleanId = match ? match[0].toUpperCase() : String(draftId).trim();

            const fetchUrl = `${SITE_3_URL}/api/appointments/${cleanId}`;
            console.log('[trackPassport] Fetching:', fetchUrl);

            // Add a 15-second timeout to prevent hanging
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            const res = await fetch(fetchUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
            });
            clearTimeout(timeout);

            console.log('[trackPassport] Response status:', res.status);

            const json = await res.json();
            console.log('[trackPassport] Response body:', JSON.stringify(json).substring(0, 500));

            if (!res.ok || !json.success) {
                return { status: 'NOT_FOUND', appId: cleanId, message: `No application found for ID: ${cleanId}` };
            }

            const data = json.data || {};
            return {
                status: data.status || 'FOUND',
                appId: data.appId || cleanId,
                serviceType: data.serviceType,
                personalDetails: data.personalDetails,
                appointment: data.appointment,
            };
        } catch (err: any) {
            console.error('[trackPassport] Fetch Error:', err?.message || err);
            if (err?.name === 'AbortError') {
                return { status: 'ERROR', message: 'Request to Passport Seva timed out. Please try again.' };
            }
            return { status: 'ERROR', message: 'Unable to reach Passport Seva servers at this time.' };
        }
    },
} as any);

const systemInstructions = `You are JanSeva AI, the official Indian public service digital assistant and generative UI gateway.
- Be polite, concise, helpful, and citizen-friendly.

*** STRICT GENERATIVE UI RULES (MUST FOLLOW) ***
- If the user says "I want to apply for a passport" or ANY variation of wanting to start an application:
  1. DO NOT ask them for their details in a text response.
  2. DO NOT say "Sure, please provide your name." 
  3. YOU MUST IMMEDIATELY CALL THE 'createApplicationForm' TOOL.
  4. Only populate 'prefilledData' with details they have ALREADY explicitly given you.
  5. Put the remaining missing fields into the 'fields' array (firstName, lastName, dob, address, serviceType, pskLocation).
  6. The submitUrl MUST be: /api/proxy/submit

*** TRACKING & RAG RULES ***
- PASSPORT TRACKING: Requires ONLY Application ID in format APP-YYYY-XXXXXX. Call 'trackPassport'.
- RAG KNOWLEDGE: When asking about fees, documents, or timelines, call 'searchKnowledgeBase'.

*** PRIVACY ***
- NEVER ask for or output plaintext Aadhaar numbers. Always use [Aadhaar Redacted].`;

// 3. Generative UI Tool: Pure Dynamic Form Generation
const PASSPORT_DEFAULT_FIELDS = [
    { id: 'firstName', label: 'First Name', type: 'text' as const, required: true, placeholder: 'e.g. Rahul' },
    { id: 'lastName', label: 'Last Name', type: 'text' as const, required: true, placeholder: 'e.g. Sharma' },
    { id: 'dob', label: 'Date of Birth', type: 'date' as const, required: true },
    { id: 'address', label: 'Residential Address', type: 'text' as const, required: true, placeholder: 'Full address' },
    { id: 'serviceType', label: 'Service Type', type: 'select' as const, required: true, options: ['Fresh', 'Re-issue', 'Tatkaal'] },
    { id: 'pskLocation', label: 'PSK Location', type: 'select' as const, required: true, options: ['Delhi - RPO Herald House, ITO', 'Mumbai - Bandra RPO', 'Bangalore - Lalbagh RPO', 'Chennai - T. Nagar RPO'] },
];

const createApplicationFormTool = tool({
    description: 'Generate a dynamic form UI when a citizen wants to apply for a public service. Place already-known user details inside prefilledData.',
    parameters: z.object({
        serviceId: z.string().describe('Unique ID of the service (e.g. PASSPORT_FRESH)'),
        serviceName: z.string().describe('Display name of the service (e.g. Passport Seva - Fresh Application)'),
        submitUrl: z.string().describe('Target URL, use exactly: /api/proxy/submit'),
        fields: z.array(
            z.object({
                id: z.string(),
                label: z.string(),
                type: z.enum(['text', 'date', 'select', 'number']),
                options: z.any().optional(),
                required: z.boolean().default(true),
                placeholder: z.string().optional(),
            })
        ).describe('List of missing fields the citizen must fill out'),

        // Changed to z.any() to prevent strict JSON parsing crashes from Gemini
        prefilledData: z.any().describe('Key-value pairs of details already known (e.g. {"firstName": "Rahul"})'),
    }),
    execute: async (args: any) => {
        console.log('[createApplicationForm] Called with args:', JSON.stringify(args).substring(0, 800));

        // If Gemini sent empty fields, inject the default passport form fields
        let fields = args.fields || [];
        if (fields.length === 0) {
            console.log('[createApplicationForm] Empty fields array — injecting default passport fields');
            fields = PASSPORT_DEFAULT_FIELDS;
        }

        // Remove any fields that are already in prefilledData
        const prefilled = args.prefilledData || {};
        const prefilledKeys = Object.keys(prefilled);
        if (prefilledKeys.length > 0) {
            fields = fields.filter((f: any) => !prefilledKeys.includes(f.id));
        }

        return {
            serviceId: args.serviceId || 'PASSPORT_FRESH',
            serviceName: args.serviceName || 'Passport Seva - Fresh Application',
            submitUrl: '/api/proxy/submit',
            fields,
            prefilledData: prefilled,
            generatedAt: new Date().toISOString(),
        };
    },
} as any);
// Universal UI Stream Fallback Generator
function createFallbackStreamResponse(text: string, toolCall?: { name: string; callId: string; output: any }) {
    const textId = 'text-' + Date.now();
    return createUIMessageStreamResponse({
        stream: createUIMessageStream({
            execute: async ({ writer }) => {
                writer.write({ type: 'start' } as any);

                if (toolCall) {
                    writer.write({ type: 'start-step' } as any);
                    writer.write({
                        type: 'tool-input-start',
                        toolCallId: toolCall.callId,
                        toolName: toolCall.name,
                    } as any);
                    writer.write({
                        type: 'tool-input-available',
                        toolCallId: toolCall.callId,
                        toolName: toolCall.name,
                        input: {},
                    } as any);
                    writer.write({
                        type: 'tool-output-available',
                        toolCallId: toolCall.callId,
                        output: toolCall.output,
                    } as any);
                    writer.write({ type: 'finish-step' } as any);
                }

                writer.write({ type: 'start-step' } as any);
                writer.write({ type: 'text-start', id: textId } as any);

                const words = text.split(' ');
                for (const word of words) {
                    writer.write({
                        type: 'text-delta',
                        id: textId,
                        delta: `${word} `,
                    } as any);
                    await new Promise((r) => setTimeout(r, 12));
                }

                writer.write({ type: 'text-end', id: textId } as any);
                writer.write({ type: 'finish-step' } as any);
                writer.write({ type: 'finish', finishReason: 'stop' } as any);
            },
        }),
    });
}


export async function POST(req: Request) {
    const { messages } = await req.json();



    const formattedMessages = (messages || []).map((m: any, idx: number) => ({
        id: m.id || `msg-${idx}-${Date.now()}`,
        role: m.role || 'user',
        parts: m.parts || [],
        metadata: m.metadata,
    }));

    // 1. Attempt Execution with Gemini Agent
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        const fallbackModels = [
            google('gemini-3.5-flash-lite'),
            google('gemini-3.1-flash-lite'),
        ];

        for (const model of fallbackModels) {
            try {
                const agent = new ToolLoopAgent({
                    model,
                    instructions: systemInstructions,
                    tools: {
                        searchKnowledgeBase: searchKnowledgeBaseTool,
                        trackPassport: trackPassportTool,
                        createApplicationForm: createApplicationFormTool,
                    },
                });

                return await createAgentUIStreamResponse({
                    agent,
                    uiMessages: formattedMessages,
                });
            } catch (err: any) {
                console.warn(`Model failed, switching to next available engine:`, err?.message || err);
            }
        }
    }

    // 2. Intelligent Fallback (Queries Live DB even when LLM is Offline)
    const lastUserMsg = formattedMessages.slice().reverse().find((m: any) => m.role === 'user');
    const textPart = lastUserMsg?.parts?.find((p: any) => p.type === 'text')?.text || '';
    const query = textPart.toLowerCase().trim();

    // If the AI crashes, we just return a polite generic response instead of dummy data
    return createFallbackStreamResponse(
        'Welcome to JanSeva AI — your official Indian public service gateway. (Note: AI services are currently experiencing high traffic. Please try your query again in a moment.)'
    );
}