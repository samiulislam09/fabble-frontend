import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }
    const apiUrl = process.env.APP_API_URL || 'http://localhost:5001/api';
    const response = await fetch(`${apiUrl}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ success: false, error: data?.message || 'Subscription failed' }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: data?.message || 'Subscribed' }, { status: response.status });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
}
