'use client'; // Sinasabi kay Next.js na pang-browser (Client Component) ang file na ito

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Para sa page redirection sa Next.js
import Link from 'next/link'; // Para sa mabilis na client-side navigation papuntang Register
import api from '@/lib/api'; // Axios instance para sa API requests sa backend
import Cookies from 'js-cookie'; // Library para mag-store ng tokens sa browser cookies

export default function LoginPage() {
  // State variables para sa form inputs at UI status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter(); // Initialize router para sa paglipat ng page

  // Function na tatakbo kapag in-submit ang Login form
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Iwasan ang default page reload ng browser
    setError(''); // I-reset ang nakaraang error message
    setLoading(true); // I-enable ang loading state (papatayin din ang button)

    try {
      // Mag-send ng POST request sa Laravel API (/api/login)
      const response = await api.post('/login', { email, password });
      
      // Kunin ang token at user objects mula sa API response
      const { token, user } = response.data;

      // I-save ang API bearer token sa Cookie (tatagal ng 1 araw)
      Cookies.set('token', token, { expires: 1 });
      
      // I-convert ang user object sa string at i-save sa Cookie
      Cookies.set('user', JSON.stringify(user), { expires: 1 });

      // Kapag matagumpay ang login, i-redirect ang user papuntang Dashboard page
      router.push('/dashboard');
    } catch (err: any) {
      // Kapag nag-error, kunin ang message mula sa backend o mag-set ng default error
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false); // I-turn off ang loading state matapos ang request
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        
        {/* Header Title */}
        <h2 className="text-3xl font-bold text-center mb-2 text-indigo-400">CyphLab Portal</h2>
        <p className="text-slate-400 text-center text-sm mb-6">Login to access projects and tasks</p>

        {/* Display Error Message Box (lalabas lang kapag may nilalamang error) */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)} // I-update ang state habang nagre-type
              className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-indigo-500 text-white text-sm"
              placeholder="admin@example.com"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)} // I-update ang state habang nagre-type
              className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-indigo-500 text-white text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button (Disabled habang nag-pro-process/loading) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition duration-200 disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Link Papuntang Register Page */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-400 hover:underline font-medium">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
}