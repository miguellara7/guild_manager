import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { searchGuildsByName, getGuildBasicInfo } from '@/lib/tibia-api';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const world = searchParams.get('world');

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    if (!world) {
      return NextResponse.json({ error: 'World parameter is required' }, { status: 400 });
    }

    // Search for guilds using TibiaData API
    const tibiaGuilds = await searchGuildsByName(world, query);

    // Format response with additional info
    const formattedGuilds = await Promise.all(
      tibiaGuilds.slice(0, 10).map(async (guild) => {
        const basicInfo = await getGuildBasicInfo(guild.name, world);
        return {
          id: `tibia-${guild.name.toLowerCase().replace(/\s+/g, '-')}`, // Generate consistent ID
          name: guild.name,
          world: world,
          description: guild.description || 'No description available',
          memberCount: basicInfo?.memberCount || 0,
          playerCount: basicInfo?.playerCount || 0,
          logo_url: guild.logo_url,
          source: 'tibiadata', // Indicate this comes from TibiaData
        };
      })
    );

    return NextResponse.json(formattedGuilds);
  } catch (error) {
    console.error('Guild search error:', error);
    
    // Fallback to empty array if TibiaData fails
    return NextResponse.json([]);
  }
}
