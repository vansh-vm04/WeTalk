import { useContext, useEffect, useRef, useState, type RefObject } from "react";
import { WSContext } from "../context/WebSocketProvider";
import { useNavigate } from "react-router-dom";
import { type PayloadType, type MsgType } from "../types/Chat";

const Chat = () => {
  const navigate = useNavigate();
  const context = useContext(WSContext);
  const ws: RefObject<WebSocket | null> = context?.ws;
  const payloadStr: string | null = localStorage.getItem("payload");
  const [messages, setMessages] = useState<MsgType[]>([]);
  const [payload, setPayload] = useState<PayloadType>({
    username: "",
    roomId: "",
    type: "chat",
  });
  const [text, setText] = useState<string>("");
  const sent = "bg-yellow-500 text-gray-900 p-3 ml-auto rounded-lg max-w-xs ";
  const recieved = "bg-gray-700 p-3 rounded-lg max-w-xs";

  useEffect(() => {
    if (payloadStr == null) {
      navigate("/");
      return;
    }
    setPayload(JSON.parse(payloadStr));
  }, []);

  useEffect(() => {
    if (!ws?.current) return;
    const socket = ws?.current;
    if (socket)
      socket.onopen = () => {
        const payload = localStorage.getItem("payload");
        if (payload) {
          const data = JSON.parse(payload);
          const newData = {
            type: "re-join",
            roomId: data.roomId,
            username: data.username,
          };
          setTimeout(() => {
            socket.send(JSON.stringify(newData));
          }, 100);
        }
        console.log("WebSocket Connected");
      };
    socket.onmessage = (event) => {
      setMessages((prev) => [
        ...prev,
        { type: "recieved", message: event.data },
      ]);
      // console.log(event.data)
    };
  }, [ws.current]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length == 0) return;
    const data = {
      type: "chat",
      message: text,
      username: payload.username,
      roomId: payload.roomId,
    };
    ws.current?.send(JSON.stringify(data));
    setMessages((prev) => [...prev, { type: "sent", message: text }]);
    setText("");
  };

  const handleLeave = () => {
    const leaveData = {
      type: "leave",
      roomId: payload.roomId,
      username: payload.username,
    };
    ws.current?.send(JSON.stringify(leaveData));
    localStorage.removeItem("payload");
    navigate("/");
  };

  return (
    <div className="flex w-screen h-screen items-center justify-center text-white">
      <div className="flex max-md:w-full flex-col w-[444px] h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
          <span className="text-yellow-400 font-bold text-xl">WeTalk</span>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              Room ID:{" "}
              <span className="text-yellow-400">{payload?.roomId}</span>
            </span>

            <button
              onClick={handleLeave} // you define this function
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-1.5 rounded-lg transition-colors duration-200 shadow-sm"
            >
              Leave
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollStyle p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={m.type == "sent" ? sent : recieved}>
              {m.message}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-gray-800 p-4 flex items-center">
          <input
            onChange={(e) => setText(e.target.value)}
            value={text}
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="ml-3 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
