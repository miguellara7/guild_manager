import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, checkUserPermissions } from '@/lib/auth';
import { subscriptionService } from '@/services/subscription-service';
import { z } from 'zod';

const rejectPaymentSchema = z.object({
  verificationId: z.string().min(1),
  reason: z.string().min(1, 'Rejection reason is required'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has super admin permissions
    const hasPermission = await checkUserPermissions(session.user.id, 'SUPER_ADMIN');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate request data
    const validationResult = rejectPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { verificationId, reason } = validationResult.data;

    // Reject payment
    await subscriptionService.rejectPayment(verificationId, session.user.id, reason);

    return NextResponse.json({
      success: true,
      message: 'Payment rejected successfully',
    });
  } catch (error) {
    console.error('Reject payment error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to reject payment' },
      { status: 500 }
    );
  }
}


