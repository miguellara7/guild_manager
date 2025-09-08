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

    // Get user's guild configurations
    const guildConfigurations = await prisma.guildConfiguration.findMany({
      where: {
        worldSubscription: {
          userId: user.id,
        },
      },
      include: {
        worldSubscription: {
          select: {
            world: true,
          },
        },
        guild: {
          select: {
            name: true,
            _count: {
              select: {
                players: true,
              },
            },
            lastSyncAt: true,
          },
        },
      },
      orderBy: [
        { type: 'asc' }, // MAIN first, then ALLY, then ENEMY
        { priority: 'asc' },
      ],
    });

    // Format response
    const formattedConfigurations = guildConfigurations.map(config => ({
      id: config.id,
      worldSubscriptionId: config.worldSubscriptionId,
      world: config.worldSubscription.world,
      guildName: config.guild.name,
      type: config.type,
      priority: config.priority,
      isActive: config.isActive,
      playerCount: config.guild._count.players,
      lastSync: config.guild.lastSyncAt?.toISOString() || config.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedConfigurations);
  } catch (error) {
    console.error('Guild configurations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guild configurations' },
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
    const { worldSubscriptionId, guildName, type } = await request.json();

    if (!worldSubscriptionId || !guildName || !type) {
      return NextResponse.json({ 
        error: 'World subscription, guild name, and type are required' 
      }, { status: 400 });
    }

    // Verify world subscription ownership
    const worldSubscription = await prisma.worldSubscription.findFirst({
      where: {
        id: worldSubscriptionId,
        userId: user.id,
      },
    });

    if (!worldSubscription) {
      return NextResponse.json({ error: 'World subscription not found' }, { status: 404 });
    }

    // Check guild limit for this world
    const currentGuildCount = await prisma.guildConfiguration.count({
      where: {
        worldSubscriptionId: worldSubscriptionId,
        isActive: true,
      },
    });

    if (currentGuildCount >= worldSubscription.maxGuilds) {
      return NextResponse.json({ 
        error: `Guild limit reached for this world (${worldSubscription.maxGuilds})` 
      }, { status: 400 });
    }

    // Find or create the guild
    let guild = await prisma.guild.findUnique({
      where: {
        name_world: {
          name: guildName,
          world: worldSubscription.world,
        },
      },
    });

    if (!guild) {
      // Create guild with a temporary password (will be updated when synced)
      const bcrypt = await import('bcryptjs');
      const tempPassword = await bcrypt.hash('temp', 12);
      
      guild = await prisma.guild.create({
        data: {
          name: guildName,
          world: worldSubscription.world,
          type: type === 'ENEMY' ? 'ENEMY' : 'FRIEND',
          guildPassword: tempPassword,
          description: `Auto-created for ${type} tracking`,
        },
      });
    }

    // Check if configuration already exists
    const existingConfig = await prisma.guildConfiguration.findUnique({
      where: {
        worldSubscriptionId_guildId: {
          worldSubscriptionId: worldSubscriptionId,
          guildId: guild.id,
        },
      },
    });

    if (existingConfig) {
      return NextResponse.json({ error: 'Guild already configured for this world' }, { status: 400 });
    }

    // Create guild configuration
    const newConfiguration = await prisma.guildConfiguration.create({
      data: {
        worldSubscriptionId: worldSubscriptionId,
        guildId: guild.id,
        type: type,
        priority: currentGuildCount + 1,
      },
      include: {
        worldSubscription: {
          select: {
            world: true,
          },
        },
        guild: {
          select: {
            name: true,
            _count: {
              select: {
                players: true,
              },
            },
            lastSyncAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: newConfiguration.id,
      worldSubscriptionId: newConfiguration.worldSubscriptionId,
      world: newConfiguration.worldSubscription.world,
      guildName: newConfiguration.guild.name,
      type: newConfiguration.type,
      priority: newConfiguration.priority,
      isActive: newConfiguration.isActive,
      playerCount: newConfiguration.guild._count.players,
      lastSync: newConfiguration.guild.lastSyncAt?.toISOString() || newConfiguration.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Create guild configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to create guild configuration' },
      { status: 500 }
    );
  }
}
