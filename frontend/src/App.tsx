import { Route, Routes } from "react-router-dom"
import JoinRoom from "./pages/JoinRoom"
import Chat from "./pages/Chat"


function App() {

  return (
    <div>
    <Routes>
    <Route path="/" element={<JoinRoom/>}/>
    <Route path="/chat" element={<Chat/>}/>
    </Routes>
    </div>
  )
}

export default App
