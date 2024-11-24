import React from 'react';
import { ChatProvider } from './context';
import { ChatContainer } from './container';
import { strings } from '../../lib/constants/strings';

interface ChatWidgetProps {
  villageId: string;
  role: 'agent' | 'consumer';
  name: string;
  email: string;
  initialMessage?: string;
  accessKey?: string;
  className?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: {
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
  };
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  villageId,
  role,
  name,
  email,
  initialMessage,
  accessKey,
  className = '',
  position = 'bottom-right',
  theme = {},
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const {
    primaryColor = '#2563eb', // blue-600
    textColor = '#ffffff',
    backgroundColor = '#ffffff',
  } = theme;

  // Inject theme CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--chat-primary-color', primaryColor);
    root.style.setProperty('--chat-text-color', textColor);
    root.style.setProperty('--chat-background-color', backgroundColor);

    return () => {
      root.style.removeProperty('--chat-primary-color');
      root.style.removeProperty('--chat-text-color');
      root.style.removeProperty('--chat-background-color');
    };
  }, [primaryColor, textColor, backgroundColor]);

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
      role="complementary"
      aria-label={strings.chat.title}
    >
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 h-[600px] rounded-lg shadow-xl overflow-hidden">
          <ChatProvider
            villageId={villageId}
            role={role}
            name={name}
            email={email}
            initialMessage={initialMessage}
            accessKey={accessKey}
          >
            <ChatContainer />
          </ChatProvider>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-lg flex items-center justify-center
          transition-transform duration-200 ease-in-out
          hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
          focus:ring-primary
        `}
        style={{ backgroundColor: primaryColor }}
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-label={isOpen ? strings.chat.widget.toggle.close : strings.chat.widget.toggle.open}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke={textColor}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke={textColor}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
