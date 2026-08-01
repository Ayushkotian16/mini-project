import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './layouts/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';
import EventsPage from './pages/EventsPage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminEvents from './pages/admin/AdminEvents';
import AdminTeam from './pages/admin/AdminTeam';
import AdminReviews from './pages/admin/AdminReviews';
import AdminMessages from './pages/admin/AdminMessages';
import AdminContent from './pages/admin/AdminContent';

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            border: '1px solid #e1bec4',
          },
          success: {
            iconTheme: { primary: '#9b0044', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ba1a1a', secondary: '#fff' },
          },
        }}
      />

      <Routes>
        {/* ── Public Routes ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ── Admin Login / Register (no layout) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* ── Protected Admin Routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/team" element={<AdminTeam />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/content" element={<AdminContent />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
