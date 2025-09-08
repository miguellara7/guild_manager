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
    const guildConfiguration = await prisma.guildConfiguration.findFirst({
      where: {
        id: resolvedParams.id,
        worldSubscription: {
          userId: user.id,
        },
      },
    });

    if (!guildConfiguration) {
      return NextResponse.json({ error: 'Guild configuration not found' }, { status: 404 });
    }

    // Update guild configuration
    const updatedConfiguration = await prisma.guildConfiguration.update({
      where: { id: resolvedParams.id },
      data: { isActive },
      include: {
        worldSubscription: {
          select: {
            world: true,
          },
        },
        guild: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedConfiguration.id,
      worldSubscriptionId: updatedConfiguration.worldSubscriptionId,
      world: updatedConfiguration.worldSubscription.world,
      guildName: updatedConfiguration.guild.name,
      type: updatedConfiguration.type,
      isActive: updatedConfiguration.isActive,
    });
  } catch (error) {
    console.error('Update guild configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to update guild configuration' },
      { status: 500 }
    );
  }
}

