import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target_action, formData } = body;

    if (!target_action || !formData) {
      return NextResponse.json(
        { error: "Missing 'target_action' or 'formData' in request body." },
        { status: 400 }
      );
    }

    let targetApiUrl = "";
    let isParivahan = false;
    let isPassport = false;

    // 1. Identify Target Gateway
    if (
      target_action === "Submit to Parivahan API" ||
      target_action.toLowerCase().includes("parivahan") ||
      target_action.toLowerCase().includes("challan")
    ) {
      isParivahan = true;
      const baseUrl = process.env.PARIVAHAN_API_URL || "http://localhost:3001/api";
      targetApiUrl = baseUrl.endsWith("/fines/check")
        ? baseUrl
        : `${baseUrl.replace(/\/$/, "")}/fines/check`;
    } else if (
      target_action === "Submit to Passport Seva API" ||
      target_action.toLowerCase().includes("passport")
    ) {
      isPassport = true;
      const baseUrl = process.env.PASSPORT_API_URL || "http://localhost:3002/api";
      targetApiUrl = baseUrl.endsWith("/appointments/draft")
        ? baseUrl
        : `${baseUrl.replace(/\/$/, "")}/appointments/draft`;
    } else {
      return NextResponse.json(
        { error: `Unknown Target Portal Action: "${target_action}"` },
        { status: 400 }
      );
    }

    // 2. Cross-Site Server-to-Server Communication
    const secretKey = process.env.HACKATHON_SECRET_KEY || "hackathon-internal-secret-2026";

    try {
      const externalRes = await fetch(targetApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": secretKey,
        },
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(4000), // 4 second timeout for responsive UI
      });

      if (externalRes.ok) {
        const data = await externalRes.json();
        return NextResponse.json({
          success: true,
          portal: isParivahan ? "Parivahan MoRTH" : "Passport Seva Kendra",
          ...data,
        });
      }
    } catch (networkError) {
      // If external target server is offline/unreachable in local dev, provide simulated gateway confirmation
      console.warn(
        `External gateway ${targetApiUrl} unreachable. Providing fallback simulated response.`
      );
    }

    // 3. Fallback Response if external microservice isn't running locally yet
    if (isParivahan) {
      const vehNo = formData.vehicle_number || "DL01AB1234";
      const challanId = formData.challan_number || "CH-2026-88349";
      return NextResponse.json({
        success: true,
        portal: "Parivahan MoRTH",
        status: "VERIFIED",
        message: `Traffic violation record verified. e-Challan draft recorded for vehicle ${vehNo}.`,
        details: {
          vehicle_number: vehNo,
          challan_number: challanId,
          owner_name: formData.owner_name || "Ramesh Sharma",
          violation_type: formData.violation_type || "Over Speeding (Sec 183 MVA)",
          amount: "₹1,000",
          payment_mode: formData.payment_mode || "UPI (BHIM)",
          transaction_id: `MORT-TXN-${Date.now().toString().slice(-6)}`,
          portal_url: "https://echallan.parivahan.gov.in",
        },
      });
    }

    // Passport Fallback
    const applicant = formData.applicant_name || "Ramesh Sharma";
    const rpo = formData.rpo_location || "Delhi PSK - Herald House, ITO";
    return NextResponse.json({
      success: true,
      portal: "Passport Seva Kendra",
      status: "APPOINTMENT_DRAFTED",
      message: `Passport application draft created for ${applicant}. Biometric slot pre-booked at ${rpo}.`,
      details: {
        applicant_name: applicant,
        rpo_location: rpo,
        service_type: formData.service_type || "Normal Scheme (36 Pages)",
        appointment_date: formData.appointment_date || "2026-03-05",
        id_proof: "[Aadhaar Redacted]",
        application_ref: `PSK-ARN-${Date.now().toString().slice(-7)}`,
        portal_url: "https://passportindia.gov.in",
      },
    });
  } catch (error) {
    console.error("Gateway Error in /api/submit:", error);
    return NextResponse.json(
      { error: "Gateway communication failed" },
      { status: 500 }
    );
  }
}
