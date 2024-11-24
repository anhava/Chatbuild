import { WidgetProps } from "./types";
import "../../dist/output.css";
/**
 * A chatbot component that provides a user interface for interacting with a chatbot.
 * @param {Object} props - The props for the Chatbot component.
 * @param {string} props.apiKey - The API key used for authentication with the chatbot service.
 * @param {string} [props.themeColor] - The primary color theme for the chatbot UI.
 * @param {string} [props.textColor] - The text color used in the chatbot UI.
 * @param {boolean} [props.roundedButton] - Indicates whether to use rounded Open Button.
 * @param {IconType} [props.icon] - The icon to be displayed in the Open Button.
 * @returns {JSX.Element} The rendered Chatbot component.
 */
declare const Chatbot: (props: WidgetProps) => import("react/jsx-runtime").JSX.Element;
export default Chatbot;
export declare const ChatbotNoWidget: (props: WidgetProps) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map