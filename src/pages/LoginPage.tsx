import React, { useState } from 'react'
import Header from '../components/layout/Header'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

type UserRole = 'student' | 'teacher'

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ email, password, role })
    } catch (err) {
      console.error('Login failed:', err)
      setError('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = (provider: 'google' | 'microsoft') => {
    console.log(`Login with ${provider}`)
    // TODO: Implement OAuth login
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111813] dark:text-white transition-colors duration-200 min-h-screen flex flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-[1024px] overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col lg:flex-row border border-[#f0f4f2] dark:border-[#2a3c30]">

          {/* Left Panel - Hero Section */}
          <div
            className="relative hidden w-full lg:flex lg:w-5/12 flex-col justify-between bg-cover bg-center p-8 lg:p-12"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(16, 34, 22, 0.2) 0%, rgba(16, 34, 22, 0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAuyr_Kx_X1hE7r103S_Oh3iIiLrxuw4BEopBRpv4axr3GQMa6-gSQIKbm7fAMsoCu3XRJrh_6LnHOQgbEf5fcrOXNhAs01Q6TLYq3UWVKgdqJ06W7cc_kTT2B3o51IifRMbXHOgGglH9hlFXmXDeHHkZqCM1bWJuebhl4wiwuogudNCNJcE_sMurgbN9P4aiWDGy8AR6ejZDpgFj2eDo6Le1D7gS5oKJFhSSOk3RwGN4YtXE7Du0PGNaUzVuqCA3TG_bM4DYU8rPo")`
            }}
          >
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-white border border-white/10">
                Top Rated Platform
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold leading-tight text-white tracking-tight">
                Learning made fun and easy for everyone.
              </h1>
              <p className="text-sm text-white/90 font-medium leading-relaxed">
                Join thousands of teachers and students on hoctapvui to streamline assignments and track progress effortlessly.
              </p>
              <div className="mt-4 flex gap-2">
                <div className="h-1 w-8 rounded-full bg-primary"></div>
                <div className="h-1 w-2 rounded-full bg-white/30"></div>
                <div className="h-1 w-2 rounded-full bg-white/30"></div>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="w-full lg:w-7/12 p-6 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-[#111813] dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please enter your details to sign in.
              </p>
            </div>

            {/* Role Toggle */}
            <div className="mb-8 grid grid-cols-2 gap-2 rounded-xl bg-[#f0f4f2] dark:bg-[#102216] p-1.5 border border-[#e5e7eb] dark:border-[#2a3c30]">
              <button
                onClick={() => setRole('student')}
                className={`group flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  role === 'student'
                    ? 'bg-white dark:bg-[#1a2c20] text-[#111813] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#111813] dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    role === 'student' ? 'text-primary' : 'group-hover:text-primary'
                  } transition-colors`}
                  style={{ fontSize: '20px' }}
                >
                  backpack
                </span>
                Student
              </button>
              <button
                onClick={() => setRole('teacher')}
                className={`group flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  role === 'teacher'
                    ? 'bg-white dark:bg-[#1a2c20] text-[#111813] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#111813] dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    role === 'teacher' ? 'text-primary' : 'group-hover:text-primary'
                  } transition-colors`}
                  style={{ fontSize: '20px' }}
                >
                  school
                </span>
                Teacher
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                icon="mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-[#111813] dark:text-white">
                    Password
                  </label>
                  <a className="text-xs font-medium text-primary hover:text-primary/80" href="#">
                    Forgot password?
                  </a>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  icon="lock"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" variant="primary" className="mt-2 w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>

              {/* Divider */}
              <div className="relative my-2 flex items-center py-2">
                <div className="flex-grow border-t border-[#f0f4f2] dark:border-[#2a3c30]"></div>
                <span className="flex-shrink-0 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-[#f0f4f2] dark:border-[#2a3c30]"></div>
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] dark:border-[#2a3c30] bg-white dark:bg-[#102216] py-2.5 text-sm font-medium text-[#111813] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1a2c20] transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('microsoft')}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] dark:border-[#2a3c30] bg-white dark:bg-[#102216] py-2.5 text-sm font-medium text-[#111813] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1a2c20] transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h23v23H0z" fill="#f3f3f3" />
                    <path d="M1 1h10v10H1z" fill="#f35325" />
                    <path d="M12 1h10v10H12z" fill="#81bc06" />
                    <path d="M1 12h10v10H1z" fill="#05a6f0" />
                    <path d="M12 12h10v10H12z" fill="#ffba08" />
                  </svg>
                  Microsoft
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center text-sm font-normal text-gray-500">
              Don't have an account?{' '}
              <a
                className="font-bold text-[#111813] dark:text-white hover:text-primary dark:hover:text-primary transition-colors decoration-2 underline-offset-4 hover:underline"
                href="#"
              >
                Sign up for free
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 dark:text-gray-600">
        <p>© 2024 hoctapvui Inc. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default LoginPage
