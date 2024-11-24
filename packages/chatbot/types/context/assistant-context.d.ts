type TAssistantContext = {
    threadId: string;
    threadError: string;
    threadLoading: boolean;
    resetThread: () => void;
    fetchThread: (userName: string, apiKey: string) => Promise<string | undefined>;
};
export declare const AssistantContext: import("react").Context<TAssistantContext | null>;
export declare function AssistantContextProvider({ children, }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=assistant-context.d.ts.map