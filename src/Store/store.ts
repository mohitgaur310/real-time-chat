import { UserId } from "../interface/chat.interface";

export abstract class Store {
  constructor() {}
  initRoom(roomId: string) {}
  getChats(roomId: string, limit: number, offset: number) {}
  addChats(
    userId: UserId,
    name: string,
    message: string,
    roomId: string,
    limit: number,
    offset: number
  ) {}

  upVote(userId: UserId, room: string, chatId: string) {}
}
