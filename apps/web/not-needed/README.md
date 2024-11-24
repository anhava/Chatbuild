# Not Needed Components and Utilities

These files were created initially but were found to be unnecessary as the project already has a well-structured implementation:

## Files in this directory:

1. Chat Components (originally in components/chat/):
   - These components were redundant as the chat functionality is already well-implemented in packages/chatbot/src/chatWidget/

2. Utility Files:
   - chat.ts
   - socket-client.ts
   - use-chat-socket.ts
   - use-toast.ts
   - strings.ts

## Existing Implementation

The project already has a robust implementation:

1. Chat Widget: packages/chatbot/src/chatWidget/
   - Real-time messaging
   - Thread management
   - User input handling
   - Message history
   - Live chat switching
   - Suggestion system

2. Socket Server: apps/real-time-socket/
   - Village-based room management
   - Agent and consumer connections
   - Message broadcasting

3. Distribution:
   - apps/npm for React/Next.js integration
   - apps/cdn for direct script inclusion

These files are kept for reference but should not be used in the project. The actual implementation should use the components from packages/chatbot.
