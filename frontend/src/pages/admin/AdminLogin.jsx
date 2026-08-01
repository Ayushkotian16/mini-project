import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgjlTZjnqCYcQxAo-8tH7UjiqW-b5DOy11vzeGWh68nxtad2JKgWnSzAUa8KXjZvbvZMx6_fFkWprzh66qOOnhSnNOEKkzTIva8EA0xggUjHHEp0Uj4i7RCcWiZn7srbeeobfibvoYb_Z8ZCMcKt8tSq5Jk502sM8kaeVN48emFfxsb9AIhJ_N1lUiLYCxP162I2ZbD6rK05ez1rKNAjwaZ3rbhHAbzARok0SBcaI_OvdEq1YpYKMMxXnBe6D8qf4DVUguPUYllHw8';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-container flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="fixed -bottom-48 -right-48 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl -z-10" />
      <div className="fixed -top-48 -left-48 w-96 h-96 bg-tertiary-fixed/20 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md">
        <div className="card p-8 md:p-12 flex flex-col items-center">
          {/* Logo */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-container p-1 bg-white">
              <img src={LOGO_URL} alt="Team Nandini Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="absolute -inset-2 border border-primary/10 rounded-full animate-pulse" />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-headline-sm font-bold text-on-surface mb-2">Chenda Admin Login</h1>
            <p className="text-body-md text-on-surface-variant">Access the performance dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-1">
              <label className="text-label-lg text-on-surface-variant" htmlFor="username">Admin Name</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-0 bottom-2 text-on-surface-variant group-focus-within:text-primary transition-colors">person</span>
                <input
                  id="username"
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-8 outline-none transition-all"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-label-lg text-on-surface-variant" htmlFor="password">Password</label>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-0 bottom-2 text-on-surface-variant group-focus-within:text-primary transition-colors">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-8 pr-8 outline-none transition-all"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full bg-primary-container hover:bg-primary text-on-primary font-semibold text-label-lg py-4 rounded-lg shadow-md active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-60">
                {loading ? 'Logging in...' : 'Login'}
                {!loading && <span className="material-symbols-outlined text-[18px]">login</span>}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-outline-variant w-full text-center">
            <p className="text-label-md text-on-secondary-fixed-variant">
              Authorized Personnel Only.
            </p>
          </div>
        </div>

        <p className="text-center text-label-md text-on-surface-variant opacity-70 mt-8">
          © 2024 Chende Performance Team. Internal Admin Portal.
        </p>
      </div>
    </div>
  );
}
