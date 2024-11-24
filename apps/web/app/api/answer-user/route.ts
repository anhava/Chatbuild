import { corsHeaders, corsOptions } from '../cors';
import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // Mock response for development
  return NextResponse.json(`I received your message: "${body.message}". This is a mock response from the local development server.`, {
    headers: corsHeaders()
  });
}
