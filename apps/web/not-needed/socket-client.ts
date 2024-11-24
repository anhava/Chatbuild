import { io, Socket } from 'socket.io-client';
import { config } from './config';

interface JoinParams {
  name: string;
  email: string;
  villageId: string;
  message: string;
  accessKey?: string;
  role: 'agent' | 'consumer';
}

interface MessageParams {
  villageId: string;
  roomId: string;
  message: string;
}

export class SocketClient {
  private static socket: Socket;
  private static isConnected = false;

  /**
   * Initialize socket connection
   */
  static initialize() {
    if (this.isConnected) return;

    this.socket = io(config.socket.url, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.setupListeners();
    this.isConnected = true;
  }

  /**
   * Set up socket event listeners
   */
  private static setupListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  /**
   * Join a village as agent or consumer
   */
  static async join(params: JoinParams): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('join', params, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Create a chat room (agent only)
   */
  static async createRoom(villageId: string, consumerId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'createRoom',
        { villageId, consumerId },
        (roomId: string, error: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(roomId);
          }
        }
      );
    });
  }

  /**
   * Send a message in a room
   */
  static sendMessage(params: MessageParams): void {
    this.socket.emit('message', params);
  }

  /**
   * Send typing indicator
   */
  static sendTyping(villageId: string, roomId: string, isTyping: boolean): void {
    this.socket.emit('typing', { villageId, roomId, isTyping });
  }

  /**
   * End a chat session
   */
  static endChat(villageId: string, roomId: string): void {
    this.socket.emit('endChat', { villageId, roomId });
  }

  /**
   * Get consumers in waitlist
   */
  static getConsumers(villageId: string): void {
    this.socket.emit('getConsumers', { villageId });
  }

  /**
   * Add message listener
   */
  static onMessage(callback: (data: any) => void): void {
    this.socket.on('message', callback);
  }

  /**
   * Add typing listener
   */
  static onTyping(callback: (data: any) => void): void {
    this.socket.on('typing', callback);
  }

  /**
   * Add room created listener
   */
  static onRoomCreated(callback: (data: any) => void): void {
    this.socket.on('roomCreated', callback);
  }

  /**
   * Add waitlist update listener
   */
  static onWaitlistUpdate(callback: (data: any) => void): void {
    this.socket.on('update-waitlist', callback);
  }

  /**
   * Add chat ended listener
   */
  static onChatEnded(callback: (data: any) => void): void {
    this.socket.on('chatEnded', callback);
  }

  /**
   * Remove all listeners
   */
  static removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  /**
   * Disconnect socket
   */
  static disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Check if socket is connected
   */
  static isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Get socket ID
   */
  static getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

export default SocketClient;
