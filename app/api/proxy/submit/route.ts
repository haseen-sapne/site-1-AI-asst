import { NextResponse } from 'next/server';

const rawSite3Url = process.env.SITE_3_URL || 'http://localhost:3002';
const SITE_3_URL = rawSite3Url.replace(/\/+$/, '');

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log('[proxy/submit] Forwarding to Site 3:', JSON.stringify(body).substring(0, 300));

        const res = await fetch(`${SITE_3_URL}/api/appointments/draft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        console.log('[proxy/submit] Site 3 response:', res.status, JSON.stringify(data).substring(0, 300));

        if (!res.ok) {
            return NextResponse.json(
                { success: false, error: data?.error || data?.message || 'Submission failed on Site 3.' },
                { status: res.status }
            );
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error('[proxy/submit] Error:', err?.message || err);
        return NextResponse.json(
            { success: false, error: 'Could not connect to Passport Seva servers.' },
            { status: 502 }
        );
    }
}
