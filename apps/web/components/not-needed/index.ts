import { ChatMessage as ChatMessageType } from '../../lib/types';

// Export components
export { default as ChatContainer } from './container';
export { default as ChatInput } from './input';
export { default as ChatMessage } from './message';
export { default as MessageList } from './message-list';

// Export context and hooks
export { ChatProvider, useChat } from './context';
export type { ChatContextValue, ChatState, ChatAction } from './context';

// Define and export interfaces
export interface ChatContainerProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  isTyping?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface MessageProps {
  message: ChatMessageType;
  isLastMessage: boolean;
  isTyping?: boolean;
}

export interface MessageListProps {
  messages: ChatMessageType[];
  isTyping?: boolean;
}

// Export provider props type
export interface ChatProviderProps {
  children: React.ReactNode;
  villageId: string;
  role: 'agent' | 'consumer';
  name: string;
  email: string;
  initialMessage?: string;
  accessKey?: string;
}

// Export types from lib/types for convenience
export type { ChatMessage as ChatMessageType } from '../../lib/types';
