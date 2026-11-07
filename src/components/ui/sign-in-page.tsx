'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, Shield, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface LoginPageProps {
  role?: 'admin' | 'staff'
}

export function LoginPage({ role }: LoginPageProps = {}) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const isAdmin = role === 'admin'
  const isStaff = role === 'staff'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      })
      const text = await res.text()
      let data: any = {}
      try { data = text ? JSON.parse(text) : {} } catch { throw new Error(`Server error (${res.status}). API may be unavailable on this deployment.`) }
      if (!res.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      const r = data.user?.role || (isAdmin ? 'admin' : isStaff ? 'staff' : 'user')
      if (r === 'admin') navigate('/admin')
      else if (r === 'staff') navigate('/staff')
      else navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const title = isAdmin ? 'Admin Sign In' : isStaff ? 'Staff Sign In' : 'Welcome Back'
  const subtitle = isAdmin
    ? 'Sign in to manage the resort dashboard'
    : isStaff
      ? 'Sign in to access staff tools'
      : "Don't have an account? "

  const Icon = isAdmin ? Shield : Users

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex">
      {/* Left Panel - Image Section */}
      <div className="flex-1 relative overflow-hidden hidden md:block">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="absolute inset-0">
          <img
            src="/images/tuna-bay-hero.jpg"
            alt="Tuna Bay Resort"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                {title}
              </h1>
            </div>
            {isAdmin || isStaff ? (
              <p className="text-gray-600">{subtitle}</p>
            ) : (
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
