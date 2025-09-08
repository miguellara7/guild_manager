import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;

    // Get user's world subscriptions
    const worldSubscriptions = await prisma.worldSubscription.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            guildConfigurations: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    const formattedSubscriptions = worldSubscriptions.map(sub => ({
      id: sub.id,
      world: sub.world,
      isActive: sub.isActive,
      maxGuilds: sub.maxGuilds,
      guildCount: sub._count.guildConfigurations,
      createdAt: sub.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedSubscriptions);
  } catch (error) {
    console.error('World subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch world subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const { world } = await request.json();

    if (!world) {
      return NextResponse.json({ error: 'World name is required' }, { status: 400 });
    }

    // Check if user already has this world
    const existingSubscription = await prisma.worldSubscription.findUnique({
      where: {
        userId_world: {
          userId: user.id,
          world: world,
        },
      },
    });

    if (existingSubscription) {
      return NextResponse.json({ error: 'World already exists' }, { status: 400 });
    }

    // Check subscription limits
    const userSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    const currentWorldCount = await prisma.worldSubscription.count({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    const worldLimit = userSubscription?.worldLimit || 1;
    if (currentWorldCount >= worldLimit) {
      return NextResponse.json({ 
        error: `World limit reached (${worldLimit}). Upgrade your subscription.` 
      }, { status: 400 });
    }

    // Create world subscription
    const newSubscription = await prisma.worldSubscription.create({
      data: {
        userId: user.id,
        world: world,
        maxGuilds: 10, // Default max guilds per world
      },
    });

    return NextResponse.json({
      id: newSubscription.id,
      world: newSubscription.world,
      isActive: newSubscription.isActive,
      maxGuilds: newSubscription.maxGuilds,
      guildCount: 0,
      createdAt: newSubscription.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Create world subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create world subscription' },
      { status: 500 }
    );
  }
}


