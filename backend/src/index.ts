import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let onlineUsers: number = 0;

interface UserType {
  username: string;
  type: "join" | "create" | "chat" | "re-join";
  roomId: string;
  socket: WebSocket;
  message: string;
}

let allSockets: Map<string, UserType[]> = new Map<string, UserType[]>();

const userExists = (arr: UserType[], username: string): boolean => {
  arr.forEach((u) => {
    if (u.username === username) return true;
  });
  return false;
};

const removeUser = (arr: UserType[], username: string) => {
   const newUsers = arr.filter((u)=>u.username != username);
   return newUsers;
};

wss.on("connection", (socket: WebSocket) => {
  socket.on("message", async (message: string) => {
    const data: UserType = await JSON.parse(message);
    data.socket = socket;
    if (data.type == "create") {
      if (allSockets.has(data.roomId)) {
        socket.send("Room already exists");
        console.log("Room already exists");
        return;
      }
      let users: UserType[] = [data];
      allSockets.set(data.roomId, users);
      onlineUsers++;
      socket.send("Joined with room Id : " + data.roomId);
      console.log(
        "New room created with Id: " +
          data.roomId +
          ". Current online users: " +
          onlineUsers
      );
    }

    if (data.type == "join") {
      if (!allSockets.has(data.roomId)) {
        socket.send("Room not found");
        return;
      }

      let users: UserType[] = allSockets.get(data.roomId)!;
      if (userExists(users, data.username)) {
        socket.send("Username already present in room");
        return;
      }
      users.push(data);
      allSockets.set(data.roomId, users);
      onlineUsers++;
      socket.send("Joined room : " + data.roomId);
      console.log(
        "New new user connected to room: " +
          data.roomId +
          ". Current online users: " +
          onlineUsers
      );
    }

    if (data.type == "chat") {
      let users: UserType[] = allSockets.get(data.roomId)!;
      users.forEach((u) => {
        if (u.username != data.username) {
          u.socket.send(data.username + ": " + data.message);
        }
      });
    }

    if (data.type == "re-join") {
      if (!allSockets.has(data.roomId)) {
        socket.send("Room Expired");
        console.log('A user tried to join expired room')
        return;
      }
      let users: UserType[] = allSockets.get(data.roomId)!;
      let newUsers = removeUser(users,data.username);
      newUsers.push(data);
      console.log(newUsers);
      allSockets.set(data.roomId, newUsers);
      socket.send("Joined room : " + data.roomId);
      console.log(
        "A user rejoined room : " +
          data.roomId +
          ". Current online users: " +
          onlineUsers
      );
    }
  });
});
