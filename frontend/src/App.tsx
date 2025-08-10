import { Route, Routes } from "react-router-dom"
import JoinRoom from "./pages/JoinRoom"
import Chat from "./pages/Chat"
import { Analytics } from "@vercel/analytics/react"


function App() {

  return (
    <div>
    <Routes>
    <Route path="/" element={<JoinRoom/>}/>
    <Route path="/chat" element={<Chat/>}/>
    </Routes>
    <Analytics/>
    </div>
  )
}

export default App
