import z from "zod";

export enum SupportedMessage {
  JoinRoom = "JOIN_ROOM",
  SendMessage = "SEND_MESSAGE",
  UpvoteMessage = "UPVOTE_MESSAGE",
}
function isInitMessage(payload: any): payload is InitMessageType {
  return "name" in payload;
}

function isUserMessage(payload: any): payload is UserMessageType {
  return "message" in payload;
}

function isUpvoteMessage(payload: any): payload is UpvoteMessageType {
  return "chatId" in payload;
}

export type IncomingMessage =
  | {
      type: SupportedMessage.JoinRoom;
      payload: InitMessageType;
    }
  | {
      type: SupportedMessage.SendMessage;
      payload: UserMessageType;
    }
  | {
      type: SupportedMessage.UpvoteMessage;
      payload: UpvoteMessageType;
    };

export const InitMessage = z.object({
  name: z.string(),
  userId: z.string(),
  roomId: z.string(),
});

export type InitMessageType = z.infer<typeof InitMessage>;

export const UserMessage = z.object({
  userId: z.string(),
  name: z.string(),

  roomId: z.string(),
  message: z.string(),
});

export type UserMessageType = z.infer<typeof UserMessage>;

export const UpvoteMessage = z.object({
  userId: z.string(),
  roomId: z.string(),
  name: z.string(),

  chatId: z.string(),
});

export type UpvoteMessageType = z.infer<typeof UpvoteMessage>;
