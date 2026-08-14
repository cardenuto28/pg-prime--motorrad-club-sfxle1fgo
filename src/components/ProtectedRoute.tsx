import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs tracking-widest uppercase font-montserrat">Carregando...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location.pathname, openLogin: true }} replace />
  }

  return <>{children}</>
}
