import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updatePasswordSchema = z.object({
  guildId: z.string().min(1, 'Guild ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    
    // Only Guild Admin can update passwords
    if (user.role !== 'GUILD_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = updatePasswordSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { guildId, password } = validationResult.data;

    // Verify the guild exists and user has access to it
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      include: {
        guildConfigurations: {
          include: {
            worldSubscription: true,
          },
        },
      },
    });

    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    // Check if user has access to this guild through their world subscriptions
    const hasAccess = guild.guildConfigurations.some(
      config => config.worldSubscription.userId === user.id
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this guild' }, { status: 403 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update guild password
    await prisma.guild.update({
      where: { id: guildId },
      data: { guildPassword: hashedPassword },
    });

    console.log(`✅ Password updated for guild: ${guild.name} by ${user.characterName}`);

    return NextResponse.json({ 
      success: true, 
      message: `Password updated for ${guild.name}` 
    });

  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json(
      { error: 'Failed to update guild password' },
      { status: 500 }
    );
  }
}
