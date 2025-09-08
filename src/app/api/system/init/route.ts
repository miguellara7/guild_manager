import { NextRequest, NextResponse } from 'next/server';
import { backgroundJobManager } from '@/lib/background-jobs';

export async function POST(request: NextRequest) {
  try {
    // Check if request is from localhost or has admin privileges
    const authHeader = request.headers.get('authorization');
    const isLocalhost = request.headers.get('host')?.includes('localhost');
    
    if (!isLocalhost && authHeader !== `Bearer ${process.env.SYSTEM_ADMIN_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await backgroundJobManager.initialize();

    return NextResponse.json({
      success: true,
      message: 'Background jobs initialized successfully',
      status: backgroundJobManager.getStatus(),
    });
  } catch (error) {
    console.error('System initialization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize system',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = backgroundJobManager.getStatus();
    
    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('System status error:', error);
    return NextResponse.json(
      { error: 'Failed to get system status' },
      { status: 500 }
    );
  }
}
