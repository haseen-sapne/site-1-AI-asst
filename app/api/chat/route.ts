import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. SCHEMA REGISTRY FOR INDIAN PUBLIC SERVICES
// ==========================================
const SCHEMA_REGISTRY = {
  PARIVAHAN_CHALLAN: {
    form_title: "e-Challan Traffic Violation Settlement",
    target_action: "Submit to Parivahan API",
    fields: [
      {
        id: "vehicle_number",
        label: "Vehicle Registration Number",
        type: "text",
        defaultValue: "DL01AB1234",
        placeholder: "e.g. DL01AB1234",
        required: true,
      },
      {
        id: "challan_number",
        label: "Challan Notice ID",
        type: "text",
        defaultValue: "CH-2026-88349",
        placeholder: "e.g. CH-2026-88349",
        required: true,
      },
      {
        id: "owner_name",
        label: "Registered Vehicle Owner",
        type: "text",
        defaultValue: "Ramesh Sharma",
        placeholder: "e.g. Ramesh Sharma",
        required: true,
      },
      {
        id: "violation_date",
        label: "Violation Date",
        type: "date",
        defaultValue: "2026-02-14",
        required: true,
      },
      {
        id: "violation_type",
        label: "Traffic Offence Type",
        type: "select",
        options: [
          "Over Speeding (Sec 183 MVA) - ₹1,000",
          "Red Light Signal Jump (Sec 184 MVA) - ₹1,000",
          "Driving Without Seatbelt / Helmet - ₹1,000",
          "Unauthorized Parking in Red Zone - ₹500",
        ],
        required: true,
      },
      {
        id: "payment_mode",
        label: "Preferred Payment Mode",
        type: "select",
        options: [
          "UPI (Google Pay / PhonePe / BHIM)",
          "Net Banking (State Bank / HDFC / ICICI)",
          "Debit / Credit Card (RuPay / Visa)",
        ],
        required: true,
      },
    ],
  },
  PASSPORT_APPLY: {
    form_title: "Passport Seva Kendra Appointment Booking",
    target_action: "Submit to Passport Seva API",
    fields: [
      {
        id: "applicant_name",
        label: "Full Legal Name (as per ID)",
        type: "text",
        defaultValue: "Ramesh Sharma",
        placeholder: "e.g. Ramesh Sharma",
        required: true,
      },
      {
        id: "dob",
        label: "Date of Birth",
        type: "date",
        defaultValue: "1990-05-15",
        required: true,
      },
      {
        id: "id_proof",
        label: "Identity Verification Document",
        type: "text",
        defaultValue: "[Aadhaar Redacted]",
        placeholder: "[Aadhaar Redacted]",
        required: true,
      },
      {
        id: "rpo_location",
        label: "Regional Passport Office (RPO)",
        type: "select",
        options: [
          "Delhi PSK - Herald House, ITO",
          "Mumbai PSK - Bandra Kurla Complex",
          "Bengaluru PSK - Koramangala",
          "Hyderabad PSK - Secunderabad",
          "Kolkata PSK - Anandapur",
        ],
        required: true,
      },
      {
        id: "service_type",
        label: "Application Service Scheme",
        type: "select",
        options: [
          "Normal Scheme (36 Pages) - ₹1,500",
          "TatKaal Express Scheme (36 Pages) - ₹3,500",
          "Normal Scheme Jumbo (60 Pages) - ₹2,000",
        ],
        required: true,
      },
      {
        id: "appointment_date",
        label: "Preferred Appointment Slot Date",
        type: "date",
        defaultValue: "2026-03-05",
        required: true,
      },
    ],
  },
};

