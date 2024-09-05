import { connection, server as WebSocketServer } from "websocket";
import http from "http";
import {
  IncomingMessage,
  InitMessageType,
  SupportedMessage,
  UpvoteMessageType,
  UserMessageType,
} from "./messages/incomingMessage";
import {
  OutgoingMessage,
  SupportedMessage as OutgoingSupportMessages,
} from "./messages/outgoingMessages";
import { UserManager } from "./UserManager";
import { InMemoryStore } from "./Store/InMemoryStore";

const userManager = new UserManager();
const store = new InMemoryStore();
const server = http.createServer(function (request: any, response: any) {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(8080, function () {
  console.log(new Date() + " Server is listening on port 8080");
});

let wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

function originIsAllowed(origin: string) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on("request", function (request: any) {
  console.log("inside connections");

  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log(
      new Date() + " Connection from origin " + request.origin + " rejected."
    );
    return;
  }

  let connection = request.accept("echo-protocol", request.origin);
  console.log(new Date() + " Connection accepted.");
  connection.on("message", function (message: any) {
    if (message.type === "utf8") {
      try {
        console.log("🚀 ~ indie with message:", message.utf8Data);

        messageHandler(connection, JSON.parse(message.utf8Data));
      } catch (error) {
        console.log("🚀 ~ error:", error);
      }
      console.log("Received Message: " + message.utf8Data);
      connection.sendUTF(message.utf8Data);
    }
  });
  connection.on("close", function (reasonCode: any, description: any) {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
  });
});

function messageHandler(ws: connection, message: IncomingMessage) {
  console.log("🚀 ~ messageHandler ~ message:", JSON.stringify(message));

  if (message.type == SupportedMessage.JoinRoom) {
    const payload = message.payload;
    userManager.addUser(payload.name, payload.userId, payload.roomId, ws);
  } else if (message.type === SupportedMessage.SendMessage) {
    const payload = message.payload;
    const user = userManager.getUser(payload.roomId, payload.userId);
    if (!user) {
      console.log("user not found in db");
      return;
    }
    let chat = store.addChats(
      payload.userId,
      payload.name,
      payload.roomId,
      payload.message
    );
    if (!chat) {
      return null;
    }
    const outgoingPayload: OutgoingMessage = {
      type: OutgoingSupportMessages.AddChat,
      payload: {
        chatId: chat.id,
        roomId: payload.roomId,
        message: payload.message,
        name: user.name,
        upvotes: 0,
      },
    };
    userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
  }
  if (message.type === SupportedMessage.UpvoteMessage) {
    const payload = message.payload;
    let chat = store.upVote(payload.userId, payload.roomId, payload.chatId);
    if (!chat) {
      return null;
    }
    const outgoingPayload: OutgoingMessage = {
      type: OutgoingSupportMessages.UpdateChat,
      payload: {
        chatId: payload.chatId,
        roomId: payload.roomId,
        upvotes: chat.upVotes.length,
      },
    };
    userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
  }
}
