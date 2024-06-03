import { Socket, io } from "socket.io-client";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useAgentStore, useVillageStore } from "../context/village-context";


interface SocketContextProps {
  socket: Socket | null;
  sendMessage: (message: string, roomId: string) => void;
  join:(username:string, email:string) => void
  reset:()=>void
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { addMessage,setAgentLeft,setRoom, resetMessages  } = useAgentStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const {villageId} = useVillageStore()

  
  const reset = () => {
    resetMessages()
    setRoom(null,null)
  }



  useEffect(() => {
    if(!villageId) return
    const newSocket = io("http://localhost:8080");

    newSocket.on("connect", () => {
      console.log("Connected");
    });

     newSocket.on("agent-joined", (payload) => {
      console.log("PAYLOAD", payload);
      const roomId = payload.roomId
      const agent = {
        agentName:payload.agentName,
        socketId:payload.agentId
      }
      if(!roomId || !payload.agentName || !payload.agentId ){
        console.error("Invalid Payload")
        return
      }
      setRoom(roomId,agent)
    });

   
    newSocket.on("message", (payload) => {
      console.log("PAYLOAD", payload);
      addMessage(payload.message, "agent");
    });

    newSocket.on("disconnected", ()=>{
      setAgentLeft(true)
    })

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [villageId]);



  const sendMessage = (message: string, roomId: string) => {
    addMessage(message, "consumer");
    socket?.emit("message", { message, roomId, villageId });
  };

  const join = (userName:string,email:string) => {
     socket?.emit("join", {
        villageId: villageId,
        email,
        name: userName,
        role: "consumer",
        
      });
}

  return (
    <SocketContext.Provider
      value={{ socket, sendMessage,join,reset }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};