// ==========================================
// 2. SYSTEM INSTRUCTION / PROMPT GUARD
// ==========================================
const PROMPT_GUARD_INSTRUCTION = `You are an Indian Public Service AI Assistant for "JanSeva AI" (Site 1 Gateway). 
Your objective is to assist Indian citizens with official civic and e-Governance portals.

STRICT DOMAIN GUARDRAILS:
- You MUST NOT answer general queries, write software code, solve math problems, provide cooking recipes, or engage in off-topic discussion.
- You MUST strictly classify the user's intent into EXACTLY ONE of the following 4 JSON formats:

1. CHAT:
Use this ONLY for greetings, identity queries, or asking what JanSeva AI does.
Output JSON:
{
  "intent": "CHAT",
  "response_text": "Namaste! I am JanSeva AI, your digital assistant for Indian public services. I can assist you with Parivahan traffic e-Challan settlements and Passport Seva Kendra appointments. How may I assist you today?"
}

2. OFF_TOPIC:
Use this for any request outside Indian public services (e.g. coding, math, general trivia, stories, recipes).
Output JSON:
{
  "intent": "OFF_TOPIC",
  "response_text": "I am specialized solely as an Indian Public Service Assistant. I can only assist with civic workflows like traffic challan verification and Passport Seva applications."
}

3. PARIVAHAN_CHALLAN:
Use this when the user mentions traffic fines, vehicle challans, driving violations, speeding, signal jumps, or vehicle numbers (e.g., DL01AB1234, MH02CD5678, DL-04).
Output JSON:
{
  "intent": "PARIVAHAN_CHALLAN"
}

4. PASSPORT_APPLY:
Use this when the user inquires about passport applications, Passport Seva Kendra (PSK) appointments, Tatkaal booking, or passport renewal.
Output JSON:
{
  "intent": "PASSPORT_APPLY"
}

SECURITY & COMPLIANCE:
Under NO circumstance should you output actual Aadhaar digits. Aadhaar is always represented strictly as "[Aadhaar Redacted]".
Output valid JSON only.`;

// ==========================================
// 3. FALLBACK INTENT CLASSIFIER (Resilience)
// ==========================================
function fallbackClassifier(userInput: string): {
  intent: "CHAT" | "OFF_TOPIC" | "PARIVAHAN_CHALLAN" | "PASSPORT_APPLY";
  response_text?: string;
} {
  const query = (userInput || "").toLowerCase().trim();

  // Check for off-topic keywords
  const offTopicTriggers = ["recipe", "cook", "code", "python", "javascript", "react", "html", "movie", "song", "joke", "weather", "poem", "essay"];
  if (offTopicTriggers.some((t) => query.includes(t))) {
    return {
      intent: "OFF_TOPIC",
      response_text: "I am specialized solely as an Indian Public Service Assistant. I can only assist with civic workflows like traffic challan verification and Passport Seva applications.",
    };
  }

  // Parivahan Challan
  if (
    query.includes("challan") ||
    query.includes("fine") ||
    query.includes("traffic") ||
    query.includes("dl01ab1234") ||
    query.includes("mh02cd5678") ||
    query.includes("vehicle") ||
    query.includes("speeding")
  ) {
    return { intent: "PARIVAHAN_CHALLAN" };
  }

  // Passport Seva
  if (
    query.includes("passport") ||
    query.includes("appointment") ||
    query.includes("tatkaal") ||
    query.includes("seva kendra") ||
    query.includes("rpo")
  ) {
    return { intent: "PASSPORT_APPLY" };
  }

  // Greetings / Civic Chat
  if (
    query.includes("hi") ||
    query.includes("hello") ||
    query.includes("namaste") ||
    query.includes("help") ||
    query.includes("who are you") ||
    query.length === 0
  ) {
    return {
      intent: "CHAT",
      response_text: "Namaste! I am JanSeva AI, your digital assistant for Indian public services. Try asking: 'Check fines for DL01AB1234' or 'Book a passport appointment'.",
    };
  }

  return {
    intent: "CHAT",
    response_text: `I understand your inquiry. As JanSeva AI, I can generate interactive forms for public services like Parivahan e-Challan payments and Passport Seva Kendra bookings. Try asking: "Check fines for DL01AB1234".`,
  };
}

