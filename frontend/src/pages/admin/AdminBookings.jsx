import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchBookings = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    bookingAPI.getAll(params)
      .then((r) => setBookings(r.data.bookings))
      .catch(() => toast.error('Failed to load bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const handleStatus = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, status, adminNotes);
      toast.success(`Booking ${status}.`);
      setSelected(null);
      fetchBookings();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await bookingAPI.delete(id);
      toast.success('Booking deleted.');
      fetchBookings();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-headline-md font-bold text-on-surface mb-1">Booking Requests</h2>
        <p className="text-body-md text-on-surface-variant">Review and manage performance booking requests.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-5 py-2 rounded-full text-label-lg font-semibold transition-all ${filter === s ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container hover:bg-outline-variant'}`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 block">event_busy</span>
          <p className="text-body-lg">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-label-md px-3 py-1 rounded-full capitalize ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                    <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-md">{b.eventType}</span>
                  </div>
                  <h3 className="text-headline-sm font-bold text-on-surface">{b.fullName}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-label-md text-on-surface-variant">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">call</span>{b.phone}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{b.venueAddress}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_month</span>{new Date(b.eventDate).toLocaleDateString('en-IN')}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">group</span>{b.numberOfMembers} members</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">currency_rupee</span>₹{b.estimatedPrice?.toLocaleString('en-IN')}</span>
                  </div>
                  {b.specialNotes && <p className="text-label-md text-on-surface-variant mt-2 italic">"{b.specialNotes}"</p>}
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatus(b._id, 'approved')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-label-lg hover:bg-green-700 transition-all">Approve</button>
                      <button onClick={() => handleStatus(b._id, 'rejected')} className="px-4 py-2 border border-red-400 text-red-600 rounded-lg text-label-lg hover:bg-red-50 transition-all">Reject</button>
                    </>
                  )}
                  <button onClick={() => setSelected(selected?._id === b._id ? null : b)} className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-label-lg hover:bg-surface-container transition-all">Details</button>
                  <button onClick={() => handleDelete(b._id)} className="p-2 border border-outline-variant text-error rounded-lg hover:bg-error-container transition-all">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {selected?._id === b._id && (
                <div className="mt-6 pt-6 border-t border-outline-variant space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-label-md">
                    <div><span className="text-on-surface-variant block">District</span><span className="font-semibold">{b.district}</span></div>
                    <div><span className="text-on-surface-variant block">Distance</span><span className="font-semibold">{b.distanceFromKateel} km</span></div>
                    <div><span className="text-on-surface-variant block">Members</span><span className="font-semibold">{b.numberOfMembers}</span></div>
                    <div><span className="text-on-surface-variant block">Submitted</span><span className="font-semibold">{new Date(b.createdAt).toLocaleDateString('en-IN')}</span></div>
                  </div>
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Admin Notes</label>
                    <textarea className="input-field resize-none" rows="2" placeholder="Add notes..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
