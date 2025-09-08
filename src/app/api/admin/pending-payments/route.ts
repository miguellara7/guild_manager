import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, checkUserPermissions } from '@/lib/auth';
import { subscriptionService } from '@/services/subscription-service';

export async function GET(request: NextRequest) {
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

    const pendingVerifications = await subscriptionService.getPendingVerifications();
    
    return NextResponse.json(pendingVerifications);
  } catch (error) {
    console.error('Pending payments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    );
  }
}


