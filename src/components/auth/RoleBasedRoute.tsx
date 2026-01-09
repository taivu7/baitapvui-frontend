import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ProtectedRoute from './ProtectedRoute'

interface RoleBasedRouteProps {
  children: React.ReactNode
  allowedRole: 'student' | 'teacher'
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      {user?.role === allowedRole ? (
        <>{children}</>
      ) : (
        // Redirect to appropriate dashboard based on user's actual role
        <Navigate
          to={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
          replace
        />
      )}
    </ProtectedRoute>
  )
}

export default RoleBasedRoute
