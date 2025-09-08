import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const resolvedParams = await params;

    // Verify ownership
    const guildConfiguration = await prisma.guildConfiguration.findFirst({
      where: {
        id: resolvedParams.id,
        worldSubscription: {
          userId: user.id,
        },
      },
      include: {
        guild: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!guildConfiguration) {
      return NextResponse.json({ error: 'Guild configuration not found' }, { status: 404 });
    }

    // Delete the guild configuration
    await prisma.guildConfiguration.delete({
      where: { id: resolvedParams.id }
    });

    // Delete all players from this guild
    await prisma.player.deleteMany({
      where: { guildId: guildConfiguration.guild.id }
    });

    // Check if guild is used in other configurations
    const otherConfigurations = await prisma.guildConfiguration.count({
      where: { guildId: guildConfiguration.guild.id }
    });

    // If no other configurations use this guild, delete the guild
    if (otherConfigurations === 0) {
      await prisma.guild.delete({
        where: { id: guildConfiguration.guild.id }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Guild configuration for ${guildConfiguration.guild.name} deleted successfully`
    });

  } catch (error) {
    console.error('Delete guild configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to delete guild configuration' },
      { status: 500 }
    );
  }
}

