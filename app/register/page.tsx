'use client'; // Sinasabi kay Next.js na pang-browser (Client Component) ang file na ito

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Para sa navigation matapos mag-register
import Link from 'next/link'; // Para sa pagbalik sa Login page
import api from '@/lib/api'; // Custom Axios instance na may base URL ng backend
import Cookies from 'js-cookie'; // Para sa pag-save ng authentication cookies

export default function RegisterPage() {
  // State variables para sa registration form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('developer'); // Default value para sa role
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  // State variables para sa feedback at UI loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter(); // Initialize router function

  // Function na tatakbo kapag in-submit ang Registration form
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Iwasan ang default page refresh ng browser
    setError(''); // I-reset ang anumang dating error message

    // Client-side validation: Siguraduhing magkatugma ang dalawang password
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true); // I-set sa true ang loading state

    try {
      // Mag-send ng POST request sa Laravel API (/api/register) kasama ang role
      const response = await api.post('/register', {
        name,
        email,
        role, // <--- Isinama na ang role dito!
        password,
        password_confirmation: passwordConfirmation, // Kinakailangan ng Laravel validation rule na `confirmed`
      });

      const { token, user } = response.data;

      // Kapag nagbalik ng token ang backend, i-login na agad ang user sa browser
      if (token) {
        Cookies.set('token', token, { expires: 1 });
        Cookies.set('user', JSON.stringify(user), { expires: 1 });
        router.push('/dashboard'); // I-redirect agad sa Dashboard
      } else {
        // Kapag registration success lang at walang automatic login token, ibalik muna sa Login page
        router.push('/');
      }
    } catch (err: any) {
      // Kunin ang error message galing sa Laravel validation o default message
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false); // Tapos na ang API call, ibalik sa normal ang button
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        
        {/* Header Title */}
        <h2 className="text-3xl font-bold text-center mb-2 text-indigo-400">Create Account</h2>
        <p className="text-slate-400 text-center text-sm mb-6">Join CyphLab Portal today</p>

        {/* Display Error Message Box */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-indigo-500 text-white text-sm"
              placeholder="John Doe"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-indigo-500 text-white text-sm"
              placeholder="user@example.com"
            />
          </div>

          {/* Role Dropdown Field */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-indigo-500 text-white text-sm"
            >
              <option value="developer">Developer</option>
              <option value="project_manager">Project Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-indigo-500 text-white text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Confirm Password</label>
            <input
              type="password"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-indigo-500 text-white text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition duration-200 disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {/* Link Papuntang Login Page */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/" className="text-indigo-400 hover:underline font-medium">
            Sign in here
          </Link>
        </div>

      </div>
    </div>
  );
}