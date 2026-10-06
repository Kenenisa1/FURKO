import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as authLogin } from '../../services/authService.js';
import { useApp } from '../../context/AppContext.jsx';

// FURKO logo SVG mark
function FurkoLogo({ size = 48 }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-xl bg-[#e8f5ee] flex items-center justify-center border-2 border-[#1a6b3c]/20"
        style={{ width: size, height: size }}
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 40 48" fill="none">
          <path d="M20 2C20 2 8 10 8 22C8 30 13 36 20 38C27 36 32 30 32 22C32 10 20 2 20 2Z" fill="#1a6b3c" />
          <circle cx="20" cy="30" r="3" fill="white" />
          <path d="M14 20C14 20 17 16 20 16C23 16 26 20 26 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-black text-[#1a6b3c] text-xl tracking-tight leading-none">FURKO</p>
        <p className="text-[#1a6b3c]/50 text-[8px] tracking-widest uppercase">Report · Track · Resolve</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [email, setEmail] = useState('institution@furko.local');
  const [password, setPassword] = useState('password');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await authLogin(email, password);
      login(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-white">

        {/* ── Left: Form ── */}
        <div className="w-full md:w-[420px] flex-shrink-0 p-10 flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-8">
            <FurkoLogo size={52} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Institution / Government Login</h1>
          <p className="text-sm text-gray-500 mb-6">Access your dashboard and manage community reports.</p>

          {/* Institution selector */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-[#1a6b3c]/30 bg-[#f5f9f6] mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#1a6b3c]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#1a6b3c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1M9 16h6" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Jimma City Administration</p>
              <p className="text-xs text-gray-500">Government Institution</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-[#1a6b3c] hover:underline">
                Forgot Password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1a6b3c] hover:bg-[#145230] text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  Login
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google login (demo) */}
          <button
            type="button"
            onClick={() => setError('Google login is not available in this demo.')}
            className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </button>

          {/* Security note */}
          <div className="flex items-center gap-2 mt-5">
            <svg className="w-4 h-4 text-[#1a6b3c] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-gray-500">
              Secure access for authorized government and institution staff only
            </p>
          </div>
        </div>

        {/* ── Right: Visual panel ── */}
        <div className="hidden md:flex flex-1 relative overflow-hidden bg-[#1a6b3c]">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a5c35] via-[#1a6b3c] to-[#22863a]" />

          {/* City image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1565799557186-b23dbe5f83f7?w=800&h=600&fit=crop"
              alt="Jimma City"
              className="w-full h-full object-cover opacity-30"
            />
          </div>

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col h-full p-10">
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white leading-tight mb-3">
                Welcome Back,
              </h2>
              <p className="text-white/80 text-base leading-relaxed">
                Together we build safer, cleaner and<br />more responsive community
              </p>
            </div>

            {/* Bottom green wave section */}
            <div className="bg-[#145230]/70 backdrop-blur-sm rounded-2xl p-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { icon: '📋', label: 'View\nReports' },
                  { icon: '✅', label: 'Assign &\nManage Tasks' },
                  { icon: '📊', label: 'Track\nProgress' },
                  { icon: '👥', label: 'Serve Your\nCommunity' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-lg">
                      {item.icon}
                    </div>
                    <p className="text-white/80 text-[10px] leading-snug whitespace-pre-line">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
