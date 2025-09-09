import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  characterName: z.string().min(1).max(30),
  world: z.string().min(1).max(30),
  guildName: z.string().min(1).max(50),
  password: z.string().min(6).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { characterName, world, guildName, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        characterName,
        world,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this character name and world already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create or find guild
    let guild = await prisma.guild.findFirst({
      where: {
        name: guildName,
        world,
      },
    });

    if (!guild) {
      guild = await prisma.guild.create({
        data: {
          name: guildName,
          world,
          type: 'MAIN',
          isMainGuild: true,
          guildPassword: hashedPassword, // Use same password for guild
          description: `Main guild for ${guildName}`,
          isActive: true,
        },
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        characterName,
        world,
        role: 'GUILD_ADMIN', // First user is guild admin
        guildId: guild.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        characterName: user.characterName,
        world: user.world,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
