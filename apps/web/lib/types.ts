export interface KnowledgeFile {
  id: string;
  chatbotId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeUrl {
  id: string;
  chatbotId: string;
  url: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  lastCrawledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileData extends KnowledgeFile {
  summary?: string;
  embedding?: number[];
}

export interface UrlData extends KnowledgeUrl {
  content?: string;
  embedding?: number[];
}

export interface ProcessFileResult {
  fileId: string;
  summary: string;
  embedding: number[];
}

export interface ProcessUrlResult {
  urlId: string;
  content: string;
  embedding: number[];
}

export interface ChatMessage {
  id: string;
  threadId: string;
  type: 'USER' | 'BOT' | 'AGENT';
  senderId?: string;
  content: string;
  createdAt: Date;
}

export interface ChatThread {
  id: string;
  chatbotId: string;
  visitorId?: string;
  visitorName?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Chatbot {
  id: string;
  userId: string;
  name: string;
  description?: string;
  apiKey: string;
  logoUrl?: string;
  themeColor?: string;
  welcomeMessage: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  isLiveChatEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  planType: 'FREE' | 'PRO' | 'PREMIUM' | 'ENTERPRISE';
  creditsRemaining: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  planType: 'PRO' | 'PREMIUM' | 'ENTERPRISE';
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanLimit {
  planType: string;
  maxMessages: number;
  maxWebPages: number;
  maxFileUploads: number;
  maxFileSize: number;
  maxChatbots: number;
  includesLiveChat: boolean;
  includesCustomBranding: boolean;
  supportLevel: string;
  priceMonthly: number;
}
