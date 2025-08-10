import express from 'express'
import http from 'http'
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const port = process.env.PORT || 8080;

app.get('/',(req,res)=>{
  res.status(200).send('OK');
})

const server = http.createServer(app);
const wss = new WebSocketServer({server});

let onlineUsers: number = 0;

interface UserType {
  username: string;
  type: "join" | "create" | "chat" | "re-join" | "leave";
  roomId: string;
  socket: WebSocket;
  message?: string;
}

let allRooms: Map<string, UserType[] | []> = new Map<string, UserType[]>();

const isOpen = (socket: WebSocket) => {
  return socket.readyState == WebSocket.OPEN;
};

const userExists = (arr: UserType[], username: string): boolean => {
  return arr.some((u) => u.username == username);
};

const removeUser = (arr: UserType[], username: string) => {
  const newUsers = arr.filter((u) => u.username != username);
  return newUsers;
};

wss.on("connection", (socket: WebSocket) => {
  socket.on("message", async (message: string) => {
    const data: UserType = await JSON.parse(message);
    data.socket = socket;

    if (data.type == "create") {
      if (allRooms.has(data.roomId)) {
        socket.send("Room already exists");
        console.log("Room already exists");
        return;
      }
      let users: UserType[] = [data];
      allRooms.set(data.roomId, users);
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
      if (!allRooms.has(data.roomId)) {
        socket.send("Room not found");
        return;
      }

      let users: UserType[] = allRooms.get(data.roomId)!;
      if (userExists(users, data.username)) {
        socket.send("Username already present in room");
        return;
      }
      users.push(data);
      allRooms.set(data.roomId, users);
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
      let users: UserType[] = allRooms.get(data.roomId)!;
      users.forEach((u) => {
        if (u.socket != socket && isOpen(u.socket)) {
          u.socket.send(data.username + ": " + data.message);
        }
      });
    }

    if (data.type == "re-join") {
      if (!allRooms.has(data.roomId)) {
        socket.send("Room Expired");
        console.log("A user tried to join expired room");
        return;
      }
      let users: UserType[] = allRooms.get(data.roomId)!;
      users.push({
        username: data.username,
        type: "re-join",
        roomId: data.roomId,
        socket: socket,
      });
      allRooms.set(data.roomId, users);
      socket.send("Joined room : " + data.roomId);
      users.forEach((u) => {
        if (isOpen(u.socket))
          u.socket.send(`${data.username} rejoined the room`);
      });
      onlineUsers++;
      console.log(
        "A user rejoined room : " +
          data.roomId +
          ". Current online users: " +
          onlineUsers
      );
    }

    if (data.type == "leave") {
      if (!allRooms.has(data.roomId)) {
        return;
      }
      let users = allRooms.get(data.roomId)!;
      const index = users.findIndex((u) => u.socket === socket);
      if (index != -1) {
        let username = users[index].username;
        users.splice(index, 1);
        if (users.length == 0) allRooms.delete(data.roomId);
        users.forEach((u) => {
          if (isOpen(u.socket)) {
            u.socket.send(`${username} left the room`);
          }
        });
        onlineUsers--;
      }
    }
  });

  socket.on("close", () => {
    if (allRooms.size == 0) return;
    for (const [roomId, users] of allRooms.entries()) {
      const index = users.findIndex((u) => u.socket === socket);
      if (index != -1) {
        let username = users[index].username;
        users.splice(index, 1);
        if (users.length == 0) allRooms.delete(roomId);
        users.forEach((u) => {
          if (isOpen(u.socket)) {
            u.socket.send(`${username} left the room`);
          }
        });
        onlineUsers--;
      }
    }
  });
});

server.listen(port,()=>{
  console.log('Server connected')
})