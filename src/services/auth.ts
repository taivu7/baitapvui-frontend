import apiClient from './api'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'teacher'
  language: string
  theme: string
}

export interface LoginRequest {
  email: string
  password: string
  role: 'student' | 'teacher'
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'student' | 'teacher'
}

const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)

    // Store access token and user data
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    return response.data
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register', data)

    // Store access token and user data
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    return response.data
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token')
  },
}

export default authService
