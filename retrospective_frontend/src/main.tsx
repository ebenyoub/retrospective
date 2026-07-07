import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/auth/AuthContext.tsx'
import App from './App.tsx'
import Header from './components/Header.tsx'
import Profile from './pages/private/Profile.tsx'
import Login from './pages/auth/Login.tsx'
import './index.css'
import SessionCreate from './pages/private/SessionCreate.tsx'
import Signup from './pages/auth/Signup.tsx'
import Forgot from './pages/auth/Forgot.tsx'
import SessionDashboard from './pages/private/SessionDashboard.tsx'
import { ToastProvider } from './context/toast/toastContext.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <Header />
                    <main>
                        <Routes>
                            <Route path="/" element={<App />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot" element={<Forgot />} />
                            <Route path="/session" element={<SessionCreate />} />
                            <Route path="/session/:id" element={<SessionDashboard />} />
                        </Routes>
                    </main>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)
