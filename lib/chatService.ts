import { DynamicFormSchema } from "@/components/widgets/DynamicFormRenderer";

export interface ChatApiResponse {
  type: "text" | "form";
  text?: string;
  schema?: DynamicFormSchema;
}

export function generateChatResponse(userInput: string): ChatApiResponse {
  const query = (userInput || "").toLowerCase().trim();

  // 1. Traffic Challan / Fines / DL01AB1234 / MH02CD5678
  if (
    query.includes("challan") ||
    query.includes("fine") ||
    query.includes("traffic") ||
    query.includes("dl01ab1234") ||
    query.includes("mh02cd5678") ||
    query.includes("vehicle") ||
    query.includes("speeding")
  ) {
    const isPriya = query.includes("mh02cd5678");
    const vehNo = isPriya ? "MH02CD5678" : "DL01AB1234";
    const owner = isPriya ? "Priya Patel" : "Ramesh Sharma";

    return {
      type: "form",
      text: "I found a pending traffic violation record. Please review the details below and proceed with e-Challan payment.",
      schema: {
        form_title: "e-Challan Traffic Violation Settlement",
        target_action: "Pay e-Challan (₹1,000)",
        fields: [
          {
            id: "vehicle_number",
            label: "Vehicle Registration Number",
            type: "text",
            defaultValue: vehNo,
            required: true,
          },
          {
            id: "challan_number",
            label: "Challan Notice ID",
            type: "text",
            defaultValue: "CH-2026-88349",
            required: true,
          },
          {
            id: "owner_name",
            label: "Registered Vehicle Owner",
            type: "text",
            defaultValue: owner,
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
              "Red Light Signal Jump (Sec 184 MVA)",
              "Over Speeding (Sec 183 MVA)",
              "Driving Without Seatbelt / Helmet",
              "Unauthorized Parking in Red Zone",
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
    };
  }

  // 2. Passport Application / Appointment / Tatkaal
  if (
    query.includes("passport") ||
    query.includes("appointment") ||
    query.includes("tatkaal") ||
    query.includes("seva kendra")
  ) {
    return {
      type: "form",
      text: "I've generated the Passport Seva Kendra Appointment form for you. Fill in your details to reserve your biometric verification slot.",
      schema: {
        form_title: "Passport Seva Kendra Appointment Booking",
        target_action: "Confirm Appointment & Pay Fee",
        fields: [
          {
            id: "applicant_name",
            label: "Full Legal Name (as per ID)",
            type: "text",
            placeholder: "e.g. Ramesh Sharma",
            required: true,
          },
          {
            id: "dob",
            label: "Date of Birth",
            type: "date",
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
              "Delhi - RPO Herald House, ITO",
              "Mumbai - RPO Bandra Kurla Complex",
              "Bengaluru - RPO Koramangala",
              "Hyderabad - RPO Secunderabad",
              "Kolkata - RPO Anandapur",
              "Chennai - RPO Rayala Towers",
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
            required: true,
          },
        ],
      },
    };
  }

  // 3. RTI (Right to Information)
  if (
    query.includes("rti") ||
    query.includes("right to information") ||
    query.includes("grievance") ||
    query.includes("complaint")
  ) {
    return {
      type: "form",
      text: "Here is your Right to Information (RTI) filing draft. You can describe your query and select the target public authority.",
      schema: {
        form_title: "Central RTI Public Information Request",
        target_action: "Submit RTI Request (₹10 Fee)",
        fields: [
          {
            id: "applicant_name",
            label: "Citizen Full Name",
            type: "text",
            placeholder: "Enter full name",
            required: true,
          },
          {
            id: "email",
            label: "Email Address for RTI Response",
            type: "email",
            placeholder: "citizen@example.gov.in",
            required: true,
          },
          {
            id: "public_authority",
            label: "Public Authority / Ministry",
            type: "select",
            options: [
              "Ministry of Road Transport and Highways",
              "Ministry of External Affairs",
              "Department of Revenue (CBDT / CBIC)",
              "Ministry of Housing and Urban Affairs",
              "Unique Identification Authority of India",
            ],
            required: true,
          },
          {
            id: "rti_subject",
            label: "Subject Matter of Request",
            type: "text",
            placeholder: "e.g., Road repair sanction timeline in Ward 42",
            required: true,
          },
          {
            id: "rti_text",
            label: "Information Requested (Max 3000 chars)",
            type: "textarea",
            placeholder: "Specify details of records, circulars, or inspection dates required under Sec 6(1) of the RTI Act 2005...",
            required: true,
          },
        ],
      },
    };
  }

  // 4. Driving Licence Renewal
  if (
    query.includes("driving licence") ||
    query.includes("dl") ||
    query.includes("license") ||
    query.includes("licence")
  ) {
    return {
      type: "form",
      text: "I've structured a Driving Licence Renewal & Endorsement application form for Sarathi Parivahan.",
      schema: {
        form_title: "Driving Licence Renewal & Verification",
        target_action: "Submit DL Renewal Request",
        fields: [
          {
            id: "applicant_name",
            label: "Full Name",
            type: "text",
            required: true,
          },
          {
            id: "dl_number",
            label: "Existing Driving Licence Number",
            type: "text",
            defaultValue: "DL-0420180092144",
            required: true,
          },
          {
            id: "dob",
            label: "Date of Birth",
            type: "date",
            required: true,
          },
          {
            id: "rto_office",
            label: "State RTO Jurisdiction",
            type: "select",
            options: [
              "Delhi DL-01 (Mall Road RTO)",
              "Delhi DL-04 (Janakpuri RTO)",
              "Maharashtra MH-02 (Andheri RTO)",
              "Karnataka KA-01 (Koramangala RTO)",
            ],
            required: true,
          },
          {
            id: "blood_group",
            label: "Blood Group",
            type: "select",
            options: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
            required: true,
          },
        ],
      },
    };
  }

  // 5. Default Conversational / Informational response
  return {
    type: "text",
    text: `I understand you're inquiring about "${userInput}". As JanSeva AI, I can generate dynamic forms for public services such as e-Challan payments, Passport Seva appointments, RTI filings, and DL renewal. Try asking: "Check fines for DL01AB1234" or "Book a passport appointment".`,
  };
}
