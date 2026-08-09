import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { beatAPI, contentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import ImageUploader from '../../components/ImageUploader';

const EMPTY_FORM = {
  title: '',
  description: '',
  imageUrl: '',
  audioUrl: '',
  duration: '',
  category: 'General',
  status: 'active',
  order: 0,
};

const CATEGORIES = ['General', 'Temple Festival', 'Classical', 'Folk', 'Fusion', 'Corporate', 'Other'];

export default function AdminBeats() {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const audioInputRef = useRef(null);

  // Beats section toggle
  const [beatsEnabled, setBeatsEnabled] = useState(true);
  const [togglingSection, setTogglingSection] = useState(false);
  const [generalContent, setGeneralContent] = useState(null);

  const fetchBeats = () => {
    setLoading(true);
    beatAPI.getAllAdmin()
      .then((r) => setBeats(r.data.beats || []))
      .catch(() => toast.error('Failed to load beats.'))
      .finally(() => setLoading(false));
  };

  const fetchSectionToggle = () => {
    contentAPI.getSection('general')
      .then((r) => {
        setGeneralContent(r.data?.data || {});
        setBeatsEnabled(r.data?.data?.beatsEnabled !== false);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBeats();
    fetchSectionToggle();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (beat) => {
    setEditing(beat);
    setForm({ ...EMPTY_FORM, ...beat });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.audioUrl) {
      toast.error('Please upload an audio file.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await beatAPI.update(editing._id, form);
        toast.success('Beat updated.');
      } else {
        await beatAPI.create(form);
        toast.success('Beat created.');
      }
      setShowForm(false);
      fetchBeats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save beat.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this beat?')) return;
    try {
      await beatAPI.delete(id);
      toast.success('Beat deleted.');
      fetchBeats();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleAudioUpload = async (file) => {
    if (!file) return;
    setAudioUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('audio', file);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/upload/audio-admin`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data?.url) {
        setForm((f) => ({ ...f, audioUrl: res.data.url }));
        toast.success('Audio uploaded.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Audio upload failed.');
    } finally {
      setAudioUploading(false);
    }
  };

  const toggleBeatsSection = async () => {
    setTogglingSection(true);
    const newVal = !beatsEnabled;
    try {
      const merged = { ...(generalContent || {}), beatsEnabled: newVal };
      await contentAPI.update('general', merged);
      setBeatsEnabled(newVal);
      setGeneralContent(merged);
      toast.success(newVal ? 'Beats section enabled on public site.' : 'Beats section hidden from public site.');
    } catch {
      toast.error('Failed to update section visibility.');
    } finally {
      setTogglingSection(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface mb-1">Manage Beats</h2>
          <p className="text-body-md text-on-surface-variant">Upload and manage audio tracks for the public Beats page.</p>
        </div>
        <button onClick={openCreate} className="btn-primary rounded-full flex-shrink-0">
          <span className="material-symbols-outlined">add</span>
          New Beat
        </button>
      </div>

      {/* Section toggle */}
      <div className="card p-5 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-label-lg font-semibold text-on-surface">Beats Section Visibility</p>
          <p className="text-label-md text-on-surface-variant mt-0.5">
            {beatsEnabled ? 'Currently visible on the public site.' : 'Currently hidden from the public site (shows "Coming Soon").'}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleBeatsSection}
          disabled={togglingSection}
          className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 disabled:opacity-60 ${beatsEnabled ? 'bg-primary' : 'bg-outline-variant'}`}
        >
          <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${beatsEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-sm font-bold text-on-surface">{editing ? 'Edit Beat' : 'Add Beat'}</h3>
              <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="text-label-lg text-on-surface-variant block mb-1">Title *</label>
                  <input
                    className="input-field"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="e.g. Kateel Temple Beat"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Category</label>
                  <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Duration</label>
                  <input
                    className="input-field"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 2:34"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Order</label>
                  <input
                    className="input-field"
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  />
                </div>

                {/* Status toggle */}
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: form.status === 'active' ? 'draft' : 'active' })}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${form.status === 'active' ? 'bg-primary' : 'bg-outline-variant'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.status === 'active' ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                  <div>
                    <p className="text-label-lg font-semibold text-on-surface">
                      {form.status === 'active' ? 'Active' : 'Draft'}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {form.status === 'active' ? 'Visible on public site' : 'Hidden from public site'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-label-lg text-on-surface-variant block mb-1">Description</label>
                  <textarea
                    className="input-field resize-none"
                    rows="2"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description of this beat..."
                  />
                </div>

                {/* Cover Image */}
                <div className="md:col-span-2">
                  <ImageUploader
                    label="Cover Image"
                    value={form.imageUrl}
                    onChange={(url) => setForm({ ...form, imageUrl: url })}
                    shape="square"
                    placeholder="Browse cover image"
                  />
                </div>

                {/* Audio Upload */}
                <div className="md:col-span-2">
                  <label className="text-label-lg text-on-surface-variant block mb-2">Audio File *</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => audioInputRef.current?.click()}
                        disabled={audioUploading}
                        className="btn-outline flex items-center gap-2 disabled:opacity-60"
                      >
                        {audioUploading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">audio_file</span>
                            {form.audioUrl ? 'Change Audio' : 'Upload Audio'}
                          </>
                        )}
                      </button>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAudioUpload(file);
                          e.target.value = '';
                        }}
                      />
                      {form.audioUrl && !audioUploading && (
                        <span className="text-label-md text-primary flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Audio ready
                        </span>
                      )}
                    </div>
                    {form.audioUrl && (
                      <div className="bg-surface-container-low rounded-xl p-3">
                        <audio controls src={form.audioUrl} className="w-full h-8" style={{ height: '36px' }} />
                      </div>
                    )}
                    {!form.audioUrl && (
                      <p className="text-label-sm text-on-surface-variant">Accepted: MP3, WAV, OGG, MP4 audio. Max 50MB.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || audioUploading} className="btn-primary flex-1 justify-center py-3 rounded-lg disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Beat'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 justify-center py-3 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Beats list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : beats.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 block">music_note</span>
          <p className="text-body-lg">No beats yet. <button onClick={openCreate} className="text-primary underline">Add one.</button></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beats.map((beat) => (
            <div key={beat._id} className="card overflow-hidden flex flex-col">
              {/* Cover */}
              <div className="h-36 bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                {beat.imageUrl ? (
                  <img src={beat.imageUrl} alt={beat.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-6xl text-primary/20">music_note</span>
                )}
                <span className={`absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${beat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {beat.status}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                {beat.category && beat.category !== 'General' && (
                  <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-label-sm mb-2 self-start">{beat.category}</span>
                )}
                <h3 className="text-headline-sm font-bold text-on-surface mb-1 leading-tight">{beat.title}</h3>
                {beat.description && (
                  <p className="text-label-md text-on-surface-variant mb-2 line-clamp-2">{beat.description}</p>
                )}
                <div className="flex items-center gap-3 text-label-sm text-on-surface-variant mb-3">
                  {beat.duration && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                      {beat.duration}
                    </span>
                  )}
                  {beat.order !== undefined && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-primary">sort</span>
                      Order: {beat.order}
                    </span>
                  )}
                </div>
                {beat.audioUrl && (
                  <div className="mb-3">
                    <audio controls src={beat.audioUrl} className="w-full" style={{ height: '36px' }} />
                  </div>
                )}
                <div className="flex gap-2 mt-auto pt-4 border-t border-outline-variant">
                  <button
                    onClick={() => openEdit(beat)}
                    className="flex-1 py-2 bg-primary text-on-primary rounded-lg text-label-lg hover:bg-on-primary-fixed-variant transition-all flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>Edit
                  </button>
                  <button
                    onClick={() => handleDelete(beat._id)}
                    className="p-2 border border-outline-variant text-error rounded-lg hover:bg-error-container transition-all"
                  >
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
