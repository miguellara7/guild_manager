import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { validateWorld } from '@/lib/tibia-api';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const world = searchParams.get('world');

    if (!world) {
      return NextResponse.json({ error: 'World parameter is required' }, { status: 400 });
    }

    // Validate world exists using TibiaData API
    const isValid = await validateWorld(world);

    return NextResponse.json({ 
      world: world,
      valid: isValid 
    });
  } catch (error) {
    console.error('World validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate world' },
      { status: 500 }
    );
  }
}


