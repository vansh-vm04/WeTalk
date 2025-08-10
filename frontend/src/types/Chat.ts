export interface WSContextType{
  ws:React.Ref<WebSocket | null>;
}

export interface MsgType {
  type: "sent" | "recieved";
  message: string;
}

export interface PayloadType {
  username: string;
  type: "join" | "create" | "chat" | "re-join";
  roomId: string;
  socket?: WebSocket;
  message?: string;
}