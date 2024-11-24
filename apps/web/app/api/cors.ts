import { NextResponse } from 'next/server';

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function corsResponse(data: any) {
  return new NextResponse(JSON.stringify(data), {
    headers: corsHeaders(),
  });
}

export async function corsOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
