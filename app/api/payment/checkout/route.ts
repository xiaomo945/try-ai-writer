import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    
    if (!plan || !['pro', 'max', 'team'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan specified' },
        { status: 400 }
      );
    }
    
    const provider = getPaymentProvider();
    if (!provider) {
      return NextResponse.json(
        { error: 'Payment provider not configured' },
        { status: 500 }
      );
    }
    
    const session = await provider.createCheckoutSession(plan);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}