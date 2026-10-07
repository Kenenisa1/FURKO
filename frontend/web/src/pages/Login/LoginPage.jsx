import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as authLogin } from '../../services/authService.js';
import { useApp } from '../../context/AppContext.jsx';
import {
  Building2,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Loader2,
  CircleX,
  FileText,
  UserCheck,
  TrendingUp,
  Users
} from 'lucide-react';
import furkoLogo from '../../assets/furko-logo.jpg';
import jimmaCityImage from '../../assets/jimma-city.jpg';

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
          <div className="mb-8 flex justify-center">
            <img 
              src={furkoLogo} 
              alt="FURKO" 
              className="h-16 w-auto object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Institution / Government Login</h1>
          <p className="text-sm text-gray-500 mb-6">Access your dashboard and manage community reports.</p>

          {/* Institution selector */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-[#1a6b3c]/30 bg-[#f5f9f6] mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#1a6b3c]/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-[#1a6b3c]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Jimma City Administration</p>
              <p className="text-xs text-gray-500">Government Institution</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
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
                <CircleX className="w-4 h-4 text-red-500 flex-shrink-0" />
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
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4" />
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
            <ShieldCheck className="w-4 h-4 text-[#1a6b3c] flex-shrink-0" />
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
              src={jimmaCityImage}
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
                  { icon: <FileText className="w-5 h-5" />, label: 'View\nReports' },
                  { icon: <UserCheck className="w-5 h-5" />, label: 'Assign &\nManage Tasks' },
                  { icon: <TrendingUp className="w-5 h-5" />, label: 'Track\nProgress' },
                  { icon: <Users className="w-5 h-5" />, label: 'Serve Your\nCommunity' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white">
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
