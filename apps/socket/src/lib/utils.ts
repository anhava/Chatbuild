import { Socket } from "socket.io";
import { Village } from "../village";

export async function verifyAccessKey(accessKey: string, villageId: string): Promise<boolean> {
  // TODO: Implement actual access key verification using @repo/database
  return true;
}

export function handleDisconnection(socketId: string) {
  // Find and handle disconnected user in all villages
  for (const villageId of Object.keys(Village)) {
    const village = Village.getVillage(villageId);
    if (village) {
      // Remove from waitlist if consumer
      village.consumerWaitlist = village.consumerWaitlist.filter(
        (user) => user.socketId !== socketId
      );

      // Remove room if agent or consumer
      const room = village.rooms.find(
        (r) =>
          r.agent.socketId === socketId || r.consumer.socketId === socketId
      );
      if (room) {
        village.deleteRoom(room.roomId);
      }
    }
  }
}

export async function sendNotificationOnConsumerJoin(data: {
  name: string;
  email: string;
  message: string;
  villageId: string;
}): Promise<void> {
  // TODO: Implement notification system using @repo/config settings
  console.log("New consumer joined:", data);
}
