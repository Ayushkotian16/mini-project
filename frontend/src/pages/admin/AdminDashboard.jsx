import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, teamAPI, eventAPI, contactAPI } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ bookings: 0, pending: 0, members: 0, pendingMembers: 0, messages: 0 });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    Promise.all([
      bookingAPI.getAll({ limit: 5 }),
      bookingAPI.getAll({ status: 'pending', limit: 1 }),
      teamAPI.getAll(),
      teamAPI.getAll({ status: 'pending' }),
      contactAPI.getAll({ isRead: false }),
    ]).then(([all, pending, members, pendingMembers, messages]) => {
      setStats({
        bookings: all.data.total,
        pending: pending.data.total,
        members: members.data.members.length,
        pendingMembers: pendingMembers.data.members.length,
        messages: messages.data.messages.length,
      });
      setRecentBookings(all.data.bookings.slice(0, 5));
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Total Bookings', value: stats.bookings, icon: 'calendar_today', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pending Bookings', value: stats.pending, icon: 'pending_actions', color: 'text-tertiary', bg: 'bg-tertiary/10' },
    { label: 'Team Members', value: stats.members, icon: 'groups', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Join Requests', value: stats.pendingMembers, icon: 'person_add', color: 'text-tertiary', bg: 'bg-tertiary/10' },
  ];

  const quickActions = [
    { to: '/admin/bookings', icon: 'notification_important', label: 'View New Bookings', variant: 'primary' },
    { to: '/admin/team', icon: 'manage_accounts', label: 'Manage Members', variant: 'outline' },
    { to: '/admin/content', icon: 'auto_fix_high', label: 'Edit Home Content', variant: 'ghost' },
    { to: '/admin/events', icon: 'celebration', label: 'Manage Events', variant: 'ghost' },
    { to: '/admin/messages', icon: 'mail', label: 'View Messages', variant: 'ghost' },
    { to: '/admin/reviews', icon: 'star', label: 'Manage Reviews', variant: 'ghost' },
  ];

  const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div>
        <h2 className="text-headline-lg-mobile md:text-headline-md font-bold text-primary mb-1">Welcome, Admin</h2>
        <p className="text-body-lg text-on-surface-variant">Here is your rhythmic overview for Nandini Chende Kateel.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card p-6 flex flex-col items-center text-center">
            <div className={`w-12 h-12 ${card.bg} rounded-full flex items-center justify-center mb-4`}>
              <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
            </div>
            <p className="text-label-md text-on-surface-variant mb-1">{card.label}</p>
            <p className={`text-headline-md font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-headline-sm font-bold text-on-surface mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`flex items-center justify-between p-5 rounded-xl transition-all active:scale-95 group ${
                action.variant === 'primary' ? 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant' :
                action.variant === 'outline' ? 'bg-surface-container-lowest border border-primary text-primary hover:bg-primary-fixed' :
                'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">{action.icon}</span>
                <span className="text-label-lg font-semibold">{action.label}</span>
              </div>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 card p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-headline-sm font-bold text-on-surface">Recent Bookings</h4>
            <Link to="/admin/bookings" className="text-label-md text-primary font-bold hover:underline">View All</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-body-md text-on-surface-variant text-center py-8">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b._id} className="flex items-center gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md text-on-surface font-medium truncate">{b.fullName} — {b.eventType}</p>
                    <p className="text-label-md text-on-surface-variant">{new Date(b.eventDate).toLocaleDateString('en-IN')} · {b.venueAddress}</p>
                  </div>
                  <span className={`text-label-md px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-primary-container text-on-primary-container rounded-2xl p-8 relative overflow-hidden flex flex-col justify-end min-h-[280px]">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>music_note</span>
          </div>
          <h4 className="text-headline-sm font-bold mb-2 relative z-10">Performance Ready?</h4>
          <p className="text-body-md mb-6 relative z-10 opacity-90">Ensure all team rosters are updated before the upcoming festival season.</p>
          <Link to="/admin/team" className="bg-surface text-primary px-6 py-3 rounded-full text-label-lg font-semibold w-fit hover:bg-surface-container transition-colors relative z-10">
            Check Roster
          </Link>
        </div>
      </div>
    </div>
  );
}
