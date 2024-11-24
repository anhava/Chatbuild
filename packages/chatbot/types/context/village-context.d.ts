import { Dispatch, SetStateAction } from "react";
type TUser = {
    name: string;
    email: string;
};
type TVillageContext = {
    villageId: string | null;
    setVillageId: Dispatch<SetStateAction<string | null>>;
    user: TUser | null;
    setUser: Dispatch<SetStateAction<TUser | null>>;
};
export declare const VillageContext: import("react").Context<TVillageContext | null>;
export declare function VillageContextProvider({ children, }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare const useVillageStore: () => TVillageContext;
type TMessage = {
    message: string;
    time: number;
    by: "agent" | "consumer";
};
export type TAgent = {
    agentName: string;
    socketId: string;
};
interface TRoomState {
    messages: TMessage[];
    currentRoomId: string | null;
    agent: TAgent | null;
    hasAgentLeft: boolean;
    isAgentTyping: boolean;
    setIsAgentTyping: (b: boolean) => void;
    setAgentLeft: (b: boolean) => void;
    setRoom: (roomId: string | null, agent: TAgent | null) => void;
    addMessage: (message: string, by: "agent" | "consumer") => void;
    resetMessages: () => void;
}
export declare const AgentContext: import("react").Context<TRoomState | null>;
export declare function AgentContextProvider({ children, }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare const useAgentStore: () => TRoomState;
export {};
//# sourceMappingURL=village-context.d.ts.map