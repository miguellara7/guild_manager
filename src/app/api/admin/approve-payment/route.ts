import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, checkUserPermissions } from '@/lib/auth';
import { subscriptionService } from '@/services/subscription-service';
import { z } from 'zod';

const approvePaymentSchema = z.object({
  verificationId: z.string().min(1),
  notes: z.string().optional(),
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
    const validationResult = approvePaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { verificationId, notes } = validationResult.data;

    // Approve payment
    await subscriptionService.approvePayment(verificationId, session.user.id, notes);

    return NextResponse.json({
      success: true,
      message: 'Payment approved successfully',
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to approve payment' },
      { status: 500 }
    );
  }
}


