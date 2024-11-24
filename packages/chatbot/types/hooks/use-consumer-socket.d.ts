import { Socket } from "socket.io-client";
import { ReactNode } from "react";
interface SocketContextProps {
    socket: Socket | null;
    sendMessage: (message: string, roomId: string) => void;
    join: (username: string, email: string, message: string) => void;
    reset: () => void;
}
export declare const SocketProvider: ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useSocket: () => SocketContextProps;
export {};
//# sourceMappingURL=use-consumer-socket.d.ts.map