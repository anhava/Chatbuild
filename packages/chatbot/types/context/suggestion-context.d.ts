import { Dispatch, SetStateAction } from "react";
type TSuggestionContext = {
    suggestion: string[];
    setSuggestion: Dispatch<SetStateAction<string[]>>;
};
export declare const SuggestionContext: import("react").Context<TSuggestionContext | null>;
export declare function SuggestionContextProvider({ children, }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=suggestion-context.d.ts.map