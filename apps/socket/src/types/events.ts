export enum MessageType {
  USER = 'user',
  BOT = 'bot',
  AGENT = 'agent'
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  createdAt: Date;
  senderId: string;
  senderName: string;
}

export interface Consumer {
  socketId: string;
  consumerName: string;
  email: string;
  message: string;
}

export interface ServerToClientEvents {
  error: (data: { message: string }) => void;
  joinedVillage: (data: { villageId: string; name: string; role: string }) => void;
  'consumers:get': (data: { consumers: Consumer[] }) => void;
  roomCreated: (data: { roomId: string }) => void;
  message: (message: Message) => void;
  typing: (data: { isTyping: boolean; senderId: string }) => void;
  botResponse: (message: Message) => void;
  botTyping: (isTyping: boolean) => void;
  botError: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  join: (data: {
    name: string;
    email?: string;
    role: string;
    villageId: string;
    message?: string;
    accessKey?: string;
  }) => void;
  getConsumers: (data: { villageId: string }) => void;
  createRoom: (
    data: { villageId: string; consumerId: string },
    callback: (roomId: string, consumer: Consumer) => void
  ) => void;
  message: (data: { villageId: string; roomId: string; message: string }) => void;
  typing: (data: { villageId: string; roomId: string; isTyping: boolean }) => void;
  endChat: (data: { villageId: string; roomId: string }) => void;
}
