import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import authService, { User, LoginRequest, RegisterRequest } from '../services/auth'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in on mount
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data)
      setUser(response.user)

      // Navigate based on role
      if (response.user.role === 'teacher') {
        navigate('/teacher/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data)
      setUser(response.user)

      // Navigate based on role
      if (response.user.role === 'teacher') {
        navigate('/teacher/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
