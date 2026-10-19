import React, { createContext, useContext, useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { UserProfile, userService } from '@/services/api'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  login: (email: string, pass: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
  isAdmin: boolean
  requestPasswordReset: (email: string) => Promise<{ error: any }>
  confirmPasswordReset: (token: string, password: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const refreshUser = async () => {
    if (pb.authStore.isValid && pb.authStore.model) {
      try {
        const currentUser = await userService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Error getting user', err)
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshUser()

    // Listen to PB auth changes
    return pb.authStore.onChange(() => {
      refreshUser()
    })
  }, [])

  const login = async (email: string, pass: string) => {
    try {
      await pb.collection('users').authWithPassword(email, pass)
      await refreshUser()
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
  }

  const requestPasswordReset = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email.trim().toLowerCase())
      return { error: null }
    } catch (error: any) {
      console.error('Password reset request error:', error)
      return { error }
    }
  }

  const confirmPasswordReset = async (token: string, password: string) => {
    try {
      await pb.collection('users').confirmPasswordReset(token.trim(), password, password)
      return { error: null }
    } catch (error: any) {
      console.error('Password reset confirmation error:', error)
      return { error }
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAdmin,
        requestPasswordReset,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
