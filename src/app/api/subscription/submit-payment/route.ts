import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { subscriptionService } from '@/services/subscription-service';
import { z } from 'zod';

const paymentRequestSchema = z.object({
  plan: z.enum(['BASIC', 'EXTENDED']),
  amount: z.number().positive(),
  additionalWorlds: z.number().min(1).max(10).optional(),
  transferDetails: z.object({
    fromCharacter: z.string().min(1).max(30),
    toCharacter: z.string().min(1).max(30),
    timestamp: z.string(),
    screenshot: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request data
    const validationResult = paymentRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { plan, amount, additionalWorlds, transferDetails } = validationResult.data;

    // Submit payment request
    const paymentId = await subscriptionService.submitPaymentRequest({
      userId: session.user.id,
      characterName: session.user.characterName,
      world: session.user.world,
      amount,
      plan,
      additionalWorlds,
      transferDetails: {
        ...transferDetails,
        timestamp: new Date(transferDetails.timestamp),
      },
    });

    return NextResponse.json({
      success: true,
      paymentId,
      message: 'Payment submitted successfully for verification',
    });
  } catch (error) {
    console.error('Payment submission error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to submit payment' },
      { status: 500 }
    );
  }
}


