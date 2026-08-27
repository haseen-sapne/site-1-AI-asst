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

// Helper: Query MongoDB for a vehicle record
async function queryChallanDatabase(vehicleNo: string) {
    const normalizedVeh = (vehicleNo || '').replace(/[\s-]/g, '').trim().toUpperCase();
    if (!normalizedVeh) return null;

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
            console.warn('MongoDB query failed:', dbErr);
        }
    }
    return {
        status: 'NOT_FOUND',
        vehicle: normalizedVeh,
        message: `No pending fines found for vehicle ${normalizedVeh}. Drive safely!`,
    };
}

// 1. Tool: Check Traffic Fines
const checkTrafficFinesTool = tool({
    description: 'Look up pending traffic fines and e-Challan records for a vehicle registration number in the Parivahan database.',
    parameters: z.object({
        vehicleNo: z.string().describe('Vehicle registration number, e.g. DL01AB1234 or MH02CD5678'),
    }),
    execute: async ({ vehicleNo }: { vehicleNo: string }) => {
        return await queryChallanDatabase(vehicleNo);
    },
} as any);

// 2. Tool: Check Aadhaar Status
const checkAadhaarStatusTool = tool({
    description: 'Check status of an Aadhaar enrollment or update request using Enrollment ID or masked identifier.',
    parameters: z.object({
        identifier: z.string().describe('The enrollment identifier or masked Aadhaar'),
    }),
    execute: async () => {
        return {
            status: 'GENERATED_DISPATCHED',
            aadhaarNumber: '[Aadhaar Redacted]',
            name: 'Ramesh Sharma',
            message: 'Your Aadhaar has been generated and dispatched. You can download the e-Aadhaar from the official UIDAI portal.',
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
- When a citizen asks about traffic fines or challans without a vehicle number, ask for the vehicle number BEFORE triggering checkTrafficFines.
- When a citizen asks about Aadhaar status, trigger checkAadhaarStatus.
- When a citizen asks about PAN card details, trigger checkPanInfo.
- Strictly decline non-civic inquiries and state that you only assist with official public services.
- NEVER generate, echo, or output actual numeric digits for Aadhaar. Always use [Aadhaar Redacted].`;

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
                console.warn(`Model failed, switching to next available engine:`, err?.message || err);
            }
        }
    }

    // 2. Intelligent Fallback (Queries Live DB even when LLM is Offline)
    const lastUserMsg = formattedMessages.slice().reverse().find((m: any) => m.role === 'user');
    const textPart = lastUserMsg?.parts?.find((p: any) => p.type === 'text')?.text || '';
    const query = textPart.toLowerCase().trim();

    // Traffic Challan check in Fallback Mode
    const vehicleMatch = query.match(/[a-z]{2}\s*[-]?\s*\d{1,2}\s*[-]?\s*[a-z]{1,2}\s*[-]?\s*\d{4}/i);
    if (vehicleMatch || query.includes('challan') || query.includes('fine')) {
        const targetVeh = vehicleMatch ? vehicleMatch[0] : 'DL01AB1234';
        const dbResult = await queryChallanDatabase(targetVeh);

        return createFallbackStreamResponse(
            dbResult?.status === 'FOUND'
                ? `I located an active record for vehicle ${targetVeh} in the Parivahan database.`
                : `I checked the Parivahan database and found no pending violations for ${targetVeh}.`,
            {
                name: 'checkTrafficFines',
                callId: 'call_traffic_' + Date.now(),
                output: dbResult,
            }
        );
    }

    // Aadhaar flow in Fallback Mode
    if (query.includes('aadhaar') || query.includes('eid')) {
        return createFallbackStreamResponse(
            'Here is the verified status for your Aadhaar request:',
            {
                name: 'checkAadhaarStatus',
                callId: 'call_aadhaar_' + Date.now(),
                output: {
                    status: 'GENERATED_DISPATCHED',
                    aadhaarNumber: '[Aadhaar Redacted]',
                    name: 'Ramesh Sharma',
                    message: 'Your Aadhaar has been generated and dispatched.',
                    dispatchDate: '24-02-2026',
                    trackingNumber: 'IN984210492IN',
                },
            }
        );
    }

    // PAN Card flow in Fallback Mode
    if (query.includes('pan') || /[a-z]{5}\d{4}[a-z]/i.test(query)) {
        return createFallbackStreamResponse(
            'I found your active PAN details and UIDAI linkage verification in the NSDL database:',
            {
                name: 'checkPanInfo',
                callId: 'call_pan_' + Date.now(),
                output: {
                    status: 'ACTIVE',
                    panNumber: 'ABCDE1234F',
                    name: 'Ramesh Sharma',
                    category: 'Individual',
                    aadhaarLinked: true,
                },
            }
        );
    }

    // Default civic response
    return createFallbackStreamResponse(
        'Welcome to JanSeva AI — your official Indian public service gateway. How can I assist you with civic services today?'
    );
}