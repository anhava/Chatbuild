interface Config {
  app: {
    name: string;
    environment: string;
    url: string;
    apiUrl: string;
  };
  auth: {
    issuerBaseUrl: string;
    clientId: string;
    baseUrl: string;
    secret: string;
  };
  database: {
    url: string;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
    publishableKey: string;
  };
  socket: {
    url: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
  rateLimit: {
    max: number;
    windowMs: number;
  };
  redis: {
    url: string;
  };
  monitoring: {
    sentryDsn: string;
  };
  features: {
    fileUpload: boolean;
    urlTraining: boolean;
    liveChat: boolean;
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const config: Config = {
  app: {
    name: 'Aihio.ai',
    environment: process.env.NODE_ENV || 'development',
    url: requireEnv('NEXT_PUBLIC_APP_URL'),
    apiUrl: `${requireEnv('NEXT_PUBLIC_APP_URL')}/api`,
  },
  auth: {
    issuerBaseUrl: requireEnv('AUTH0_ISSUER_BASE_URL'),
    clientId: requireEnv('AUTH0_CLIENT_ID'),
    baseUrl: requireEnv('AUTH0_BASE_URL'),
    secret: requireEnv('AUTH0_SECRET'),
  },
  database: {
    url: requireEnv('DATABASE_URL'),
  },
  aws: {
    accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY'),
    region: requireEnv('AWS_REGION'),
    s3Bucket: requireEnv('AWS_S3_BUCKET'),
  },
  stripe: {
    secretKey: requireEnv('STRIPE_SECRET_KEY'),
    webhookSecret: requireEnv('STRIPE_WEBHOOK_SECRET'),
    publishableKey: requireEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  },
  socket: {
    url: requireEnv('NEXT_PUBLIC_SOCKET_URL'),
  },
  openai: {
    apiKey: requireEnv('OPENAI_API_KEY'),
    model: process.env.OPENAI_MODEL || 'gpt-4',
  },
  rateLimit: {
    max: parseNumber(process.env.RATE_LIMIT_MAX, 100),
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000),
  },
  redis: {
    url: requireEnv('REDIS_URL'),
  },
  monitoring: {
    sentryDsn: requireEnv('SENTRY_DSN'),
  },
  features: {
    fileUpload: parseBoolean(process.env.ENABLE_FILE_UPLOAD),
    urlTraining: parseBoolean(process.env.ENABLE_URL_TRAINING),
    liveChat: parseBoolean(process.env.ENABLE_LIVE_CHAT),
  },
};

// Plan configurations
export const plans = {
  FREE: {
    name: 'Free',
    maxMessages: 300,
    maxWebPages: 0,
    maxFileUploads: 0,
    maxFileSize: 0,
    maxChatbots: 1,
    includesLiveChat: false,
    includesCustomBranding: false,
    supportLevel: 'email',
    price: 0,
  },
  PRO: {
    name: 'Pro',
    maxMessages: 5000,
    maxWebPages: 100,
    maxFileUploads: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxChatbots: 1,
    includesLiveChat: true,
    includesCustomBranding: true,
    supportLevel: 'email',
    price: 3999, // $39.99
  },
  PREMIUM: {
    name: 'Premium',
    maxMessages: 20000,
    maxWebPages: 200,
    maxFileUploads: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxChatbots: 1,
    includesLiveChat: true,
    includesCustomBranding: true,
    supportLevel: 'priority',
    price: 8499, // $84.99
  },
  ENTERPRISE: {
    name: 'Enterprise',
    maxMessages: 100000,
    maxWebPages: 500,
    maxFileUploads: 20,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxChatbots: 1,
    includesLiveChat: true,
    includesCustomBranding: true,
    supportLevel: 'priority_phone',
    price: 34999, // $349.99
  },
} as const;

// Feature flags based on environment
export const featureFlags = {
  enableFileUpload: config.features.fileUpload && config.app.environment !== 'development',
  enableUrlTraining: config.features.urlTraining && config.app.environment !== 'development',
  enableLiveChat: config.features.liveChat,
  enableAnalytics: config.app.environment === 'production',
  enablePayments: config.app.environment === 'production',
};

// API endpoints
export const apiEndpoints = {
  chatbot: `${config.app.apiUrl}/chatbot`,
  createThread: `${config.app.apiUrl}/create-thread`,
  answerUser: `${config.app.apiUrl}/answer-user`,
  stripe: {
    createCheckoutSession: `${config.app.apiUrl}/stripe/create-checkout-session`,
    createPortalSession: `${config.app.apiUrl}/stripe/create-portal-session`,
    webhook: `${config.app.apiUrl}/stripe/webhook`,
  },
};

// Error messages
export const errorMessages = {
  general: {
    serverError: 'An unexpected error occurred. Please try again later.',
    notFound: 'The requested resource was not found.',
    unauthorized: 'You are not authorized to perform this action.',
    invalidInput: 'Invalid input provided.',
  },
  chatbot: {
    notFound: 'Chatbot not found.',
    invalidApiKey: 'Invalid API key provided.',
    limitExceeded: 'You have reached your plan\'s limit.',
  },
  subscription: {
    inactive: 'Your subscription is inactive.',
    paymentFailed: 'Payment failed. Please update your payment method.',
  },
};

export default config;
