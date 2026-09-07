'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, UserCheck, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type LoginMode = 'credentials' | 'parent';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [mode, setMode] = useState<LoginMode>('credentials');
  const [formData, setFormData] = useState({ email: '', password: '', portalId: '', accessCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'parent') {
        setMode('parent');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (mode === 'parent') {
        response = await authApi.parentLogin({
          portalId: formData.portalId,
          accessCode: formData.accessCode,
        });
      } else {
        response = await authApi.login({
          email: formData.email,
          password: formData.password,
        });
      }

      const { token, user } = response.data;
      login(token, user);

      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (user.role === 'TEACHER' || user.role === 'TUTOR') {
        router.push('/teacher/dashboard');
      } else if (user.role === 'PARENT_VIEW') {
        router.push('/parent/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 mb-4 animate-logo-enter">
            <img src="/logo.png" alt="Edwardian Educational Consult" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 animate-card-enter">
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('credentials'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'credentials' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Student / Staff
            </button>
            <button
              type="button"
              onClick={() => { setMode('parent'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'parent' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Parent
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-shake">
                {error}
              </div>
            )}

            {mode === 'credentials' ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="input-field pl-12"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="input-field pl-12 pr-12"
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="portalId" className="block text-sm font-medium text-gray-700 mb-2">
                    Portal ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="portalId"
                      required
                      value={formData.portalId}
                      onChange={(e) => setFormData({ ...formData, portalId: e.target.value })}
                      placeholder="SHS/2026/000123"
                      className="input-field pl-12"
                    />
                    <UserCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Access Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="accessCode"
                      required
                      value={formData.accessCode}
                      onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                      placeholder="Enter parent access code"
                      className="input-field pl-12"
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register here
              </Link>
            </p>
          </div>

          {/* Help Section */}
          <div className="mt-4 border-t pt-4">
            <details className="group">
              <summary className="flex items-center justify-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-700 list-none">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 text-xs font-bold text-gray-500 group-open:bg-primary-600 group-open:border-primary-600 group-open:text-white transition-all">?</span>
                <span className="font-medium">Can&apos;t find your password?</span>
              </summary>
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-sm text-amber-800 space-y-2">
                <p className="font-semibold">Your password was sent to your email after registration.</p>
                <p>If you can&apos;t find it, follow these steps:</p>
                <ol className="space-y-1 list-none">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex-shrink-0 mt-0.5">1</span>
                    <span>Open your email and check the <strong>Spam</strong> or <strong>Junk</strong> folder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex-shrink-0 mt-0.5">2</span>
                    <span>Also check the <strong>Promotions</strong> tab if you use Gmail</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex-shrink-0 mt-0.5">3</span>
                    <span>Still can&apos;t find it? Contact support at <strong>support@edwardianconsult.com</strong></span>
                  </li>
                </ol>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}