import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { RedisService } from './redis';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

export async function rateLimit(
  key: string,
  limit: number,
  windowInSeconds: number
): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  return RedisService.checkRateLimit(key, limit, windowInSeconds);
}

export function validateApiKey(apiKey: string | null): string {
  if (!apiKey) {
    throw new ApiError(401, 'API key is required');
  }
  return apiKey;
}

export function validateUserId(userId: string | undefined): string {
  if (!userId) {
    throw new ApiError(401, 'User ID is required');
  }
  return userId;
}

export function validatePlanAccess(
  feature: string,
  allowed: boolean,
  message?: string
): void {
  if (!allowed) {
    throw new ApiError(
      403,
      message || `Your current plan does not include access to ${feature}`
    );
  }
}

export function validateResourceOwnership(
  resource: { userId?: string } | null,
  userId: string,
  resourceType: string
): void {
  if (!resource) {
    throw new ApiError(404, `${resourceType} not found`);
  }

  if (resource.userId !== userId) {
    throw new ApiError(403, `You do not have access to this ${resourceType}`);
  }
}

export function validateResourceExists<T>(
  resource: T | null,
  resourceType: string
): T {
  if (!resource) {
    throw new ApiError(404, `${resourceType} not found`);
  }
  return resource;
}

export async function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await handler();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    'Access-Control-Max-Age': '86400',
  };
}

export function addCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  const headers = corsHeaders(origin);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export async function validateSubscriptionActive(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.planType === 'FREE') {
    return;
  }

  if (!user.subscription || user.subscription.status !== 'active') {
    throw new ApiError(403, 'Your subscription is not active');
  }

  const now = new Date();
  if (user.subscription.currentPeriodEnd < now) {
    throw new ApiError(403, 'Your subscription has expired');
  }
}

export async function validateCreditsAvailable(userId: string, amount: number): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.creditsRemaining < amount) {
    throw new ApiError(403, 'Insufficient credits');
  }
}

export async function deductCredits(userId: string, amount: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      creditsRemaining: {
        decrement: amount,
      },
    },
  });
}

export function sanitizeOutput<T extends Record<string, any>>(
  data: T,
  sensitiveFields: string[] = ['password', 'passwordHash', 'apiKey']
): Partial<T> {
  const sanitized = { ...data };
  sensitiveFields.forEach((field) => {
    delete sanitized[field];
  });
  return sanitized;
}
