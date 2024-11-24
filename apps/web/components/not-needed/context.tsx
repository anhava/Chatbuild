import React, { createContext, useContext, useCallback, useReducer } from 'react';
import { ChatMessage } from '../../lib/types';
import { useChatSocket } from '../../lib/hooks/use-chat-socket';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  activeRoom: string | null;
  waitlist: any[];
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ACTIVE_ROOM'; payload: string | null }
  | { type: 'SET_WAITLIST'; payload: any[] }
  | { type: 'CLEAR_MESSAGES' };

interface ChatContextValue extends ChatState {
  sendMessage: (content: string) => void;
  setTyping: (isTyping: boolean) => void;
  createRoom: (consumerId: string) => Promise<void>;
  endChat: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  isConnected: false,
  activeRoom: null,
  waitlist: [],
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: action.payload,
      };
    case 'SET_ACTIVE_ROOM':
      return {
        ...state,
        activeRoom: action.payload,
      };
    case 'SET_WAITLIST':
      return {
        ...state,
        waitlist: action.payload,
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
      };
    default:
      return state;
  }
}

interface ChatProviderProps {
  children: React.ReactNode;
  villageId: string;
  role: 'agent' | 'consumer';
  name: string;
  email: string;
  initialMessage?: string;
  accessKey?: string;
}

export function ChatProvider({
  children,
  villageId,
  role,
  name,
  email,
  initialMessage,
  accessKey,
}: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const handleMessageReceived = useCallback((message: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const handleTypingChange = useCallback((data: { isTyping: boolean }) => {
    dispatch({ type: 'SET_TYPING', payload: data.isTyping });
  }, []);

  const handleChatEnded = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
    dispatch({ type: 'SET_ACTIVE_ROOM', payload: null });
  }, []);

  const {
    sendMessage,
    setTyping,
    createRoom,
    endChat,
    isConnected,
    waitlist,
    activeRoom,
  } = useChatSocket({
    villageId,
    role,
    name,
    email,
    initialMessage,
    accessKey,
    onMessageReceived: handleMessageReceived,
    onTypingChange: handleTypingChange,
    onChatEnded: handleChatEnded,
  });

  const value: ChatContextValue = {
    ...state,
    isConnected,
    waitlist,
    activeRoom,
    sendMessage,
    setTyping,
    createRoom,
    endChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export type { ChatContextValue, ChatState, ChatAction };
