import { useContext, useEffect, useRef, useState } from "react";
import { WSContext } from "../context/WebSocketProvider";
import { useNavigate } from "react-router-dom";

interface MsgType {
  type: "sent" | "recieved";
  message: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const context = useContext(WSContext);
  const ws = context?.ws;
  const payloadStr: string = localStorage.getItem("payload");
  const [messages, setMessages] = useState<MsgType[]>([]);
  const [payload, setPayload] = useState({});
  const [text, setText] = useState<string>('');
  const sent = "bg-yellow-500 text-gray-900 p-3 rounded-lg max-w-xs self-end";
  const recieved = "bg-gray-700 p-3 rounded-lg max-w-xs";
  useEffect(() => {
    if (payloadStr == null){ navigate("/"); return;};
    setPayload(JSON.parse(payloadStr));
  }, []);

  useEffect(()=>{
    if(!ws.current) return;
    ws.current.onmessage = (event) => {
      setMessages((prev)=>[...prev, { type: "recieved", message: event.data }]);
      console.log(event.data)
    };
  },[])

  const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

  const sendMessage = async () => {
    if (!text || text.length == 0) return;
    let data = {
      type: "chat",
      message: text,
      username: payload.username,
      roomId: payload.roomId,
    };
    ws.current.send(JSON.stringify(data));
    setMessages((prev)=>[...prev, { type: "sent", message: text }]);
    setText('')
  };

  return (
    <div className="flex w-screen h-screen items-center justify-center text-white">
      <div className="flex max-md:w-full flex-col w-[444px] h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
          <span className="text-yellow-400 font-bold text-xl">WeTalk</span>
          <span className="text-sm text-gray-300">
            Room ID: <span className="text-yellow-400">{payload?.roomId}</span>
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollStyle p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={m.type == "sent" ? sent : recieved}>
              {m.message}
            </div>
          ))}
          <div ref={messagesEndRef}/>
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