// ==========================================
// 4. API ROUTE HANDLER (POST)
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = (body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "A valid 'message' string is required in the request body." },
        { status: 400 }
      );
    }

    let parsedIntent: {
      intent: "CHAT" | "OFF_TOPIC" | "PARIVAHAN_CHALLAN" | "PASSPORT_APPLY";
      response_text?: string;
    } | null = null;

    const apiKey = process.env.GEMINI_API_KEY;

    // Try Gemini API if Key is present
    if (apiKey) {
      const candidateModels = [
        "gemini-3.5-flash-lite",
        "gemini-3.6-flash",
        "gemini-1.5-flash",
        "gemini-flash-latest",
      ];

      for (const model of candidateModels) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model,
            contents: message,
            config: {
              responseMimeType: "application/json",
              systemInstruction: PROMPT_GUARD_INSTRUCTION,
            },
          });

          const rawText = response.text || "";
          const result = JSON.parse(rawText);

          if (
            result.intent &&
            ["CHAT", "OFF_TOPIC", "PARIVAHAN_CHALLAN", "PASSPORT_APPLY"].includes(
              result.intent
            )
          ) {
            parsedIntent = result;
            break;
          }
        } catch (genErr) {
          console.warn(`GenAI model ${model} attempt failed, trying next...`);
        }
      }
    }

    // Fallback if LLM was unavailable or response couldn't be parsed
    if (!parsedIntent) {
      parsedIntent = fallbackClassifier(message);
    }

    // Build Response based on Intent
    if (parsedIntent.intent === "PARIVAHAN_CHALLAN") {
      // Dynamic vehicle customization if user specified Priya's vehicle
      const isPriya = message.toLowerCase().includes("mh02cd5678");
      const baseSchema = JSON.parse(JSON.stringify(SCHEMA_REGISTRY.PARIVAHAN_CHALLAN));

      if (isPriya) {
        baseSchema.fields.forEach((f: any) => {
          if (f.id === "vehicle_number") f.defaultValue = "MH02CD5678";
          if (f.id === "owner_name") f.defaultValue = "Priya Patel";
          if (f.id === "challan_number") f.defaultValue = "CH-2026-44120";
        });
      }

      return NextResponse.json({
        type: "form",
        intent: "PARIVAHAN_CHALLAN",
        text: "I found a pending traffic violation record matching your query. Please review the details below to settle your e-Challan.",
        schema: baseSchema,
      });
    }

    if (parsedIntent.intent === "PASSPORT_APPLY") {
      const isPriya = message.toLowerCase().includes("priya");
      const baseSchema = JSON.parse(JSON.stringify(SCHEMA_REGISTRY.PASSPORT_APPLY));

      if (isPriya) {
        baseSchema.fields.forEach((f: any) => {
          if (f.id === "applicant_name") f.defaultValue = "Priya Patel";
          if (f.id === "dob") f.defaultValue = "1988-10-22";
          if (f.id === "rpo_location") f.defaultValue = "Mumbai PSK - Bandra Kurla Complex";
        });
      }

      return NextResponse.json({
        type: "form",
        intent: "PASSPORT_APPLY",
        text: "Here is the official Passport Seva Kendra Appointment form. Please verify your details to book your biometric slot.",
        schema: baseSchema,
      });
    }

    if (parsedIntent.intent === "OFF_TOPIC") {
      return NextResponse.json({
        type: "text",
        intent: "OFF_TOPIC",
        text:
          parsedIntent.response_text ||
          "I am specialized solely as an Indian Public Service Assistant. I can only assist with civic workflows like traffic challan verification and Passport Seva applications.",
      });
    }

    // Default CHAT
    return NextResponse.json({
      type: "text",
      intent: "CHAT",
      text:
        parsedIntent.response_text ||
        "Namaste! I am JanSeva AI. You can ask me to check your traffic challans (e.g. 'Check fines for DL01AB1234') or book a passport appointment.",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        type: "text",
        text: "Namaste! I am JanSeva AI. How may I assist you with Indian public services today?",
      },
      { status: 200 }
    );
  }
}
