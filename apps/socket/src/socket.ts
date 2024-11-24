import { Server, Socket } from "socket.io";
import { handleDisconnection, sendNotificationOnConsumerJoin, verifyAccessKey } from "./lib/utils";
import { Village } from "./village";
import { ClientToServerEvents, Message, MessageType, ServerToClientEvents } from "./types/events";
import { handleBotResponse } from "./lib/bot";

export function setupSocketHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log("New client connected");

    socket.on("join", async ({ name, email, role, villageId, message, accessKey }) => {
      if (!role || !villageId) {
        socket.emit("error", { message: "Missing role or villageId" });
        return;
      }

      console.log({ name, villageId, accessKey });

      let village = Village.getVillage(villageId);
      if (!village) {
        village = new Village(villageId, "Village ABC", io);
      }

      if (role === "consumer") {
        const consumer = village.getWaitlistUserById(socket.id);
        if (consumer) {
          return socket.emit("error", { message: "Consumer Already Exists" });
        }
        if (!email || !message) {
          return socket.emit("error", { message: "Consumer Email and Message are required" });
        }

        // Join consumer and handle first bot response
        village.joinConsumer(socket.id, name, email, message);
        sendNotificationOnConsumerJoin({ name, email, message, villageId: village.villageId });

        // Send initial bot response
        socket.emit("botTyping", true);
        try {
          const botResponse = await handleBotResponse(message);
          const responseMessage: Message = {
            id: Math.random().toString(36).substring(7),
            content: botResponse,
            type: MessageType.BOT,
            createdAt: new Date(),
            senderId: 'bot',
            senderName: 'Assistant'
          };
          socket.emit("botResponse", responseMessage);
        } catch (error) {
          socket.emit("botError", { message: "Failed to get bot response" });
        } finally {
          socket.emit("botTyping", false);
        }

      } else if (role === "agent") {
        if (!accessKey) {
          return socket.emit("error", { message: "Access Key is required" });
        }
        const isValid = await verifyAccessKey(accessKey, villageId);
        if (!isValid) {
          return socket.emit("error", { message: "Invalid Access Key" });
        }
        village.joinAgent(socket, name);
        socket.emit("consumers:get", { consumers: village.consumerWaitlist });
      }

      socket.emit("joinedVillage", { villageId, name, role });
    });

    socket.on('getConsumers', ({ villageId }) => {
      const village = Village.getVillage(villageId);
      if (village) {
        socket.emit("consumers:get", { consumers: village.consumerWaitlist });
      }
    });

    socket.on("createRoom", ({ villageId, consumerId }, cb) => {
      console.log({ villageId, consumerId, cb });

      const village = Village.getVillage(villageId);
      const agent = village?.getAgentById(socket.id);
      const consumer = village?.getWaitlistUserById(consumerId);

      if (!agent) {
        return socket.emit("error", {
          message: "No Agent Found",
        });
      }

      const existingRoom = village?.rooms.find(room => room.agent.socketId === socket.id);
      if (!!existingRoom) {
        village?.deleteRoom(existingRoom.roomId);
        village?.joinConsumer(existingRoom.consumer.socketId, existingRoom.consumer.consumerName, existingRoom.consumer.email, existingRoom.consumer.message);
      }

      if (village) {
        const roomId = village.makeRoom(socket.id, consumerId);
        if (roomId && consumer) {
          socket.emit("roomCreated", { roomId });
          cb(roomId, consumer);
        } else {
          socket.emit("error", {
            message: "Unable to create room",
          });
        }
      }
    });

    socket.on("message", ({ villageId, roomId, message }) => {
      const village = Village.getVillage(villageId);
      if (village) {
        const room = village.rooms.find((room) => room.roomId === roomId);
        if (room) {
          room.sendMessage(socket, message);
        }
      }
    });

    socket.on("typing", ({ villageId, roomId, isTyping }) => {
      const village = Village.getVillage(villageId);
      if (village) {
        const room = village.rooms.find((room) => room.roomId === roomId);
        if (room) {
          room.sendTypingState(socket, isTyping);
        }
      }
    });

    socket.on("endChat", ({ villageId, roomId }) => {
      const village = Village.getVillage(villageId);
      if (village) {
        const room = village.rooms.find((room) => room.roomId === roomId);
        if (room) {
          village.deleteRoom(room.roomId);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      handleDisconnection(socket.id);
    });
  });
}
