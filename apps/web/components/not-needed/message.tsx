import React from 'react';
import { ChatMessage as ChatMessageType } from '../../lib/types';
import { strings } from '../../lib/constants/strings';

interface MessageProps {
  message: ChatMessageType;
  isLastMessage: boolean;
  isTyping?: boolean;
}

export const ChatMessage: React.FC<MessageProps> = ({
  message,
  isLastMessage,
  isTyping,
}) => {
  const isBot = message.type === 'BOT';
  const isUser = message.type === 'USER';
  const isAgent = message.type === 'AGENT';

  return (
    <div
      className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
      aria-label={`${isBot ? 'Botin' : isAgent ? 'Agentin' : 'Käyttäjän'} viesti`}
    >
      <div
        className={`flex max-w-[80%] ${
          isBot ? 'flex-row' : 'flex-row-reverse'
        } items-end gap-2`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isBot ? (
            <div 
              className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center"
              role="img"
              aria-label="Botin avatar"
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          ) : isAgent ? (
            <div 
              className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center"
              role="img"
              aria-label="Agentin avatar"
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          ) : (
            <div 
              className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"
              role="img"
              aria-label="Käyttäjän avatar"
            >
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isBot
              ? 'bg-gray-100 text-gray-900'
              : isAgent
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
            {isLastMessage && isTyping && (
              <span className="ml-2 animate-pulse" aria-label="Kirjoittaa viestiä">
                {strings.chat.typing}
              </span>
            )}
          </p>
          <time 
            className="text-xs opacity-70 mt-1 block"
            dateTime={message.createdAt.toISOString()}
          >
            {new Date(message.createdAt).toLocaleTimeString('fi-FI', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
