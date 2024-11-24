import { Dispatch, SetStateAction } from "react";
export type TMessage = {
    message: string;
    from: "chatbot" | "user" | "error";
};
type TMessagesContext = {
    messages: TMessage[];
    setMessages: Dispatch<SetStateAction<TMessage[]>>;
    generationLoading: boolean;
    setGenerationLoading: Dispatch<SetStateAction<boolean>>;
};
export declare const MessagesContext: import("react").Context<TMessagesContext | null>;
export declare function MessagesContextProvider({ children, }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=message-context.d.ts.map