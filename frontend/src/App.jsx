import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Stats from './pages/Stats'
import Navbar from './components/Navbar'

function PrivateRoute({ children }) {
  return localStorage.getItem('bs_token') ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><><Navbar /><Game /></></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><><Navbar /><Leaderboard /></></PrivateRoute>} />
        <Route path="/stats" element={<PrivateRoute><><Navbar /><Stats /></></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
