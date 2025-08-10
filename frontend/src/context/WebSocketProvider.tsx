import { createContext, useEffect, useRef, type ReactNode } from "react"
const env = import.meta.env

interface Type{
  ws:React.Ref<WebSocket | null>;
}

export const WSContext = createContext<Type | null>(null);

export const WebSocketProvider = ({children}:{children:ReactNode})=>{
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
    const ws = new WebSocket(`${env.VITE_SOCKET_URL}`);
    wsRef.current = ws;
    ws.onopen = () => {
      const payload = localStorage.getItem('payload');
      if(payload){
        const data = JSON.parse(payload);
        const newData = {
          type:'re-join',
          roomId:data.roomId,
          username:data.username
        }
        ws.send(JSON.stringify(newData));
      }
      console.log("WebSocket Connected");
    };

    ws.onerror = (err) => {
      console.error("WebSocket Error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => ws.close();
  }, []);

  return (
    <WSContext.Provider value={{ws:wsRef}}>
        {children}
    </WSContext.Provider>
  )
}