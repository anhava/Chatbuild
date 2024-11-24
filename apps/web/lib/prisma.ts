import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

// Helper types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

// Helper function to handle API errors
export function handleApiError(error: any): ApiResponse {
  console.error('API Error:', error);

  if (error.code === 'P2002') {
    return {
      success: false,
      error: 'A record with this value already exists.',
    };
  }

  if (error.code === 'P2025') {
    return {
      success: false,
      error: 'Record not found.',
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred.',
    details: process.env.NODE_ENV === 'development' ? error : undefined,
  };
}

// Helper function to check user's plan limits
export async function checkPlanLimits(userId: string, type: 'messages' | 'files' | 'urls') {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      planType: true,
      creditsRemaining: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get plan limits
  const planLimits = await prisma.$queryRaw`
    SELECT * FROM plan_limits WHERE plan_type = ${user.planType}
  `;

  // Get current usage
  const usage = await prisma.usageLog.aggregate({
    where: {
      type,
      createdAt: {
        gte: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last 30 days
      },
    },
    _sum: {
      amount: true,
    },
  });

  const currentUsage = usage._sum.amount || 0;

  switch (type) {
    case 'messages':
      return {
        allowed: currentUsage < planLimits.max_messages,
        remaining: planLimits.max_messages - currentUsage,
      };
    case 'files':
      return {
        allowed: currentUsage < planLimits.max_file_uploads,
        remaining: planLimits.max_file_uploads - currentUsage,
      };
    case 'urls':
      return {
        allowed: currentUsage < planLimits.max_web_pages,
        remaining: planLimits.max_web_pages - currentUsage,
      };
  }
}

// Helper function to log usage
export async function logUsage(
  type: string,
  amount: number,
  metadata?: Record<string, any>
) {
  return prisma.usageLog.create({
    data: {
      type,
      amount,
      metadata: metadata || {},
    },
  });
}

// Helper function to get user's subscription status
export async function getSubscriptionStatus(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      status: true,
      currentPeriodEnd: true,
      planType: true,
    },
  });

  if (!subscription) {
    return {
      isActive: false,
      planType: 'FREE' as const,
    };
  }

  return {
    isActive: subscription.status === 'active' && subscription.currentPeriodEnd > new Date(),
    planType: subscription.planType,
  };
}
