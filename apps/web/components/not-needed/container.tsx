import React, { useEffect, useRef } from 'react';
import { MessageList } from './message-list';
import { ChatInput } from './input';
import { useChat } from './context';
import { strings } from '../../lib/constants/strings';

interface ChatContainerProps {
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isTyping,
    isConnected,
    sendMessage,
    setTyping,
  } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      containerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages]);

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMessageTime = lastMessage?.createdAt 
    ? new Date(lastMessage.createdAt).toLocaleTimeString('fi-FI', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div 
      className={`flex flex-col h-full bg-white ${className}`}
      role="region"
      aria-label={strings.chat.title}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div 
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-gray-700">
            {isConnected ? strings.chat.status.online : strings.chat.status.offline}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {lastMessage && lastMessageTime && (
            <time dateTime={lastMessage.createdAt.toISOString()}>
              {lastMessageTime}
            </time>
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {strings.chat.noMessages}
          </div>
        ) : (
          <MessageList messages={messages} isTyping={isTyping} />
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={sendMessage}
        onTypingChange={setTyping}
        disabled={!isConnected}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <div 
          className="absolute bottom-20 left-4 text-sm text-gray-500"
          aria-live="polite"
        >
          {strings.chat.typing}
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
