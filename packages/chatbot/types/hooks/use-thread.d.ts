export declare const useThread: () => {
    threadId: string;
    threadError: string;
    threadLoading: boolean;
    resetThread: () => void;
    fetchThread: (userName: string, apiKey: string) => Promise<string | undefined>;
};
//# sourceMappingURL=use-thread.d.ts.map