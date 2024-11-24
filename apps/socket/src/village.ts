import { Server, Socket } from "socket.io";
import { ClientToServerEvents, Consumer, Message, MessageType, ServerToClientEvents } from "./types/events";

export class Room {
  constructor(
    public roomId: string,
    public agent: { socketId: string; name: string },
    public consumer: Consumer,
    private io: Server<ClientToServerEvents, ServerToClientEvents>
  ) {}

  sendMessage(socket: Socket<ClientToServerEvents, ServerToClientEvents>, content: string) {
    const message: Message = {
      id: Math.random().toString(36).substring(7),
      content,
      type: socket.id === this.agent.socketId ? MessageType.AGENT : MessageType.USER,
      createdAt: new Date(),
      senderId: socket.id,
      senderName: socket.id === this.agent.socketId ? this.agent.name : this.consumer.consumerName
    };

    this.io.to(this.agent.socketId).to(this.consumer.socketId).emit("message", message);
  }

  sendTypingState(socket: Socket<ClientToServerEvents, ServerToClientEvents>, isTyping: boolean) {
    if (socket.id === this.agent.socketId) {
      this.io.to(this.consumer.socketId).emit("typing", { isTyping, senderId: this.agent.socketId });
    } else {
      this.io.to(this.agent.socketId).emit("typing", { isTyping, senderId: this.consumer.socketId });
    }
  }
}

export class Village {
  private static villages: Map<string, Village> = new Map();
  public rooms: Room[] = [];
  public consumerWaitlist: Consumer[] = [];

  private constructor(
    public villageId: string,
    public villageName: string,
    private io: Server<ClientToServerEvents, ServerToClientEvents>
  ) {
    Village.villages.set(villageId, this);
  }

  static getVillage(villageId: string): Village | undefined {
    return Village.villages.get(villageId);
  }

  static createVillage(
    villageId: string,
    villageName: string,
    io: Server<ClientToServerEvents, ServerToClientEvents>
  ): Village {
    const village = new Village(villageId, villageName, io);
    return village;
  }

  joinConsumer(socketId: string, name: string, email: string, message: string) {
    const consumer: Consumer = {
      socketId,
      consumerName: name,
      email,
      message
    };
    this.consumerWaitlist.push(consumer);
  }

  joinAgent(socket: Socket<ClientToServerEvents, ServerToClientEvents>, name: string) {
    socket.join(this.villageId);
  }

  getWaitlistUserById(socketId: string): Consumer | undefined {
    return this.consumerWaitlist.find((user) => user.socketId === socketId);
  }

  getAgentById(socketId: string): { socketId: string; name: string } | undefined {
    const room = this.rooms.find((room) => room.agent.socketId === socketId);
    return room?.agent;
  }

  makeRoom(agentSocketId: string, consumerSocketId: string): string | undefined {
    const consumer = this.consumerWaitlist.find(
      (user) => user.socketId === consumerSocketId
    );

    if (!consumer) return undefined;

    const roomId = Math.random().toString(36).substring(7);
    const room = new Room(
      roomId,
      { socketId: agentSocketId, name: "Agent" },
      consumer,
      this.io
    );

    this.rooms.push(room);
    this.consumerWaitlist = this.consumerWaitlist.filter(
      (user) => user.socketId !== consumerSocketId
    );

    return roomId;
  }

  deleteRoom(roomId: string) {
    const room = this.rooms.find((r) => r.roomId === roomId);
    if (room) {
      this.rooms = this.rooms.filter((r) => r.roomId !== roomId);
      this.joinConsumer(
        room.consumer.socketId,
        room.consumer.consumerName,
        room.consumer.email,
        room.consumer.message
      );
    }
  }
}
