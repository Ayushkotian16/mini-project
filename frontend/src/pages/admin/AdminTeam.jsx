import React, { useEffect, useState } from 'react';
import { teamAPI } from '../../services/api';
import toast from 'react-hot-toast';
import ImageUploader from '../../components/ImageUploader';

const EMPTY_FORM = {
  name: '', role: 'Chende Artist', phone: '', age: '', yearsOfExperience: 0,
  experienceLevel: 'Beginner', bio: '', imageUrl: '', status: 'active', performancesCompleted: 0,
  socialLinks: { facebook: '', instagram: '', youtube: '', whatsapp: '' },
};
const STATUS_COLORS = { active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-600', pending: 'bg-yellow-100 text-yellow-800' };

export default function AdminTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchMembers = () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    teamAPI.getAll(params)
      .then((r) => setMembers(r.data.members))
      .catch(() => toast.error('Failed to load team.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, [statusFilter]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (m) => {
    setEditing(m);
    setForm({
      ...m,
      socialLinks: m.socialLinks || { facebook: '', instagram: '', youtube: '', whatsapp: '' },
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await teamAPI.update(editing._id, form);
        toast.success('Member updated.');
      } else {
        await teamAPI.create(form);
        toast.success('Member added.');
      }
      setShowForm(false);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await teamAPI.delete(id);
      toast.success('Member deleted.');
      fetchMembers();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await teamAPI.update(id, { status: 'active' });
      toast.success('Member approved.');
      fetchMembers();
    } catch {
      toast.error('Failed to approve.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface mb-1">Manage Team</h2>
          <p className="text-body-md text-on-surface-variant">Oversee performers, lead drummers, and new applicants.</p>
        </div>
        <button onClick={openCreate} className="btn-primary rounded-full">
          <span className="material-symbols-outlined">person_add</span>
          Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[{ v: '', l: 'All' }, { v: 'active', l: 'Active' }, { v: 'pending', l: 'Pending' }, { v: 'inactive', l: 'Inactive' }].map((f) => (
          <button key={f.v} onClick={() => setStatusFilter(f.v)} className={`px-5 py-2 rounded-full text-label-lg font-semibold transition-all ${statusFilter === f.v ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container hover:bg-outline-variant'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-sm font-bold text-on-surface">{editing ? 'Edit Member' : 'Add Member'}</h3>
              <button onClick={() => setShowForm(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Name *</label>
                  <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Role *</label>
                  <input className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Phone</label>
                  <input className="input-field" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Age</label>
                  <input className="input-field" type="number" min="10" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Experience Level</label>
                  <select className="input-field" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
                    {['Beginner', 'Intermediate', 'Expert'].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Status</label>
                  <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {['active', 'inactive', 'pending'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Years of Experience</label>
                  <input className="input-field" type="number" min="0" value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Performances Completed</label>
                  <input className="input-field" type="number" min="0" value={form.performancesCompleted} onChange={(e) => setForm({ ...form, performancesCompleted: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <ImageUploader
                    label="Member Photo"
                    value={form.imageUrl}
                    onChange={(url) => setForm({ ...form, imageUrl: url })}
                    shape="circle"
                    placeholder="Browse member photo"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-label-lg text-on-surface-variant block mb-1">Bio</label>
                  <textarea className="input-field resize-none" rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>

                {/* Social Links */}
                <div className="md:col-span-2 pt-2 border-t border-outline-variant">
                  <p className="text-label-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">share</span>
                    Social Media Links <span className="text-on-surface-variant font-normal">(optional)</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'facebook', icon: 'facebook', placeholder: 'Facebook URL' },
                      { key: 'instagram', icon: 'photo_camera', placeholder: 'Instagram URL' },
                      { key: 'youtube', icon: 'play_circle', placeholder: 'YouTube URL' },
                      { key: 'whatsapp', icon: 'chat', placeholder: 'WhatsApp number (e.g. 919901933947)' },
                    ].map((s) => (
                      <div key={s.key} className="relative">
                        <span className="material-symbols-outlined absolute left-0 bottom-2 text-outline text-[18px]">{s.icon}</span>
                        <input
                          className="input-field pl-7"
                          placeholder={s.placeholder}
                          value={form.socialLinks?.[s.key] || ''}
                          onChange={(e) => setForm({
                            ...form,
                            socialLinks: { ...(form.socialLinks || {}), [s.key]: e.target.value },
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-3 rounded-lg disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 justify-center py-3 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 block">group</span>
          <p className="text-body-lg">No members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <div key={m._id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-primary overflow-hidden flex-shrink-0">
                    {m.imageUrl ? <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full bg-secondary-container flex items-center justify-center"><span className="material-symbols-outlined text-primary">person</span></div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-headline-sm font-bold text-on-surface leading-tight">{m.name}</h4>
                    <p className="text-label-lg text-on-surface-variant">{m.role}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_COLORS[m.status]}`}>{m.status}</span>
              </div>
              <div className="space-y-2 mb-4 text-label-md text-on-surface-variant">
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">verified</span>{m.experienceLevel} · {m.yearsOfExperience}y exp</div>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">celebration</span>{m.performancesCompleted} performances</div>
              </div>
              {/* Social links on admin card */}
              {m.socialLinks && Object.values(m.socialLinks).some(Boolean) && (
                <div className="flex gap-2 mb-3">
                  {m.socialLinks.facebook && (
                    <a href={m.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all">
                      <span className="material-symbols-outlined text-sm">facebook</span>
                    </a>
                  )}
                  {m.socialLinks.instagram && (
                    <a href={m.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all">
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                    </a>
                  )}
                  {m.socialLinks.youtube && (
                    <a href={m.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all">
                      <span className="material-symbols-outlined text-sm">play_circle</span>
                    </a>
                  )}
                  {m.socialLinks.whatsapp && (
                    <a href={`https://wa.me/${m.socialLinks.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all">
                      <span className="material-symbols-outlined text-sm">chat</span>
                    </a>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-4 border-t border-outline-variant">
                {m.status === 'pending' && (
                  <button onClick={() => handleApprove(m._id)} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-label-lg hover:bg-green-700 transition-all">Approve</button>
                )}
                <button onClick={() => openEdit(m)} className="flex-1 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-label-lg hover:bg-secondary-container hover:text-primary transition-all">Edit</button>
                <button onClick={() => handleDelete(m._id)} className="p-2 border border-outline-variant text-error rounded-lg hover:bg-error-container transition-all">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
