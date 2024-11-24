import { TChatBoxDetails } from "./types";
type WidgetProps = {
    chatbotDetails: TChatBoxDetails;
    handleChatBoxClose: () => void;
    resetChat: () => void;
    isOnlyChatbot: boolean;
};
declare const Chatbot: ({ chatbotDetails, handleChatBoxClose, resetChat, isOnlyChatbot, }: WidgetProps) => import("react/jsx-runtime").JSX.Element;
export default Chatbot;
//# sourceMappingURL=chatbot.d.ts.map