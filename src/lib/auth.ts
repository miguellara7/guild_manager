import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { tibiaDataService } from '@/services/tibia-api';
import { LoginCredentials, AuthUser } from '@/types';

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Commented out for build compatibility
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'character-guild',
      credentials: {
        characterName: { 
          label: 'Character Name', 
          type: 'text', 
          placeholder: 'Your character name' 
        },
        guildPassword: { 
          label: 'Guild Password', 
          type: 'password' 
        },
        world: { 
          label: 'World', 
          type: 'text', 
          placeholder: 'e.g., Antica' 
        },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.characterName || !credentials?.guildPassword || !credentials?.world) {
          throw new Error('Missing required credentials');
        }

        const { characterName, guildPassword, world } = credentials as LoginCredentials;

        try {
          // Step 1: Verify character exists in Tibia
          const tibiaCharacter = await tibiaDataService.getCharacter(characterName);
          
          if (!tibiaCharacter.character) {
            throw new Error('Character not found in Tibia database');
          }

          // Step 2: Check if character is in the correct world
          if (tibiaCharacter.character.world.toLowerCase() !== world.toLowerCase()) {
            throw new Error(`Character ${characterName} is not in world ${world}`);
          }

          // Step 3: Find guild and verify password
          let guild = null;
          if (tibiaCharacter.character.guild) {
            guild = await prisma.guild.findUnique({
              where: {
                name_world: {
                  name: tibiaCharacter.character.guild.name,
                  world: world,
                },
              },
            });

            if (!guild) {
              throw new Error('Guild not registered in the system');
            }

            // Verify guild password
            const isValidPassword = await bcrypt.compare(guildPassword, guild.guildPassword);
            if (!isValidPassword) {
              throw new Error('Invalid guild password');
            }
          } else {
            throw new Error('Character must be in a guild to access the system');
          }

          // Step 4: Find or create user
          let user = await prisma.user.findUnique({
            where: { 
              characterName: characterName,
            },
            include: {
              guild: true,
              subscription: true,
            },
          });

          if (!user) {
            // Create new user
            user = await prisma.user.create({
              data: {
                characterName,
                world,
                guildId: guild.id,
                passwordHash: await bcrypt.hash(guildPassword, 12),
                role: 'GUILD_MEMBER',
              },
              include: {
                guild: true,
                subscription: true,
              },
            });
          } else {
            // Update last login
            await prisma.user.update({
              where: { id: user.id },
              data: { 
                lastLoginAt: new Date(),
                guildId: guild.id, // Update guild in case character moved
              },
            });
          }

          // Step 5: Update/create player record
          await prisma.player.upsert({
            where: {
              name_world: {
                name: characterName,
                world: world,
              },
            },
            update: {
              level: tibiaCharacter.character.level,
              vocation: tibiaCharacter.character.vocation,
              guildId: guild.id,
              lastChecked: new Date(),
            },
            create: {
              name: characterName,
              world: world,
              level: tibiaCharacter.character.level,
              vocation: tibiaCharacter.character.vocation,
              guildId: guild.id,
              type: 'GUILD_MEMBER',
            },
          });

          return {
            id: user.id,
            characterName: user.characterName,
            world: user.world,
            role: user.role,
            guildId: user.guildId || undefined,
          };

        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.guildId = user.guildId;
        token.characterName = user.characterName;
        token.world = user.world;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.guildId = token.guildId as string;
        session.user.characterName = token.characterName as string;
        session.user.world = token.world as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log(`User signed in: ${user.characterName} from ${user.world}`);
    },
    async signOut({ session, token }) {
      console.log(`User signed out: ${token?.characterName}`);
    },
  },
};

// Utility functions for authentication
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createGuild(
  name: string,
  world: string,
  password: string,
  type: 'FRIEND' | 'ENEMY' = 'FRIEND'
): Promise<any> {
  // Verify guild exists in Tibia
  const tibiaGuild = await tibiaDataService.getGuild(name, world);
  
  if (!tibiaGuild.guild) {
    throw new Error(`Guild ${name} not found in world ${world}`);
  }

  const hashedPassword = await hashPassword(password);

  return prisma.guild.create({
    data: {
      name,
      world,
      type,
      guildPassword: hashedPassword,
      isMainGuild: true,
    },
  });
}

export async function updateGuildPassword(guildId: string, newPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(newPassword);
  
  await prisma.guild.update({
    where: { id: guildId },
    data: { guildPassword: hashedPassword },
  });
}

export async function checkUserPermissions(
  userId: string,
  requiredRole: 'GUILD_MEMBER' | 'GUILD_ADMIN' | 'SUPER_ADMIN'
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) return false;

  const roleHierarchy = {
    GUILD_MEMBER: 1,
    GUILD_ADMIN: 2,
    SUPER_ADMIN: 3,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

export async function getUserWithGuild(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      guild: {
        include: {
          players: {
            where: { type: 'GUILD_MEMBER' },
            orderBy: { level: 'desc' },
          },
          alertRules: true,
        },
      },
      subscription: true,
      alertRules: true,
    },
  });
}

export async function validateCharacterAccess(
  characterName: string,
  world: string,
  userId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { guild: true },
  });

  if (!user || !user.guild) return false;

  // Check if character belongs to the user
  if (user.characterName === characterName && user.world === world) {
    return true;
  }

  // Check if character is a guild member (for guild admins)
  if (user.role === 'GUILD_ADMIN' || user.role === 'SUPER_ADMIN') {
    const player = await prisma.player.findUnique({
      where: {
        name_world: { name: characterName, world: world },
      },
    });

    return player?.guildId === user.guildId;
  }

  return false;
}

export async function syncCharacterWithTibia(characterName: string, world: string): Promise<void> {
  try {
    const tibiaCharacter = await tibiaDataService.getCharacter(characterName);
    
    if (!tibiaCharacter.character) {
      throw new Error('Character not found in Tibia');
    }

    const character = tibiaCharacter.character;
    
    // Update player record
    await prisma.player.upsert({
      where: {
        name_world: { name: characterName, world: world },
      },
      update: {
        level: character.level,
        vocation: character.vocation,
        lastChecked: new Date(),
      },
      create: {
        name: characterName,
        world: world,
        level: character.level,
        vocation: character.vocation,
        type: 'GUILD_MEMBER',
      },
    });

    console.log(`Synced character ${characterName} from Tibia`);
  } catch (error) {
    console.error(`Failed to sync character ${characterName}:`, error);
    throw error;
  }
}
