import React, { useEffect, useState } from 'react';
import { eventAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { title: '', description: '', date: '', location: '', category: 'Temple Festival', status: 'upcoming', membersCount: 0, showOnHome: false };

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchEvents = () => {
    setLoading(true);
    eventAPI.getAll({ status: tab })
      .then((r) => setEvents(r.data.events))
      .catch(() => toast.error('Failed to load events.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [tab]);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM, status: tab }); setShowForm(true); };
  const openEdit = (ev) => { setEditing(ev); setForm({ ...ev, date: ev.date?.slice(0, 10) }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await eventAPI.update(editing._id, form);
        toast.success('Event updated.');
      } else {
        await eventAPI.create(form);
        toast.success('Event created.');
      }
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventAPI.delete(id);
      toast.success('Event deleted.');
      fetchEvents();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface mb-1">Manage Events</h2>
          <p className="text-body-md text-on-surface-variant">Curate the rhythmic journey of Chende performances.</p>
        </div>
        <button onClick={openCreate} className="btn-primary rounded-full">
          <span className="material-symbols-outlined">add</span>
          New Event
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        {['upcoming', 'past', 'draft'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-full text-label-lg font-semibold transition-all capitalize ${tab === t ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container hover:bg-outline-variant'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-sm font-bold text-on-surface">{editing ? 'Edit Event' : 'Create Event'}</h3>
              <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-label-lg text-on-surface-variant block mb-1">Title *</label>
                  <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Date *</label>
                  <input className="input-field" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Location *</label>
                  <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Category</label>
                  <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {['Temple Festival', 'Corporate', 'Public Event', 'Wedding', 'Private', 'Other'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Status</label>
                  <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {['upcoming', 'past', 'draft'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Members Count</label>
                  <input className="input-field" type="number" min="0" value={form.membersCount} onChange={(e) => setForm({ ...form, membersCount: e.target.value })} />
                </div>
                {/* Show on Home toggle */}
                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, showOnHome: !form.showOnHome })}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${form.showOnHome ? 'bg-primary' : 'bg-outline-variant'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.showOnHome ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                  <div>
                    <p className="text-label-lg font-semibold text-on-surface">Show on Home Page</p>
                    <p className="text-label-md text-on-surface-variant">Pin this event to the Recent Events section on the homepage</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-label-lg text-on-surface-variant block mb-1">Description</label>
                  <textarea className="input-field resize-none" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-3 rounded-lg disabled:opacity-60">{saving ? 'Saving...' : 'Save Event'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 justify-center py-3 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 block">event_busy</span>
          <p className="text-body-lg">No {tab} events. <button onClick={openCreate} className="text-primary underline">Create one.</button></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div key={ev._id} className="card overflow-hidden flex flex-col">
              <div className="h-24 bg-gradient-to-br from-secondary-container to-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-primary/40">music_note</span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-label-md">{ev.category}</span>
                  {ev.showOnHome && (
                    <span className="bg-primary text-on-primary px-2 py-0.5 rounded-full text-label-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                      On Home
                    </span>
                  )}
                </div>
                <h3 className="text-headline-sm font-bold text-on-surface mb-1">{ev.title}</h3>
                <div className="flex flex-wrap gap-3 text-label-md text-on-surface-variant mb-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_month</span>{new Date(ev.date).toLocaleDateString('en-IN')}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{ev.location}</span>
                </div>
                <div className="flex gap-2 mt-auto pt-4 border-t border-outline-variant">
                  {/* Pin/Unpin home toggle */}
                  <button
                    onClick={async () => {
                      try {
                        await eventAPI.update(ev._id, { showOnHome: !ev.showOnHome });
                        toast.success(ev.showOnHome ? 'Removed from home.' : 'Pinned to home page.');
                        fetchEvents();
                      } catch { toast.error('Failed.'); }
                    }}
                    title={ev.showOnHome ? 'Remove from home' : 'Pin to home page'}
                    className={`p-2 rounded-lg border transition-all ${ev.showOnHome ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}
                  >
                    <span className="material-symbols-outlined text-sm">home</span>
                  </button>
                  <button onClick={() => openEdit(ev)} className="flex-1 py-2 bg-primary text-on-primary rounded-lg text-label-lg hover:bg-on-primary-fixed-variant transition-all flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">edit</span>Edit
                  </button>
                  <button onClick={() => handleDelete(ev._id)} className="p-2 border border-outline-variant text-error rounded-lg hover:bg-error-container transition-all">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
