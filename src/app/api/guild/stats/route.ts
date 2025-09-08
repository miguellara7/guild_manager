import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { getGuildStats } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    
    if (!user.guildId) {
      return NextResponse.json({ error: 'User not in a guild' }, { status: 400 });
    }

    const stats = await getGuildStats(user.guildId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Guild stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guild stats' },
      { status: 500 }
    );
  }
}


