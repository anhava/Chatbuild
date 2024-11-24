import { NextResponse } from 'next/server';

export async function GET() {
  // Mock response for development
  return NextResponse.json({
    success: true,
    data: {
      messages: [
        'What is your favorite color?',
        'Siblings?',
        'Last vacation?',
        'Dream job?',
        'Pet\'s name?',
        'Favorite sport?',
        'Favorite hobby?',
        'Favorite animal?'
      ]
    }
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // Mock response for development
  return NextResponse.json({
    success: true,
    data: {
      message: `You said: ${body.message}`,
      threadId: '123'
    }
  });
}
