import { useContext, useEffect, useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { WSContext } from "../context/WebSocketProvider";

const JoinRoom = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [type, setType] = useState<string>("create");
  const [message, setMessage] = useState<string>();
  const navigate = useNavigate();
  const context = useContext(WSContext);
  const ws: RefObject<WebSocket> = context?.ws;

  useEffect(() => {
    if (!ws.current) return;
    const socket = ws.current;
    socket.onmessage = (event) => {
      setMessage(event.data);
    };
  }, [ws.current]);

  useEffect(() => {
    if (message?.startsWith("Joined")) {
      navigate("/chat");
    }
  }, [message]);

  const talk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      username: username,
      type: type,
      roomId: roomId,
    };
    const payloadStr = JSON.stringify(payload);
    localStorage.setItem("payload", payloadStr);
    ws.current.send(payloadStr);
  };

  return (
    <div className="flex w-screen h-screen items-center justify-center text-white">
      <form
        onSubmit={(e) => talk(e)}
        className="bg-gray-900 max-w-[360px] min-w-[300px] rounded-2xl p-8 flex flex-col gap-6 items-center shadow-2xl border border-yellow-600"
      >
        <span className="text-4xl font-bold tracking-wide text-yellow-500">
          WeTalk
        </span>

        <div className="w-full">
          <label
            htmlFor="username"
            className="block mb-1 text-sm font-medium text-gray-300"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            maxLength={20}
            className="bg-gray-800 border border-gray-700 placeholder-gray-400 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            placeholder="John"
            required
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="room"
            className="block mb-1 text-sm font-medium text-gray-300"
          >
            Room ID
          </label>
          <input
            onChange={(e) => setRoomId(e.target.value.toLocaleUpperCase())}
            type="text"
            id="room"
            maxLength={10}
            placeholder="JOHN28"
            className="bg-gray-800 border border-gray-700 placeholder-gray-400 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            required
            value={roomId}
          />
        </div>

        <fieldset className="w-full flex items-center gap-6 px-1">
          <div className="flex items-center gap-2">
            <input
              id="create"
              name="room-action"
              type="radio"
              value="create"
              className="w-4 h-4 rounded-full border-2 border-yellow-500 checked:bg-yellow-500 checked:border-yellow-500 appearance-none cursor-pointer"
              checked={type === "create"}
              onChange={(e) => setType(e.target.value)}
            />
            <label htmlFor="create" className="text-md text-gray-300">
              Create
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="join"
              name="room-action"
              type="radio"
              value="join"
              className="w-4 h-4 rounded-full border-2 border-yellow-500 checked:bg-yellow-500 checked:border-yellow-500 appearance-none cursor-pointer"
              checked={type === "join"}
              onChange={(e) => setType(e.target.value)}
            />
            <label htmlFor="join" className="text-md text-gray-300">
              Join
            </label>
          </div>
        </fieldset>
        <span className="text-yellow-300 text-sm">{message}</span>
        <button
          type="submit"
          className="mt-2 hover:cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg w-full px-5 py-2.5 transition-colors duration-200"
        >
          Let me talk
        </button>
      </form>
    </div>
  );
};

export default JoinRoom;
