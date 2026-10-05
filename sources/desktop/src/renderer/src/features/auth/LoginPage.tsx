import React, { useState } from 'react'
import {
  PersonRegular,
  LockClosedRegular,
  EyeRegular,
  EyeOffRegular,
  ShieldCheckmarkRegular,
  ArrowClockwiseRegular,
  SparkleRegular
} from '@fluentui/react-icons'
import api from '../../services/api'

interface LoginPageProps {
  onLoginSuccess: (token: string) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps): React.JSX.Element {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setErrorMessage(null)

    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập!')
      return
    }

    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu!')
      return
    }

    try {
      setLoading(true)
      // Call backend POST /api/auth/login -> returns ONLY { token: string }
      const res = await api.login({ username: username.trim(), password })
      if (res && res.token) {
        localStorage.setItem('gms_token', res.token)
        onLoginSuccess(res.token)
      } else {
        setErrorMessage('Máy chủ không trả về token xác thực hợp lệ.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản!')
    } finally {
      setLoading(false)
    }
  }

  const fillQuickDemo = (): void => {
    setUsername('admin')
    setPassword('admin123')
    setErrorMessage(null)
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-4 font-sans text-slate-100">
      {/* Background ambient gold glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-600/15 blur-3xl" />

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-amber-500/20 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header & Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/40 bg-gradient-to-tr from-amber-600 to-yellow-400 shadow-lg shadow-amber-500/20">
            <SparkleRegular className="text-3xl text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            QUẢN LÝ TIỆM VÀNG
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-amber-400">
            Đề tài 25 • Nhóm 04 • ĐH Công Nghệ Đông Á
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            <ShieldCheckmarkRegular className="text-sm" />
            <span>Hệ thống bảo mật xác thực Token JWT</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-950/50 p-3.5 text-sm text-red-200">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-red-400">Lỗi:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Tên đăng nhập
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <PersonRegular className="text-lg" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập (ví dụ: admin)"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 transition-colors focus:border-amber-400 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={fillQuickDemo}
                className="text-xs text-amber-400 transition-colors hover:text-amber-300 hover:underline"
              >
                Tài khoản mặc định
              </button>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <LockClosedRegular className="text-lg" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pr-11 pl-10 text-sm text-white placeholder-slate-500 transition-colors focus:border-amber-400 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOffRegular className="text-lg" />
                ) : (
                  <EyeRegular className="text-lg" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-yellow-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <ArrowClockwiseRegular className="animate-spin text-lg" />
                <span>ĐANG XÁC THỰC...</span>
              </>
            ) : (
              <span>ĐĂNG NHẬP HỆ THỐNG</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
          <p>Tài khoản thử nghiệm: <span className="font-mono text-slate-400">admin</span> / <span className="font-mono text-slate-400">admin123</span></p>
          <p className="mt-1">Mọi truy cập đều được mã hóa và bảo vệ theo chuẩn Spring Security</p>
        </div>
      </div>
    </div>
  )
}
