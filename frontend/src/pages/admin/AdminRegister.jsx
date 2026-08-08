import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgjlTZjnqCYcQxAo-8tH7UjiqW-b5DOy11vzeGWh68nxtad2JKgWnSzAUa8KXjZvbvZMx6_fFkWprzh66qOOnhSnNOEKkzTIva8EA0xggUjHHEp0Uj4i7RCcWiZn7srbeeobfibvoYb_Z8ZCMcKt8tSq5Jk502sM8kaeVN48emFfxsb9AIhJ_N1lUiLYCxP162I2ZbD6rK05ez1rKNAjwaZ3rbhHAbzARok0SBcaI_OvdEq1YpYKMMxXnBe6D8qf4DVUguPUYllHw8';

export default function AdminRegister() {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', secretKey: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      // Auto-login after register
      localStorage.setItem('adminToken', res.data.token);
      toast.success('Admin account created! Welcome.');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
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
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary-container p-1 bg-white">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-headline-sm font-bold text-on-surface mb-1">Create Admin Account</h1>
            <p className="text-body-md text-on-surface-variant">Set up your admin credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-label-lg text-on-surface-variant">Username</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-0 bottom-2 text-on-surface-variant group-focus-within:text-primary transition-colors">person</span>
                <input
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-8 outline-none transition-all"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-label-lg text-on-surface-variant">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-0 bottom-2 text-on-surface-variant group-focus-within:text-primary transition-colors">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-8 pr-8 outline-none transition-all"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-2 text-on-surface-variant">
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-label-lg text-on-surface-variant">Confirm Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-0 bottom-2 text-on-surface-variant group-focus-within:text-primary transition-colors">lock_reset</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-8 outline-none transition-all"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Secret Key */}
            <div className="space-y-1">
              <label className="text-label-lg text-on-surface-variant">Registration Secret Key</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-0 bottom-2 text-on-surface-variant group-focus-within:text-primary transition-colors">key</span>
                <input
                  type="password"
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-8 outline-none transition-all"
                  placeholder="Enter secret key"
                  value={form.secretKey}
                  onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
                  required
                />
              </div>

            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-semibold text-label-lg py-4 rounded-lg shadow-md active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Creating Account...' : 'Create Admin Account'}
                {!loading && <span className="material-symbols-outlined text-[18px]">how_to_reg</span>}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant w-full text-center">
            <p className="text-label-md text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/admin/login" className="text-primary font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-label-md text-on-surface-variant opacity-70 mt-6">
          © 2024 Chende Performance Team. Internal Admin Portal.
        </p>
      </div>
    </div>
  );
}
