import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import useAuth from './hooks/useAuth'

import Navbar    from './components/Navbar'
import Login     from './pages/Login'
import Register  from './pages/Register'
import MentorList        from './pages/MentorList'
import Profile           from './pages/Profile'
import Dashboard         from './pages/Dashboard'
import Sessions          from './pages/Sessions'
import MentorProfileEdit from './pages/MentorProfileEdit'
import AdminDashboard    from './pages/AdminDashboard'

const Loader = () => (
  <div className="page-loader">
    <div className="spinner" />
    <span style={{ color:'var(--ink-3)', fontSize:14 }}>Loading…</span>
  </div>
)

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return <Loader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Loader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"        element={<Navigate to="/mentors" replace />} />
        <Route path="/login"   element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/mentors"  element={<MentorList />} />
        <Route path="/mentors/:id" element={<Profile />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/sessions"  element={<PrivateRoute><Sessions /></PrivateRoute>} />
        <Route path="/mentor/edit" element={<PrivateRoute roles={['mentor']}><MentorProfileEdit /></PrivateRoute>} />
        <Route path="/admin"     element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="*"          element={<Navigate to="/mentors" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-3)',
              color: 'var(--ink)',
              border: '1px solid var(--border-2)',
              borderRadius: '12px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00e5cc', secondary: '#050508' } },
            error:   { iconTheme: { primary: '#ff4d6d', secondary: '#050508' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
