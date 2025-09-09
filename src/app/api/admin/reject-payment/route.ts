import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const rejectPaymentSchema = z.object({
  paymentId: z.string().min(1),
  reason: z.string().min(1, 'Rejection reason is required'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has super admin permissions
    if (session.user.role !== 'SUPER_ADMIN') {
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

    const { paymentId, reason } = validationResult.data;

    // Update payment verification status
    await prisma.paymentVerification.update({
      where: { id: paymentId },
      data: {
        status: 'REJECTED',
        verifiedAt: new Date(),
        verifiedBy: session.user.id,
        notes: reason,
      },
    });

    // Update associated payment status
    const verification = await prisma.paymentVerification.findUnique({
      where: { id: paymentId },
      include: { payment: true },
    });

    if (verification?.payment) {
      await prisma.payment.update({
        where: { id: verification.payment.id },
        data: { status: 'FAILED' },
      });
    }

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


