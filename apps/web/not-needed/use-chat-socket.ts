import { useEffect, useCallback, useState } from 'react';
import { SocketClient } from '../socket-client';
import { useToast } from '../../components/providers/toast-provider';
import { ChatMessage } from '../types';
import { strings } from '../constants/strings';

const { chat } = strings;

interface UseChatSocketParams {
  villageId: string;
  role: 'agent' | 'consumer';
  name: string;
  email: string;
  initialMessage?: string;
  accessKey?: string;
  onMessageReceived?: (message: ChatMessage) => void;
  onTypingChange?: (data: { isTyping: boolean; userId: string }) => void;
  onChatEnded?: () => void;
}

interface UseChatSocketReturn {
  isConnected: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
  waitlist: any[];
  activeRoom: string | null;
  sendMessage: (content: string) => void;
  setTyping: (isTyping: boolean) => void;
  createRoom: (consumerId: string) => Promise<void>;
  endChat: () => void;
}

export function useChatSocket({
  villageId,
  role,
  name,
  email,
  initialMessage,
  accessKey,
  onMessageReceived,
  onTypingChange,
  onChatEnded,
}: UseChatSocketParams): UseChatSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize socket connection
  useEffect(() => {
    SocketClient.initialize();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleError = (error: any) => {
      console.error('Socket error:', error);
      toast({
        title: chat.connectionError.title,
        description: error.message || chat.connectionError.description,
        variant: 'destructive',
      });
    };

    // Join village
    SocketClient.join({
      villageId,
      role,
      name,
      email,
      message: initialMessage || '',
      accessKey,
    }).catch(handleError);

    // Set up event listeners
    SocketClient.onMessage((message) => {
      setMessages((prev) => [...prev, message]);
      onMessageReceived?.(message);
    });

    SocketClient.onTyping((data) => {
      onTypingChange?.(data);
    });

    SocketClient.onRoomCreated(({ roomId }) => {
      setActiveRoom(roomId);
      toast({
        title: chat.sessionStarted.title,
        description: chat.sessionStarted.description,
      });
    });

    SocketClient.onWaitlistUpdate((data) => {
      setWaitlist(data);
    });

    SocketClient.onChatEnded(() => {
      setActiveRoom(null);
      onChatEnded?.();
      toast({
        title: chat.sessionEnded.title,
        description: chat.sessionEnded.description,
      });
    });

    // Cleanup
    return () => {
      SocketClient.removeAllListeners();
      SocketClient.disconnect();
    };
  }, [villageId, role, name, email, initialMessage, accessKey]);

  // Send message
  const sendMessage = useCallback(
    (content: string) => {
      if (!activeRoom) return;

      SocketClient.sendMessage({
        villageId,
        roomId: activeRoom,
        message: content,
      });
    },
    [villageId, activeRoom]
  );

  // Update typing status
  const setTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!activeRoom) return;

      SocketClient.sendTyping(villageId, activeRoom, isTyping);
    },
    [villageId, activeRoom]
  );

  // Create room (agent only)
  const createRoom = useCallback(
    async (consumerId: string) => {
      try {
        const roomId = await SocketClient.createRoom(villageId, consumerId);
        setActiveRoom(roomId);
      } catch (error) {
        console.error('Create room error:', error);
        toast({
          title: chat.createRoomError.title,
          description: chat.createRoomError.description,
          variant: 'destructive',
        });
      }
    },
    [villageId]
  );

  // End chat
  const endChat = useCallback(() => {
    if (!activeRoom) return;

    SocketClient.endChat(villageId, activeRoom);
    setActiveRoom(null);
  }, [villageId, activeRoom]);

  return {
    isConnected,
    isTyping,
    messages,
    waitlist,
    activeRoom,
    sendMessage,
    setTyping: setTypingStatus,
    createRoom,
    endChat,
  };
}

export default useChatSocket;
