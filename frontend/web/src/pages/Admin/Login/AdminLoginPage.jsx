import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../../services/admin/adminAuthService.js';
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  User,
} from 'lucide-react';
import furkoLogo from '../../../assets/furko-logo.jpg';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@furko.local');
  const [password, setPassword] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a5c35] to-[#1a6b3c] px-8 py-10">
            <div className="flex justify-center mb-4">
              <img src={furkoLogo} alt="FURKO" className="h-16 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              System Administrator
            </h1>
            <p className="text-white/80 text-sm text-center">
              Secure access to FURKO platform management
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@furko.local"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1a6b3c] hover:bg-[#145230] text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Login to Admin Panel
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-blue-800">
                <p>Email: <code className="bg-white px-1 py-0.5 rounded">admin@furko.local</code></p>
                <p>Password: <code className="bg-white px-1 py-0.5 rounded">admin123</code></p>
              </div>
            </div>

            {/* Security notice */}
            <div className="flex items-start gap-2 mt-6 p-3 bg-gray-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-[#1a6b3c] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                This is a secure administrative area. All actions are logged and auditable.
                Unauthorized access attempts will be reported.
              </p>
            </div>
          </div>
        </div>

        {/* Back to institution login */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            Institution Staff Login
          </button>
        </div>
      </div>
    </div>
  );
}
