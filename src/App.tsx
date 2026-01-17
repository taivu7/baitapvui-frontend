import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import TeacherDashboard from './pages/TeacherDashboard'
import CreateAssignment from './pages/CreateAssignment'
import DashboardLayout from './components/layout/DashboardLayout'
import { AuthProvider } from './context/AuthContext'
import RoleBasedRoute from './components/auth/RoleBasedRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/teacher/dashboard"
            element={
              <RoleBasedRoute allowedRole="teacher">
                <DashboardLayout>
                  <TeacherDashboard />
                </DashboardLayout>
              </RoleBasedRoute>
            }
          />
          <Route
            path="/teacher/assignments/new"
            element={
              <RoleBasedRoute allowedRole="teacher">
                <DashboardLayout>
                  <CreateAssignment />
                </DashboardLayout>
              </RoleBasedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
