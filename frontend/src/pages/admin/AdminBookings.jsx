import React, { useEffect, useState } from 'react';
import { bookingAPI, contentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const DISTRICTS = ['Dakshina Kannada', 'Udupi', 'Kasargod', 'Other'];
const EVENT_TYPES = ['Temple Festival', 'Wedding Ceremony', 'Corporate Event', 'Private Celebration', 'Other'];

const EMPTY_EDIT = {
  fullName: '', phone: '', district: 'Dakshina Kannada', venueAddress: '',
  distanceFromKateel: 0, eventType: 'Temple Festival', numberOfMembers: 5,
  eventDate: '', specialNotes: '', pricePerMember: 1000,
  distanceSurchargePerKm: 150, discountPercent: 0, status: 'pending', adminNotes: '',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(EMPTY_EDIT);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Pricing config panel
  const [pricingOpen, setPricingOpen] = useState(false);
  const [pricing, setPricing] = useState({ pricePerMember: 1000, distanceSurchargePerKm: 150, freeDistanceKm: 5, otpRequired: true, advancePaymentEnabled: true });
  const [advancePercent, setAdvancePercent] = useState(20);
  const [savingPricing, setSavingPricing] = useState(false);

  // Owner panel
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [owner, setOwner] = useState({ name: '', phone1: '', phone2: '', email: '' });
  const [savingOwner, setSavingOwner] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    bookingAPI.getAll(params)
      .then((r) => setBookings(r.data.bookings))
      .catch(() => toast.error('Failed to load bookings.'))
      .finally(() => setLoading(false));
  };

  const fetchSettings = () => {
    contentAPI.getSection('pricing').then((r) => {
      const d = r.data.data || {};
      setPricing(d);
      if (d.advancePercent !== undefined) setAdvancePercent(d.advancePercent);
    }).catch(() => {});
    contentAPI.getSection('owner').then((r) => setOwner(r.data.data)).catch(() => {});
  };

  useEffect(() => { fetchBookings(); }, [filter]);
  useEffect(() => { fetchSettings(); }, []);

  // Live estimated price preview inside edit modal
  const previewPrice = (d) => {
    const n = Math.max(Number(d.numberOfMembers) || 5, 5);
    const dist = Math.max(Number(d.distanceFromKateel) || 0, 0);
    const ppm = Number(d.pricePerMember) || 1000;
    const spm = Number(d.distanceSurchargePerKm) || 150;
    const disc = Math.min(Math.max(Number(d.discountPercent) || 0, 0), 100);
    const base = ppm * n;
    const surcharge = dist > 5 ? Math.round(dist * spm) : 0;
    const subtotal = base + surcharge;
    const discAmt = Math.round(subtotal * disc / 100);
    return { base, surcharge, subtotal, discAmt, final: subtotal - discAmt };
  };

  const openEdit = (b) => {
    setEditId(b._id);
    setEditData({
      fullName: b.fullName || '',
      phone: b.phone || '',
      district: b.district || 'Dakshina Kannada',
      venueAddress: b.venueAddress || '',
      distanceFromKateel: b.distanceFromKateel || 0,
      eventType: b.eventType || 'Temple Festival',
      numberOfMembers: b.numberOfMembers || 5,
      eventDate: b.eventDate ? b.eventDate.split('T')[0] : '',
      specialNotes: b.specialNotes || '',
      pricePerMember: b.pricePerMember || 1000,
      distanceSurchargePerKm: b.distanceSurchargePerKm || 150,
      discountPercent: b.discountPercent || 0,
      status: b.status || 'pending',
      adminNotes: b.adminNotes || '',
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await bookingAPI.update(editId, editData);
      toast.success('Booking updated.');
      setEditOpen(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, status, adminNotes = '') => {
    try {
      await bookingAPI.updateStatus(id, status, adminNotes);
      toast.success(`Booking ${status}.`);
      fetchBookings();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      await bookingAPI.delete(id);
      toast.success('Booking deleted.');
      fetchBookings();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    try {
      await contentAPI.update('pricing', { ...pricing, advancePercent: Number(advancePercent) });
      toast.success('Pricing settings saved.');
      setPricingOpen(false);
    } catch {
      toast.error('Failed to save pricing.');
    } finally {
      setSavingPricing(false);
    }
  };

  const handleSaveOwner = async () => {
    setSavingOwner(true);
    try {
      await contentAPI.update('owner', owner);
      toast.success('Owner details saved.');
      setOwnerOpen(false);
    } catch {
      toast.error('Failed to save owner details.');
    } finally {
      setSavingOwner(false);
    }
  };

  const ep = previewPrice(editData);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface mb-1">Booking Requests</h2>
          <p className="text-body-md text-on-surface-variant">Review, edit, and manage performance booking requests.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setPricingOpen(true)} className="px-4 py-2 border border-outline-variant rounded-lg text-label-lg text-on-surface-variant hover:bg-surface-container flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined text-sm">currency_rupee</span>
            Pricing Settings
          </button>
          <button onClick={() => setOwnerOpen(true)} className="px-4 py-2 border border-outline-variant rounded-lg text-label-lg text-on-surface-variant hover:bg-surface-container flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined text-sm">person</span>
            Owner Details
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-3">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-5 py-2 rounded-full text-label-lg font-semibold transition-all ${filter === s ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container hover:bg-outline-variant'}`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 block">event_busy</span>
          <p className="text-body-lg">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const p = previewPrice(b);
            return (
              <div key={b._id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-label-md px-3 py-1 rounded-full capitalize ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-md">{b.eventType}</span>
                      {b.discountPercent > 0 && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-label-md font-semibold">
                          {b.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <h3 className="text-headline-sm font-bold text-on-surface">{b.fullName}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-label-md text-on-surface-variant">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">call</span>{b.phone}</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {b.venueLocation?.lat ? (
                          <a href={`https://www.google.com/maps?q=${b.venueLocation.lat},${b.venueLocation.lng}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-primary underline hover:text-on-primary-fixed-variant">
                            {b.venueAddress} 📍
                          </a>
                        ) : (
                          <a href={`https://www.google.com/maps/search/${encodeURIComponent(b.venueAddress)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-primary underline hover:text-on-primary-fixed-variant">
                            {b.venueAddress} 🔍
                          </a>
                        )}
                      </span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_month</span>{new Date(b.eventDate).toLocaleDateString('en-IN')}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">group</span>{b.numberOfMembers} members</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-1 text-label-md">
                      <span className="text-on-surface-variant line-through">₹{p.subtotal?.toLocaleString('en-IN')}</span>
                      <span className="text-primary font-bold">Final: ₹{p.final?.toLocaleString('en-IN')}</span>
                      {b.discountPercent > 0 && <span className="text-green-600">Saved ₹{p.discAmt?.toLocaleString('en-IN')}</span>}
                    </div>
                    {b.specialNotes && <p className="text-label-md text-on-surface-variant mt-2 italic">"{b.specialNotes}"</p>}
                    {b.adminNotes && <p className="text-label-md text-primary mt-1">📋 {b.adminNotes}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatus(b._id, 'approved')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-label-lg hover:bg-green-700 transition-all">Approve</button>
                        <button onClick={() => handleStatus(b._id, 'rejected')} className="px-4 py-2 border border-red-400 text-red-600 rounded-lg text-label-lg hover:bg-red-50 transition-all">Reject</button>
                      </>
                    )}
                    {b.status !== 'pending' && (
                      <button onClick={() => handleStatus(b._id, 'pending')} className="px-4 py-2 border border-yellow-400 text-yellow-700 rounded-lg text-label-lg hover:bg-yellow-50 transition-all">Reset</button>
                    )}
                    <button onClick={() => openEdit(b)} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-lg hover:bg-on-primary-fixed-variant transition-all flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">edit</span>Edit
                    </button>
                    <button onClick={() => handleDelete(b._id)} className="p-2 border border-outline-variant text-error rounded-lg hover:bg-error-container transition-all">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit Booking Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl my-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant flex-shrink-0">
              <h3 className="text-headline-sm font-bold text-on-surface">Edit Booking</h3>
              <button onClick={() => setEditOpen(false)} className="p-2 hover:bg-surface-container rounded-lg transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Full Name</label>
                  <input className="input-field" value={editData.fullName} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Phone</label>
                  <input className="input-field" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">District</label>
                  <select className="input-field" value={editData.district} onChange={(e) => setEditData({ ...editData, district: e.target.value })}>
                    {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Event Type</label>
                  <select className="input-field" value={editData.eventType} onChange={(e) => setEditData({ ...editData, eventType: e.target.value })}>
                    {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-label-lg text-on-surface-variant block mb-1">Venue Address</label>
                  <input className="input-field" value={editData.venueAddress} onChange={(e) => setEditData({ ...editData, venueAddress: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Distance from Kateel (km)</label>
                  <input className="input-field" type="number" min="0" value={editData.distanceFromKateel} onChange={(e) => setEditData({ ...editData, distanceFromKateel: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Number of Members</label>
                  <input className="input-field" type="number" min="5" value={editData.numberOfMembers} onChange={(e) => setEditData({ ...editData, numberOfMembers: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Event Date</label>
                  <input className="input-field" type="date" value={editData.eventDate} onChange={(e) => setEditData({ ...editData, eventDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Status</label>
                  <select className="input-field" value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Pricing Override */}
              <div className="pt-4 border-t border-outline-variant">
                <h4 className="text-label-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">currency_rupee</span>
                  Pricing for this Booking
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Price per Member (₹)</label>
                    <input className="input-field" type="number" min="0" value={editData.pricePerMember} onChange={(e) => setEditData({ ...editData, pricePerMember: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Distance Surcharge (₹/km)</label>
                    <input className="input-field" type="number" min="0" value={editData.distanceSurchargePerKm} onChange={(e) => setEditData({ ...editData, distanceSurchargePerKm: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Discount (%)</label>
                    <input className="input-field" type="number" min="0" max="100" value={editData.discountPercent} onChange={(e) => setEditData({ ...editData, discountPercent: e.target.value })} />
                  </div>
                </div>

                {/* Live price preview */}
                <div className="mt-4 bg-secondary-container rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-label-md">
                  <div><span className="text-on-surface-variant block">Base</span><span className="font-semibold">₹{ep.base.toLocaleString('en-IN')}</span></div>
                  <div><span className="text-on-surface-variant block">Surcharge</span><span className="font-semibold">₹{ep.surcharge.toLocaleString('en-IN')}</span></div>
                  <div><span className="text-on-surface-variant block">Discount ({editData.discountPercent}%)</span><span className="font-semibold text-green-600">-₹{ep.discAmt.toLocaleString('en-IN')}</span></div>
                  <div><span className="text-on-surface-variant block">Final Price</span><span className="font-bold text-primary text-body-lg">₹{ep.final.toLocaleString('en-IN')}</span></div>
                </div>
              </div>

              {/* Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Special Notes (from customer)</label>
                  <textarea className="input-field resize-none" rows="2" value={editData.specialNotes} onChange={(e) => setEditData({ ...editData, specialNotes: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Admin Notes</label>
                  <textarea className="input-field resize-none" rows="2" placeholder="Internal notes..." value={editData.adminNotes} onChange={(e) => setEditData({ ...editData, adminNotes: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setEditOpen(false)} className="px-6 py-3 border border-outline-variant text-on-surface-variant rounded-lg text-label-lg hover:bg-surface-container transition-all">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} className="px-6 py-3 bg-primary text-on-primary rounded-lg text-label-lg font-semibold hover:bg-on-primary-fixed-variant transition-all disabled:opacity-60 flex items-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">save</span>}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pricing Settings Modal ── */}
      {pricingOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl my-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant flex-shrink-0">
              <h3 className="text-headline-sm font-bold text-on-surface">Global Pricing Settings</h3>
              <button onClick={() => setPricingOpen(false)} className="p-2 hover:bg-surface-container rounded-lg"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-label-md text-on-surface-variant">These rates apply to all new bookings. Existing bookings keep their stored rates.</p>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Base Price per Member (₹)</label>
                <input className="input-field" type="number" min="0" value={pricing.pricePerMember} onChange={(e) => setPricing({ ...pricing, pricePerMember: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Distance Surcharge per km (₹)</label>
                <input className="input-field" type="number" min="0" value={pricing.distanceSurchargePerKm} onChange={(e) => setPricing({ ...pricing, distanceSurchargePerKm: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Free Distance Zone (km)</label>
                <input className="input-field" type="number" min="0" value={pricing.freeDistanceKm} onChange={(e) => setPricing({ ...pricing, freeDistanceKm: Number(e.target.value) })} />
                <p className="text-label-md text-on-surface-variant mt-1">No surcharge within this distance from Kateel.</p>
              </div>
              <div className="bg-secondary-container rounded-xl p-4 text-label-md text-on-surface-variant">
                Example: {(pricing.freeDistanceKm || 0) + 1} km, 5 members = ₹{((pricing.pricePerMember || 0) * 5 + ((pricing.freeDistanceKm || 0) + 1) * (pricing.distanceSurchargePerKm || 0)).toLocaleString('en-IN')}
              </div>
              <div className="pt-2 border-t border-outline-variant">
                <label className="text-label-lg text-on-surface-variant block mb-1">Razorpay Advance Payment %</label>
                <input className="input-field" type="number" min="0" max="100" value={advancePercent} onChange={(e) => setAdvancePercent(e.target.value)} />
                <p className="text-label-md text-on-surface-variant mt-1">Customer pays this % upfront. Set 0 to skip.</p>
                <div className="mt-2 bg-secondary-container rounded-lg px-4 py-3 text-label-md text-on-surface-variant">
                  Example: ₹10,000 booking → advance = ₹{Math.round(10000 * Number(advancePercent) / 100).toLocaleString('en-IN')}
                </div>
              </div>
              {/* Feature Toggles */}
              <div className="pt-2 border-t border-outline-variant space-y-3">
                <h4 className="text-label-lg font-bold text-on-surface">Feature Toggles</h4>
                <div className="flex items-center justify-between gap-4 p-3 bg-surface-container rounded-xl cursor-pointer"
                  onClick={() => setPricing((p) => ({ ...p, otpRequired: !p.otpRequired }))}>
                  <div>
                    <p className="text-label-lg font-semibold text-on-surface">Mobile OTP Verification</p>
                    <p className="text-label-md text-on-surface-variant">Require customers to verify phone before booking</p>
                  </div>
                  <div className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${pricing.otpRequired !== false ? 'bg-primary' : 'bg-outline-variant'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${pricing.otpRequired !== false ? 'translate-x-7' : 'translate-x-1'}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 p-3 bg-surface-container rounded-xl cursor-pointer"
                  onClick={() => setPricing((p) => ({ ...p, advancePaymentEnabled: !p.advancePaymentEnabled }))}>
                  <div>
                    <p className="text-label-lg font-semibold text-on-surface">Advance Payment (Razorpay)</p>
                    <p className="text-label-md text-on-surface-variant">Show advance payment step after booking</p>
                  </div>
                  <div className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${pricing.advancePaymentEnabled !== false ? 'bg-primary' : 'bg-outline-variant'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${pricing.advancePaymentEnabled !== false ? 'translate-x-7' : 'translate-x-1'}`} />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setPricingOpen(false)} className="px-6 py-3 border border-outline-variant text-on-surface-variant rounded-lg text-label-lg hover:bg-surface-container transition-all">Cancel</button>
              <button onClick={handleSavePricing} disabled={savingPricing} className="px-6 py-3 bg-primary text-on-primary rounded-lg text-label-lg font-semibold hover:bg-on-primary-fixed-variant transition-all disabled:opacity-60">
                {savingPricing ? 'Saving...' : 'Save Pricing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Owner Details Modal ── */}
      {ownerOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl my-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant flex-shrink-0">
              <h3 className="text-headline-sm font-bold text-on-surface">Owner Contact Details</h3>
              <button onClick={() => setOwnerOpen(false)} className="p-2 hover:bg-surface-container rounded-lg"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-label-md text-on-surface-variant">These details are shown to customers on the booking confirmation page.</p>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Owner Name</label>
                <input className="input-field" value={owner.name} onChange={(e) => setOwner({ ...owner, name: e.target.value })} placeholder="e.g. Kiran Anchan" />
              </div>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Primary Phone Number</label>
                <input className="input-field" type="tel" value={owner.phone1} onChange={(e) => setOwner({ ...owner, phone1: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Secondary Phone Number</label>
                <input className="input-field" type="tel" value={owner.phone2} onChange={(e) => setOwner({ ...owner, phone2: e.target.value })} placeholder="+91 98765 43211" />
              </div>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Email (for notifications)</label>
                <input className="input-field" type="email" value={owner.email} onChange={(e) => setOwner({ ...owner, email: e.target.value })} placeholder="owner@example.com" />
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setOwnerOpen(false)} className="px-6 py-3 border border-outline-variant text-on-surface-variant rounded-lg text-label-lg hover:bg-surface-container transition-all">Cancel</button>
              <button onClick={handleSaveOwner} disabled={savingOwner} className="px-6 py-3 bg-primary text-on-primary rounded-lg text-label-lg font-semibold hover:bg-on-primary-fixed-variant transition-all disabled:opacity-60">
                {savingOwner ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
