import { NextResponse } from 'next/server';

const rawSite2Url = process.env.SITE_2_URL || 'http://localhost:3003';
const SITE_2_URL = rawSite2Url.replace(/\/+$/, '');

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(`${SITE_2_URL}/api/challans/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Challan Pay Proxy Error:', error);
        return NextResponse.json({ success: false, error: 'Could not connect to Parivahan payment service' }, { status: 502 });
    }
}