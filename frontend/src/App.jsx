import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Chat from "./pages/Chat"
import Dashboard from "./pages/Dashboard"
import "./App.css"

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ backgroundColor: '#0a0f1e', minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}