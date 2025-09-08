import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const { isActive } = await request.json();
    const resolvedParams = await params;

    // Verify ownership
    const worldSubscription = await prisma.worldSubscription.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
    });

    if (!worldSubscription) {
      return NextResponse.json({ error: 'World subscription not found' }, { status: 404 });
    }

    // Update world subscription
    const updatedSubscription = await prisma.worldSubscription.update({
      where: { id: resolvedParams.id },
      data: { isActive },
    });

    return NextResponse.json({
      id: updatedSubscription.id,
      world: updatedSubscription.world,
      isActive: updatedSubscription.isActive,
      maxGuilds: updatedSubscription.maxGuilds,
    });
  } catch (error) {
    console.error('Update world subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to update world subscription' },
      { status: 500 }
    );
  }
}

