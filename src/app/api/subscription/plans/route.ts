import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/services/subscription-service';

export async function GET(request: NextRequest) {
  try {
    const plans = subscriptionService.getPlans();
    
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Subscription plans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}


