import { Room, UserId } from "../interface/chat.interface";
import { Store } from "./store";
let globalChatId = 0;
export class InMemoryStore implements Store {
  private store: Map<string, Room>;
  constructor() {
    this.store = new Map<string, Room>();
  }

  initRoom(roomId: string) {
    this.store.set(roomId, {
      roomId,
      chats: [],
    });
  }
  getChats(roomId: string, limit: number, offset: number) {
    const room = this.store.get(roomId);
    if (!room) {
      return [];
    }
    let toReversed = room.chats;
    toReversed = toReversed.reverse();
    return toReversed.slice(-limit);
  }
  addChats(
    userId: UserId,
    name: string,
    message: string,
    roomId: string,
    limit?: number,
    offset?: number
  ) {
    const room = this.store.get(roomId);
    if (!room) {
      return [];
    }
    room.chats.push({
      id: String(globalChatId++),
      userId,
      name,
      message,
      upVotes: [],
    });
  }

  upVote(userId: UserId, roomId: string, chatId: string) {
    const room = this.store.get(roomId);
    if (!room) {
      return [];
    }
    const chat = room.chats.find(({ id }) => id === chatId);
    if (chat) {
      chat.upVotes.push();
    }
  }
}
