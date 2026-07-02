import { Link, useLocation } from "react-router-dom"

export default function Navbar() {
  const location = useLocation()
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between"
      style={{backgroundColor: '#0a0f1e', borderBottom: '1px solid #1e3a5f'}}>
      
      <div className="flex items-center gap-3">
        <div className="text-2xl"></div>
        <div>
          <span className="text-xl font-bold" style={{color: '#00d4ff'}}>MedQuery</span>
          <span className="text-xl font-bold text-white"> AI</span>
        </div>
        <div className="text-xs px-2 py-1 rounded-full ml-2"
          style={{backgroundColor: '#1e3a5f', color: '#00d4ff', border: '1px solid #00d4ff'}}>
          BETA
        </div>
      </div>

      <div className="flex gap-2">
        <Link to="/"
          className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: location.pathname === '/' ? '#00d4ff' : 'transparent',
            color: location.pathname === '/' ? '#0a0f1e' : '#94a3b8',
            border: '1px solid',
            borderColor: location.pathname === '/' ? '#00d4ff' : '#1e3a5f'
          }}>
           Chat
        </Link>
        <Link to="/dashboard"
          className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: location.pathname === '/dashboard' ? '#00d4ff' : 'transparent',
            color: location.pathname === '/dashboard' ? '#0a0f1e' : '#94a3b8',
            border: '1px solid',
            borderColor: location.pathname === '/dashboard' ? '#00d4ff' : '#1e3a5f'
          }}>
           Dashboard
        </Link>
      </div>
    </nav>
  )
}