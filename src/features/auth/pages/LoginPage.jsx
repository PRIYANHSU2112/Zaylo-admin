import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Navigate } from '@tanstack/react-router'
import { Shield, Sparkles, User, Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react'
import { useLoginMutation } from '../../../store/api/auth.api'
import Button from '../../../components/ui/Button'
import zayloLogo from '../../../assets/zaylo-logo.png'
import zigZacImg from '../../../assets/products/zig-zac.png'
import noodlesImg from '../../../assets/products/noodles.png'
import moonLiteImg from '../../../assets/products/moon-lite.png'

// Seed-account shortcuts exist only in `vite dev`; the whole branch is stripped from production builds.
const DEV_DEMO = import.meta.env.DEV
  ? {
      Admin: { email: 'admin@zaylo.com', password: 'Admin123!' },
      Manager: { email: 'manager@zaylo.com', password: 'Manager123!' },
    }
  : null

export default function LoginPage() {
  const navigate = useNavigate()
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const [login, { isLoading }] = useLoginMutation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Admin')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/" />
  }

  const submitLogin = async (payload) => {
    setApiError('')
    try {
      await login({
        email: payload.email,
        password: payload.password,
        role: payload.role,
      }).unwrap()
      navigate({ to: '/' })
    } catch (err) {
      setApiError(err?.data?.message || 'Invalid credentials')
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (isLoading) return

    const validationErrors = {}
    if (!email.trim()) validationErrors.email = 'Email address is required'
    else if (!/\S+@\S+\.\S+/.test(email)) validationErrors.email = 'Please enter a valid email address'
    if (!password) validationErrors.password = 'Password is required'
    else if (password.length < 4) validationErrors.password = 'Password must be at least 4 characters'

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    submitLogin({ email, password, role })
  }

  const handleQuickLogin = (selectedRole) => {
    if (isLoading || !DEV_DEMO) return
    const { email: demoEmail, password: demoPassword } = DEV_DEMO[selectedRole]
    setEmail(demoEmail)
    setPassword(demoPassword)
    setRole(selectedRole)
    submitLogin({ email: demoEmail, password: demoPassword, role: selectedRole })
  }

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9F6] font-sans flex overflow-hidden text-slate-800">
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-gradient-to-b from-[#FFF5F5] via-[#FFFDF5] to-[#F5FBF7] relative overflow-hidden rounded-r-[55px] md:rounded-r-[75px] border-r border-slate-200/50 shadow-[8px_0_30px_rgba(0,0,0,0.02)] z-10">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#8C0B12_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="relative z-10 flex items-start">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <img src={zayloLogo} alt="Zaylo Header Logo" className="h-9 w-auto object-contain" />
          </div>
        </div>
        <div className="relative z-10 max-w-sm space-y-5 animate-in fade-in slide-in-from-left-6 duration-500">
          <div className="space-y-2.5">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 font-display leading-tight">
              Welcome Back!
            </h1>
            <h2 className="text-2xl font-semibold text-[#8C0B12] font-display">
              Let's grow deliciously together.
            </h2>
          </div>
          <div className="flex items-center gap-3 bg-white/80 border border-slate-200/60 p-3.5 rounded-2xl max-w-[280px] shadow-sm">
            <ShieldCheck className="text-[#8C0B12] w-5 h-5 shrink-0" />
            <span className="text-xs font-bold text-slate-700 tracking-wide">
              Secure, Simple & Smart Admin Access
            </span>
          </div>
        </div>
        <div className="relative z-10 flex justify-center items-end h-64 -mb-4">
          <div className="flex justify-center items-end w-full relative">
            <div className="absolute left-4 bottom-2 w-32 rotate-[-12deg] filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.12)] animate-bounce duration-5000">
              <img src={zigZacImg} alt="Snack Puffs" className="w-full h-auto object-contain" />
            </div>
            <div className="absolute right-4 bottom-4 w-32 rotate-[12deg] filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.12)] animate-pulse">
              <img src={moonLiteImg} alt="Snack Moon Lite" className="w-full h-auto object-contain" />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-8 w-36 z-20 filter drop-shadow-[0_15px_22px_rgba(0,0,0,0.15)] animate-bounce duration-3000">
              <img src={noodlesImg} alt="Snack Noodles" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex flex-col justify-between p-6 md:p-12 relative z-0 min-h-screen bg-[#FAF9F6]">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center z-0 overflow-hidden">
          <img
            src={zayloLogo}
            alt=""
            className="w-[110%] h-auto max-w-[650px] object-contain opacity-[0.06] filter blur-[60px]"
          />
        </div>
        <div className="h-6" />
        <div className="flex-1 flex items-center justify-center py-8 relative z-10">
          <div className="w-full max-w-[420px] bg-white border border-slate-200 p-8 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-800 font-display">Welcome Back</h2>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                Sign in to access your Zaylo Snacks admin panel
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {apiError && (
                <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {apiError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className={`w-full bg-white border rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all ${
                      errors.email
                        ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/5'
                        : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5'
                    }`}
                    value={email}
                    disabled={isLoading}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600">Password</label>
                  <span className="text-[11px] font-semibold text-slate-400">Forgot it? Ask an Admin to reset it.</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`w-full bg-white border rounded-xl py-3 pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all ${
                      errors.password
                        ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/5'
                        : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5'
                    }`}
                    value={password}
                    disabled={isLoading}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[11px] font-semibold text-slate-400">Session ends when this tab closes</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Role:</span>
                  <select
                    value={role}
                    disabled={isLoading}
                    onChange={(e) => setRole(e.target.value)}
                    className="text-xs font-bold text-primary bg-transparent outline-none cursor-pointer border-none p-0 focus:ring-0"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-sm font-bold rounded-xl text-white mt-4 flex items-center justify-center gap-2 border-none transition-all active:scale-98 disabled:opacity-50 py-3.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {DEV_DEMO && (
            <div className="border-t border-slate-100 mt-5 pt-4">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Dev-only Quick Login (seed accounts)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin('Admin')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                >
                  <Shield size={12} className="text-primary" />
                  Admin SSO
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin('Manager')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles size={12} className="text-primary" />
                  Manager SSO
                </button>
              </div>
            </div>
            )}

            <div className="flex items-center justify-center gap-1.5 mt-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <ShieldCheck size={14} className="text-emerald-600" />
              Secure Login Protected By Encryption
            </div>
          </div>
        </div>

        <div className="text-center lg:flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-200/50 pt-4">
          <p>© {new Date().getFullYear()} ZAY&apos;LO Snacks. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
