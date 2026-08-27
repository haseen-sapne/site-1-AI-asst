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
import { Challan } from '@/lib/models';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

// 1. Tool: Check Traffic Fines
const checkTrafficFinesTool = tool({
    description: 'Look up pending traffic fines and e-Challan records for a vehicle registration number in Parivahan database.',
    parameters: z.object({
        vehicleNo: z.string().optional().describe('Vehicle registration number, e.g. DL01AB1234 or MH02CD5678'),
    }),
    execute: async (args: any) => {
        const rawVeh = args?.vehicleNo || args?.vehicleNumber || args?.vehicle || '';
        const normalizedVeh = rawVeh.trim().toUpperCase();

        if (!normalizedVeh) {
            return {
                status: 'NOT_FOUND',
                vehicle: '',
                message: 'Please provide a valid vehicle registration number (e.g. DL01AB1234).',
            };
        }

        // Check MongoDB if configured
        if (process.env.MONGODB_URI) {
            try {
                await connectToDatabase();
                const dbRecord = await Challan.findOne({ vehicleNo: normalizedVeh });
                if (dbRecord) {
                    return {
                        status: 'FOUND',
                        challanId: dbRecord.challanId,
                        vehicle: dbRecord.vehicleNo,
                        offense: dbRecord.offense,
                        amount: dbRecord.amount,
                        date: dbRecord.date,
                    };
                }
            } catch (dbErr) {
                console.warn('MongoDB query bypassed, using fallback dataset:', dbErr);
            }
        }

        if (normalizedVeh === 'DL01AB1234') {
            return {
                status: 'FOUND',
                challanId: 'CH-2026-88349',
                vehicle: 'DL01AB1234',
                offense: 'Over Speeding (Sec 183 MVA)',
                amount: 1000,
                date: '14-02-2026',
            };
        }

        if (normalizedVeh === 'MH02CD5678') {
            return {
                status: 'FOUND',
                challanId: 'CH-2026-44120',
                vehicle: 'MH02CD5678',
                offense: 'Signal Jump (Sec 184 MVA)',
                amount: 500,
                date: '20-02-2026',
            };
        }

        return {
            status: 'NOT_FOUND',
            vehicle: normalizedVeh,
            message: `No pending fines found for vehicle ${normalizedVeh}. Drive safely!`,
        };
    },
} as any);

// 2. Tool: Check Aadhaar Status
const checkAadhaarStatusTool = tool({
    description: 'Check status of an Aadhaar enrollment or update request using Aadhaar number or Enrollment ID.',
    parameters: z.object({
        identifier: z.string().describe('The 12-digit Aadhaar number, 14-digit EID, or masked identifier'),
    }),
    execute: async (args: any) => {
        const id = args?.identifier || '********4321';
        return {
            status: 'GENERATED_DISPATCHED',
            aadhaarNumber: id.includes('*') ? id : '********' + id.slice(-4),
            name: 'Ramesh Sharma',
            message: 'Your Aadhaar has been generated and sent via post. You can also download the e-Aadhaar from the official UIDAI portal.',
            dispatchDate: '24-02-2026',
            trackingNumber: 'IN984210492IN',
        };
    },
} as any);

// 3. Tool: Check PAN Info
const checkPanInfoTool = tool({
    description: 'Look up PAN card verification and Aadhaar linking status.',
    parameters: z.object({
        panNumber: z.string().optional().describe('10-character PAN number'),
    }),
    execute: async (args: any) => {
        return {
            status: 'ACTIVE',
            panNumber: args?.panNumber?.toUpperCase() || 'ABCDE1234F',
            name: 'Ramesh Sharma',
            category: 'Individual',
            aadhaarLinked: true,
        };
    },
} as any);

const systemInstructions = `You are JanSeva AI, the official Indian public service digital assistant and generative UI gateway.
- Be polite, concise, helpful, and citizen-friendly.
- When a citizen asks about traffic fines or challans, trigger checkTrafficFines.
- When a citizen asks about Aadhaar status, ask for their 14-digit EID or Aadhaar number, and trigger checkAadhaarStatus.
- When a citizen asks about PAN card details, trigger checkPanInfo.
- Strictly decline non-civic inquiries and remind the user that you only assist with official public services.
- NEVER output real numeric digits for Aadhaar. Always use masked [Aadhaar Redacted] or ********4321.`;

const modelNames = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
];

// Schema-compliant fallback stream response for AI SDK 7
function createFallbackStreamResponse(text: string, toolCall?: { name: string, callId: string, output: any }) {
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
                    await new Promise(r => setTimeout(r, 12));
                }

                writer.write({ type: 'text-end', id: textId } as any);
                writer.write({ type: 'finish-step' } as any);
                writer.write({ type: 'finish', finishReason: 'stop' } as any);
            }
        })
    });
}

