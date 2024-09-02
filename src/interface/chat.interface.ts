export type UserId = string;
export interface Chat {
  id: string;
  userId: UserId;
  name: string;
  message: string;
  upVotes: UserId[];
}

export interface Room {
  roomId: string;
  chats: Chat[];
}
