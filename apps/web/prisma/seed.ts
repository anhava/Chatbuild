import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

interface PlanLimit {
  planType: PlanType;
  maxMessages: number;
  maxWebPages: number;
  maxFileUploads: number;
  maxFileSize: number; // in bytes
  maxChatbots: number;
  includesLiveChat: boolean;
  includesCustomBranding: boolean;
  supportLevel: string;
  priceMonthly: number; // in cents
}

const planLimits: PlanLimit[] = [
  {
    planType: 'FREE',
    maxMessages: 300,
    maxWebPages: 0,
    maxFileUploads: 0,
    maxFileSize: 0,
    maxChatbots: 1,
    includesLiveChat: false,
    includesCustomBranding: false,
    supportLevel: 'email',
    priceMonthly: 0,
  },
  {
    planType: 'PRO',
    maxMessages: 5000,
    maxWebPages: 100,
    maxFileUploads: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxChatbots: 1,
    includesLiveChat: true,
    includesCustomBranding: true,
    supportLevel: 'email',
    priceMonthly: 3999, // $39.99
  },
  {
    planType: 'PREMIUM',
    maxMessages: 20000,
    maxWebPages: 200,
    maxFileUploads: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxChatbots: 1,
    includesLiveChat: true,
    includesCustomBranding: true,
    supportLevel: 'priority',
    priceMonthly: 8499, // $84.99
  },
  {
    planType: 'ENTERPRISE',
    maxMessages: 100000,
    maxWebPages: 500,
    maxFileUploads: 20,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxChatbots: 1,
    includesLiveChat: true,
    includesCustomBranding: true,
    supportLevel: 'priority_phone',
    priceMonthly: 34999, // $349.99
  },
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Create plan limits
    console.log('Creating plan limits...');
    for (const plan of planLimits) {
      await prisma.$executeRaw`
        INSERT INTO plan_limits (
          plan_type,
          max_messages,
          max_web_pages,
          max_file_uploads,
          max_file_size,
          max_chatbots,
          includes_live_chat,
          includes_custom_branding,
          support_level,
          price_monthly
        ) VALUES (
          ${plan.planType},
          ${plan.maxMessages},
          ${plan.maxWebPages},
          ${plan.maxFileUploads},
          ${plan.maxFileSize},
          ${plan.maxChatbots},
          ${plan.includesLiveChat},
          ${plan.includesCustomBranding},
          ${plan.supportLevel},
          ${plan.priceMonthly}
        )
        ON CONFLICT (plan_type) DO UPDATE SET
          max_messages = EXCLUDED.max_messages,
          max_web_pages = EXCLUDED.max_web_pages,
          max_file_uploads = EXCLUDED.max_file_uploads,
          max_file_size = EXCLUDED.max_file_size,
          max_chatbots = EXCLUDED.max_chatbots,
          includes_live_chat = EXCLUDED.includes_live_chat,
          includes_custom_branding = EXCLUDED.includes_custom_branding,
          support_level = EXCLUDED.support_level,
          price_monthly = EXCLUDED.price_monthly;
      `;
    }

    // Create test user (for development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Creating test user...');
      const testUser = await prisma.user.upsert({
        where: { email: 'test@aihio.ai' },
        update: {},
        create: {
          email: 'test@aihio.ai',
          passwordHash: 'test-password-hash', // In production, use proper password hashing
          planType: 'FREE',
          creditsRemaining: 300,
          chatbots: {
            create: {
              name: 'Test Chatbot',
              description: 'A test chatbot for development',
              welcomeMessage: 'Hello! This is a test chatbot.',
              themeColor: '#2563eb',
              status: 'ACTIVE',
            },
          },
        },
      });
      console.log('Created test user:', testUser.id);
    }

    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
