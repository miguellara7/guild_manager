import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
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
        console.log('🔍 Login attempt:', credentials);
        
        if (!credentials?.characterName || !credentials?.guildPassword || !credentials?.world) {
          console.log('❌ Missing credentials');
          throw new Error('Missing required credentials');
        }

        const { characterName, guildPassword, world } = credentials as LoginCredentials;

        try {
          console.log(`🔍 Looking for character: ${characterName} in world ${world}`);
          
          // Step 1: Try to find registered user first
          let user = await prisma.user.findUnique({
            where: { characterName: characterName },
            include: {
              guild: true,
              subscription: true,
            },
          });

          if (user) {
            console.log(`✅ Registered user found: ${user.characterName}, Role: ${user.role}`);

            // Check world matches
            if (user.world !== world) {
              console.log(`❌ World mismatch: expected ${user.world}, got ${world}`);
              throw new Error(`Character ${characterName} is not in world ${world}`);
            }

            // Verify guild password
            if (!user.guild) {
              console.log('❌ User has no guild');
              throw new Error('User must be in a guild');
            }

            console.log(`🏰 Checking guild password for: ${user.guild.name}`);
            const isValidPassword = await bcrypt.compare(guildPassword, user.guild.guildPassword);
            if (!isValidPassword) {
              console.log('❌ Invalid guild password');
              throw new Error('Invalid guild password');
            }

            console.log('✅ Guild password valid for registered user');
          } else {
            // Step 2: Look for character in Player table (ally/enemy member)
            console.log(`🔍 Looking for player character: ${characterName} in world ${world}`);
            
            const player = await prisma.player.findUnique({
              where: {
                name_world: {
                  name: characterName,
                  world: world,
                },
              },
              include: {
                guild: true,
              },
            });

            if (!player) {
              console.log('❌ Character not found in any guild');
              throw new Error('Character not found');
            }

            if (!player.guild) {
              console.log('❌ Player has no guild');
              throw new Error('Character must be in a guild');
            }

            console.log(`🏰 Player found in guild: ${player.guild.name}, checking password`);

            // Verify guild password
            const isValidPassword = await bcrypt.compare(guildPassword, player.guild.guildPassword);
            if (!isValidPassword) {
              console.log('❌ Invalid guild password');
              throw new Error('Invalid guild password');
            }

            console.log('✅ Guild password valid for player character');

            // Create temporary user object for ally/enemy members
            user = {
              id: `player_${player.id}`,
              characterName: player.name,
              world: player.world,
              role: player.type === 'EXTERNAL_FRIEND' ? 'GUILD_MEMBER' : 'GUILD_MEMBER',
              guildId: player.guildId,
              guild: player.guild,
              subscription: null,
            } as any;
          }

          // Step 3: Update last login (only for registered users)
          if (!user.id.startsWith('player_')) {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            });
          }

          console.log('✅ Login successful');

          return {
            id: user.id,
            characterName: user.characterName,
            world: user.world,
            role: user.role,
            guildId: user.guildId || undefined,
          };

        } catch (error) {
          console.error('❌ Authentication error:', error);
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
      console.log(`✅ User signed in: ${user.characterName} from ${user.world}`);
    },
    async signOut({ session, token }) {
      console.log(`👋 User signed out: ${token?.characterName}`);
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Utility functions for authentication
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