export async function POST(req: Request) {
    let lastError: any = null;
    const { messages } = await req.json();

    const formattedMessages = (messages || []).map((m: any, idx: number) => ({
        id: m.id || `msg-${idx}-${Date.now()}`,
        role: m.role || 'user',
        parts: m.parts || [],
        metadata: m.metadata,
    }));

    // Cascade try loop across all models if API key exists
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        for (const modelName of modelNames) {
            try {
                const agent = new ToolLoopAgent({
                    model: google(modelName),
                    instructions: systemInstructions,
                    tools: {
                        checkTrafficFines: checkTrafficFinesTool,
                        checkAadhaarStatus: checkAadhaarStatusTool,
                        checkPanInfo: checkPanInfoTool,
                    },
                });

                return await createAgentUIStreamResponse({
                    agent,
                    uiMessages: formattedMessages,
                });
            } catch (err: any) {
                console.warn(`Model ${modelName} failed. Trying next...`, err.message || err);
                lastError = err;
            }
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // FALLBACK INTENT ENGINE: For instant responsiveness and offline demoing
    // ────────────────────────────────────────────────────────────────────────
    const lastUserMsg = formattedMessages.slice().reverse().find((m: any) => m.role === 'user');
    const textPart = lastUserMsg?.parts?.find((p: any) => p.type === 'text')?.text || '';
    const query = textPart.toLowerCase().trim();

    // 1. Aadhaar status flow
    if (query === 'aadhaar status' || query === 'check aadhaar status' || query === 'check my aadhaar status') {
        return createFallbackStreamResponse(
            "I can help with that. Please provide your 14-digit Enrollment ID (EID) or Aadhaar Number to proceed."
        );
    }

    if (
        query.includes('4321') ||
        query.includes('aadhaar') ||
        query.includes('eid') ||
        /^\d{4,14}$/.test(query.replace(/\*/g, ''))
    ) {
        const masked = query.includes('*') ? query : '********4321';
        return createFallbackStreamResponse(
            `Here is the latest verified status for your Aadhaar request (${masked}):`,
            {
                name: 'checkAadhaarStatus',
                callId: 'call_aadhaar_' + Date.now(),
                output: {
                    status: 'GENERATED_DISPATCHED',
                    aadhaarNumber: masked,
                    name: 'Ramesh Sharma',
                    message: 'Your Aadhaar has been generated and sent via post. You can also download the e-Aadhaar from the official UIDAI portal.',
                    dispatchDate: '24-02-2026',
                    trackingNumber: 'IN984210492IN',
                }
            }
        );
    }

    // 2. PAN Card flow
    if (query.includes('pan') || query.includes('abcde1234f')) {
        return createFallbackStreamResponse(
            "I found your active PAN details and UIDAI linkage verification in the NSDL database:",
            {
                name: 'checkPanInfo',
                callId: 'call_pan_' + Date.now(),
                output: {
                    status: 'ACTIVE',
                    panNumber: 'ABCDE1234F',
                    name: 'Ramesh Sharma',
                    category: 'Individual',
                    aadhaarLinked: true,
                }
            }
        );
    }

    // 3. Traffic fine query check
    if (query.includes('dl01ab1234') || query.includes('mh02cd5678') || query.includes('challan') || query.includes('fine') || query.includes('traffic')) {
        const isMh = query.includes('mh02cd5678');
        const vehicle = isMh ? 'MH02CD5678' : 'DL01AB1234';
        const output = isMh ? {
            status: 'FOUND',
            challanId: 'CH-2026-44120',
            vehicle: 'MH02CD5678',
            offense: 'Signal Jump (Sec 184 MVA)',
            amount: 500,
            date: '20-02-2026',
        } : {
            status: 'FOUND',
            challanId: 'CH-2026-88349',
            vehicle: 'DL01AB1234',
            offense: 'Over Speeding (Sec 183 MVA)',
            amount: 1000,
            date: '14-02-2026',
        };

        return createFallbackStreamResponse(
            `I found a pending e-Challan violation for vehicle ${vehicle} in the Parivahan database. Please review the details and proceed with secure payment.`,
            {
                name: 'checkTrafficFines',
                callId: 'call_traffic_' + Date.now(),
                output,
            }
        );
    }

    // Default reply
    return createFallbackStreamResponse(
        "Welcome to JanSeva AI — your official Indian public service gateway. How can I assist you today?"
    );
}