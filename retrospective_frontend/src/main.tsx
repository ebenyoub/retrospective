import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/auth/AuthContext.tsx'
import Header from './components/Header.tsx'
import Login from './pages/auth/Login.tsx'
import './App.css'
import './index.css'
import SessionCreate from './pages/private/SessionCreate.tsx'
import Signup from './pages/auth/Signup.tsx'
import Forgot from './pages/auth/Forgot.tsx'
import SessionDashboard from './pages/private/SessionDashboard.tsx'
import SessionList from './pages/private/SessionList.tsx'
import { ToastProvider } from './context/toast/ToastContext.tsx'
import Home from './pages/home/home.tsx'
import RequireAuth from './components/RequireAuth.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <Header />
                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot" element={<Forgot />} />
                            <Route path="/sessions" element={<RequireAuth><SessionList /></RequireAuth>} />
                            <Route path="/session" element={<RequireAuth><SessionCreate /></RequireAuth>} />
                            {/* Pas de RequireAuth : un participant invité doit rester sur la
                                page de session et choisir un pseudo, pas être redirigé vers /login. */}
                            <Route path="/session/:id" element={<SessionDashboard />} />
                        </Routes>
                    </main>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)
