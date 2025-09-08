import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      characterName: string;
      world: string;
      role: string;
      guildId?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    characterName: string;
    world: string;
    role: string;
    guildId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    characterName: string;
    world: string;
    role: string;
    guildId?: string;
  }
}
