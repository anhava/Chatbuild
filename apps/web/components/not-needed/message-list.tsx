import React from 'react';
import { ChatMessage as ChatMessageType } from '../../lib/types';
import { ChatMessage } from './message';

interface MessageListProps {
  messages: ChatMessageType[];
  isTyping?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <ul
        className="flex flex-col space-y-4 p-4"
        aria-label="Keskusteluviestit"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((message, index) => (
          <li key={message.id} className="min-w-0">
            <ChatMessage
              message={message}
              isLastMessage={index === messages.length - 1}
              isTyping={index === messages.length - 1 && isTyping}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;
