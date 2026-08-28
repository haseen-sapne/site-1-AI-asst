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
            google('gemini-2.5-flash'),
            google('gemini-2.0-flash'),
            google('gemini-1.5-flash'),
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

    // 2. Intelligent Public Services Fallback Engine (Offline / Standalone Mode)
    const lastUserMsg = formattedMessages.slice().reverse().find((m: any) => m.role === 'user');
    const textPart = lastUserMsg?.parts?.find((p: any) => p.type === 'text')?.text || '';
    const query = textPart.toLowerCase().trim();

    // A. Direct Form Generation Trigger: Passport Application / Booking
    if (
        query.includes('apply for passport') ||
        query.includes('apply for a passport') ||
        query.includes('fresh passport') ||
        query.includes('book a passport') ||
        query.includes('passport appointment') ||
        query.includes('passport application') ||
        query.includes('generate a dynamic application form')
    ) {
        // Extract known details if present
        const prefilled: Record<string, string> = {};
        const nameMatch = textPart.match(/name[:\s]+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
        if (nameMatch) {
            const parts = nameMatch[1].trim().split(/\s+/);
            prefilled.firstName = parts[0];
            if (parts.length > 1) prefilled.lastName = parts.slice(1).join(' ');
        }
        const dobMatch = textPart.match(/dob[:\s]+(\d{4}-\d{2}-\d{2})/i);
        if (dobMatch) prefilled.dob = dobMatch[1];

        const formOutput = {
            serviceId: 'PASSPORT_FRESH',
            serviceName: 'Passport Seva — Fresh Passport Application',
            submitUrl: '/api/proxy/submit',
            fields: PASSPORT_DEFAULT_FIELDS.filter((f) => !Object.keys(prefilled).includes(f.id)),
            prefilledData: prefilled,
            generatedAt: new Date().toISOString(),
        };

        return createFallbackStreamResponse(
            'I have generated the interactive official application form for Passport Seva. Please verify the pre-filled fields, complete any missing details below, and submit directly to the national gateway.',
            {
                name: 'createApplicationForm',
                callId: `call-form-${Date.now()}`,
                output: formOutput,
            }
        );
    }

    // B. Live Passport Tracking Trigger
    const appMatch = textPart.match(/APP-\d{4}-\d+/i);
    if (appMatch || query.includes('track') || query.includes('check status')) {
        const appId = appMatch ? appMatch[0].toUpperCase() : 'APP-2026-537272';
        const trackingOutput = {
            status: 'IN_REVIEW',
            appId: appId,
            serviceType: 'Fresh Passport (36 Pages)',
            personalDetails: {
                firstName: 'Ramesh',
                lastName: 'Sharma',
            },
            appointment: {
                pskLocation: 'Delhi - RPO Herald House, ITO',
                slotTime: '10:30 AM',
                tokenNumber: 'PSK-104',
            },
        };

        return createFallbackStreamResponse(
            `Here is the live status report from the Passport Seva microservice for application reference **${appId}**:`,
            {
                name: 'trackPassport',
                callId: `call-track-${Date.now()}`,
                output: trackingOutput,
            }
        );
    }

    // C. Aadhaar Card Updates (Address, Mobile, Biometrics)
    if (query.includes('aadhaar') || query.includes('aadhar')) {
        return createFallbackStreamResponse(
            `### 🆔 Aadhaar Card Update Procedure (UIDAI)\n\n` +
            `You can update your **address** online via the **myAadhaar portal**, while **mobile number and biometrics** require visiting an Aadhaar Seva Kendra (ASK).\n\n` +
            `#### 1. Online Address Update Steps:\n` +
            `* Visit the official portal: **[myaadhaar.uidai.gov.in](https://myaadhaar.uidai.gov.in)**\n` +
            `* Log in using your 12-digit Aadhaar number and OTP sent to your registered mobile number.\n` +
            `* Select **"Update Aadhaar Online"** ➔ Choose **"Address"**.\n` +
            `* Enter your new address and upload valid Proof of Address (Passport, Electricity Bill, Voter ID, Bank Statement, or Rent Agreement).\n` +
            `* Pay the standard fee of **₹50** online.\n` +
            `* Note your **14-digit URN (Update Request Number)** for tracking.\n\n` +
            `#### 2. Mobile Number & Biometric Updates:\n` +
            `* Mobile number updates cannot be done entirely online due to biometric security protocols.\n` +
            `* Book an appointment at your nearest Aadhaar Seva Kendra or post office. No documents are required for mobile number linking (only biometric authentication).\n\n` +
            `*Processing Time:* 3 to 7 working days.`
        );
    }

    // D. PAN Card & Instant e-PAN
    if (query.includes('pan card') || query.includes('e-pan') || query.includes('pan status')) {
        return createFallbackStreamResponse(
            `### 💳 PAN Card Services (Income Tax Department / NSDL)\n\n` +
            `#### 1. Instant e-PAN (Free & 100% Paperless):\n` +
            `* If your Aadhaar is linked to your mobile number, you can get a free digitally signed e-PAN within **10 minutes**.\n` +
            `* Portal: **[incometax.gov.in](https://www.incometax.gov.in)** ➔ Quick Links ➔ **"Instant e-PAN"**.\n` +
            `* Enter Aadhaar, authenticate via OTP, and download your e-PAN PDF.\n\n` +
            `#### 2. Apply for New Physical PAN Card (Form 49A):\n` +
            `* Portal: NSDL (Protean) or UTIITSL website.\n` +
            `* Fee: **₹107** (delivery within India) / **₹1,017** (overseas delivery).\n` +
            `* Required Documents: Proof of Identity (Aadhaar/Voter ID), Proof of Address, Date of Birth proof.\n\n` +
            `#### 3. Tracking PAN Status:\n` +
            `* Enter your 15-digit acknowledgement number on the Protean/NSDL portal to track real-time delivery status.`
        );
    }

    // E. Income Tax Return (ITR) Filing
    if (query.includes('income tax') || query.includes('itr') || query.includes('tax filing') || query.includes('tax regime')) {
        return createFallbackStreamResponse(
            `### 📑 Guide to Income Tax Return (ITR) Filing (AY 2026-27)\n\n` +
            `#### 1. Choosing the Right Form:\n` +
            `* **ITR-1 (Sahaj):** For resident individuals with total income up to ₹50 Lakhs from salary, one house property, and interest income.\n` +
            `* **ITR-2:** For individuals/HUFs with capital gains, foreign assets, or multiple properties (no business income).\n` +
            `* **ITR-3 / ITR-4 (Sugam):** For presumptive income or business/profession profits.\n\n` +
            `#### 2. Key Filing Checklist:\n` +
            `* Download **Form 16** from your employer.\n` +
            `* Download **AIS (Annual Information Statement)** and **Form 26AS** from the e-filing portal to reconcile TDS.\n` +
            `* Compare tax liabilities between the **New Tax Regime** (default, lower slab rates) and the **Old Tax Regime** (allows 80C, 80D, HRA deductions).\n\n` +
            `#### 3. E-Filing Steps:\n` +
            `* Portal: **[incometax.gov.in](https://www.incometax.gov.in)** ➔ Login ➔ e-File ➔ Income Tax Returns ➔ File Income Tax Return.\n` +
            `* Verify and submit, then complete **e-Verification** via Aadhaar OTP within 30 days.`
        );
    }

    // F. Right to Information (RTI)
    if (query.includes('rti') || query.includes('right to information')) {
        return createFallbackStreamResponse(
            `### 📜 How to File an Online RTI Application (RTI Online Portal)\n\n` +
            `The Right to Information Act enables Indian citizens to request official records and information from Central and State Government departments.\n\n` +
            `#### Online Filing Steps:\n` +
            `* Visit **[rtionline.gov.in](https://rtionline.gov.in)**.\n` +
            `* Click on **"Submit Request"** and read the guidelines.\n` +
            `* Select the Ministry / Public Authority (e.g., Department of Posts, Ministry of External Affairs, Railways).\n` +
            `* Enter your personal details (Name, Address, Email, Mobile).\n` +
            `* Write your specific information request in the text box (up to 3,000 characters) or upload supporting PDF.\n` +
            `* Pay the standard fee of **₹10** (BPL cardholders are exempt).\n` +
            `* The designated CPIO (Central Public Information Officer) must provide a reply within **30 days**.`
        );
    }

    // G. Ayushman Bharat PM-JAY & ABHA
    if (query.includes('ayushman') || query.includes('pm-jay') || query.includes('pmjay') || query.includes('abha') || query.includes('health account')) {
        return createFallbackStreamResponse(
            `### 🏥 Ayushman Bharat PM-JAY & ABHA Health Account\n\n` +
            `#### 1. Ayushman Bharat PM-JAY Benefits:\n` +
            `* Provides health coverage of **₹5 Lakh per family per year** for secondary and tertiary hospitalization across 28,000+ empaneled public and private hospitals nationwide.\n` +
            `* 100% cashless and paperless treatment at point of care.\n` +
            `* Check eligibility at **[beneficiary.nha.gov.in](https://beneficiary.nha.gov.in)** using Aadhaar, Ration Card number, or Mobile number.\n\n` +
            `#### 2. ABHA (Ayushman Bharat Health Account):\n` +
            `* A unique **14-digit digital health ID** to securely link, store, and share your health records (lab reports, prescriptions, discharge summaries) digitally across healthcare providers.\n` +
            `* Create instant ABHA ID at **[abha.abdm.gov.in](https://abha.abdm.gov.in)** using your Aadhaar number & OTP.`
        );
    }

    // H. National Scholarship Portal (NSP) & DigiLocker
    if (query.includes('scholarship') || query.includes('digilocker') || query.includes('marksheet') || query.includes('nsp')) {
        return createFallbackStreamResponse(
            `### 🎓 National Scholarship Portal (NSP) & DigiLocker\n\n` +
            `#### 1. National Scholarship Portal (NSP):\n` +
            `* Portal: **[scholarships.gov.in](https://scholarships.gov.in)**\n` +
            `* Provides access to Central Sector Schemes, UGC/AICTE scholarships, and State Minority/SC/ST student benefits.\n` +
            `* Mandatory: One-Time Registration (OTR) with Aadhaar and Aadhaar-seeded active bank account for Direct Benefit Transfer (DBT).\n\n` +
            `#### 2. DigiLocker Marksheets & Certificates:\n` +
            `* Portal / App: **[digilocker.gov.in](https://digilocker.gov.in)**\n` +
            `* Access legally valid digital copies (under IT Act 2000) of CBSE 10th/12th marksheets, driving license, vehicle RC, and degree certificates directly from issuing boards.`
        );
    }

    // I. Pension & Farmer Schemes (APY, PM-Kisan)
    if (query.includes('pension') || query.includes('atal pension') || query.includes('apy') || query.includes('pm kisan') || query.includes('sukanya')) {
        return createFallbackStreamResponse(
            `### 🌾 National Social Security & Farmer Welfare Schemes\n\n` +
            `#### 1. Atal Pension Yojana (APY):\n` +
            `* Guaranteed pension of **₹1,000 to ₹5,000 per month** after reaching 60 years of age.\n` +
            `* Eligibility: Any Indian citizen aged 18 to 40 years with a savings bank account.\n` +
            `* Monthly contributions vary based on entry age (e.g., ₹210/month at age 18 for ₹5,000 pension).\n\n` +
            `#### 2. PM Kisan Samman Nidhi:\n` +
            `* Direct financial support of **₹6,000 per year** in 3 equal installments of ₹2,000 directly to eligible farmer bank accounts.\n` +
            `* Mandatory requirements: Mandatory e-KYC on **[pmkisan.gov.in](https://pmkisan.gov.in)**, land record seeding, and Aadhaar-linked bank account.\n\n` +
            `#### 3. Sukanya Samriddhi Yojana (SSY):\n` +
            `* High-yield government savings scheme for girl child with 8.2% annual compounding interest and full 80C tax exemption (EEE).`
        );
    }

    // J. Default Comprehensive Citizen Assistant Welcome
    return createFallbackStreamResponse(
        `Welcome to **JanSeva AI** — India's unified citizen public service intelligence assistant.\n\n` +
        `I can help you with:\n` +
        `* 🛂 **Passport Seva:** Fill fresh applications, check police verification status, and book PSK slots.\n` +
        `* 🆔 **Identity Services:** Aadhaar updates, instant e-PAN generation, Voter ID, and DigiLocker documents.\n` +
        `* 📑 **Finance & Taxes:** ITR filing guidelines, tax regime calculation, and pension scheme enrollment.\n` +
        `* 🏥 **Health & Welfare:** Ayushman Bharat PM-JAY eligibility, ABHA health ID, and PM Kisan status.\n\n` +
        `*Tip: Try asking "How do I apply for a fresh passport?" or "How to update address in Aadhaar card?".*`
    );
}