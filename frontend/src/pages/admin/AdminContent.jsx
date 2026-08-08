import React, { useEffect, useState } from 'react';
import { contentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import ImageUploader from '../../components/ImageUploader';

const SECTIONS = [
  { key: 'hero', label: 'Hero Section', icon: 'star' },
  { key: 'about', label: 'About Page', icon: 'info' },
  { key: 'contact_info', label: 'Contact Info', icon: 'location_on' },
  { key: 'social_links', label: 'Social Links', icon: 'share' },
  { key: 'general', label: 'General Settings', icon: 'settings' },
  { key: 'offers', label: 'Offers & Banners', icon: 'local_offer' },
  { key: 'packages', label: 'Package Cards', icon: 'grid_view' },
];

const FIELD_CONFIGS = {
  hero: [
    { key: 'title', label: 'Main Title', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    { key: 'description', label: 'Hero Description', type: 'textarea' },
    { key: 'logoUrl', label: 'Logo Image', type: 'image', shape: 'circle' },
  ],
  about: [
    { key: 'title', label: 'Page Title', type: 'text' },
    { key: 'description', label: 'About Description', type: 'textarea' },
    { key: 'heritageLabel', label: 'Heritage Label', type: 'text' },
    { key: 'heritageTitle', label: 'Heritage Heading', type: 'text' },
    { key: 'heritageDescription', label: 'Heritage Description', type: 'textarea' },
    { key: 'heritageImageUrl', label: 'Heritage Image', type: 'image', shape: 'rect' },
    { key: 'founderName', label: 'Founder Name', type: 'text' },
    { key: 'founderTitle', label: 'Founder Title', type: 'text' },
    { key: 'founderBio', label: 'Founder Bio', type: 'textarea' },
    { key: 'founderImageUrl', label: 'Founder Photo', type: 'image', shape: 'circle' },
    { key: 'teamImageUrl', label: 'Team Photo', type: 'image', shape: 'rect' },
  ],
  contact_info: [
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'phone', label: 'Phone Number', type: 'text' },
    { key: 'email', label: 'Email Address', type: 'text' },
  ],
  social_links: [
    { key: 'facebook', label: 'Facebook URL', type: 'text' },
    { key: 'instagram', label: 'Instagram URL', type: 'text' },
    { key: 'youtube', label: 'YouTube URL', type: 'text' },
    { key: 'whatsapp', label: 'WhatsApp Link', type: 'text' },
  ],
  general: [
    { key: 'siteName', label: 'Site Name', type: 'text' },
    { key: 'tagline', label: 'Tagline', type: 'text' },
    { key: 'metaDescription', label: 'Meta Description', type: 'textarea' },
  ],
};

const EMPTY_OFFER = {
  id: '',
  title: '',
  subtitle: '',
  discountPercent: 10,
  imageUrl: '',
  urgencyText: 'Limited slots! Book now.',
  active: true,
  expiresAt: '',
  appliesTo: 'all', // 'all' or comma-separated member counts e.g. '6,8,12'
};

export default function AdminContent() {
  const [activeSection, setActiveSection] = useState('hero');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Offers state
  const [offers, setOffers] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState(EMPTY_OFFER);

  // Packages state
  const [packages, setPackages] = useState([]);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgForm, setPkgForm] = useState({ members: 6, label: '6 Members', fakeMultiplier: 1.18, enabled: true });

  const fetchSection = (section) => {
    setLoading(true);
    contentAPI.getSection(section)
      .then((r) => {
        const d = r.data.data || {};
        setData(d);
        if (section === 'offers') setOffers(d.items || []);
        if (section === 'packages') setPackages(d.items || []);
      })
      .catch(() => toast.error('Failed to load content.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSection(activeSection); }, [activeSection]);

  const handleChange = (key, value) => setData((prev) => ({ ...prev, [key]: value }));
  const handleNestedChange = (parent, key, value) => setData((prev) => ({
    ...prev,
    [parent]: { ...(prev[parent] || {}), [key]: value },
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = activeSection === 'offers' ? { items: offers }
        : activeSection === 'packages' ? { items: packages }
        : data;
      await contentAPI.update(activeSection, payload);
      toast.success('Content saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save content.');
    } finally {
      setSaving(false);
    }
  };

  // ── Offer CRUD ──
  const openNewOffer = () => {
    setOfferForm({ ...EMPTY_OFFER, id: Date.now().toString() });
    setEditingOffer('new');
  };
  const openEditOffer = (offer) => {
    setOfferForm({ ...offer });
    setEditingOffer(offer.id);
  };
  const saveOffer = async () => {
    let updated;
    if (editingOffer === 'new') {
      updated = [...offers, offerForm];
    } else {
      updated = offers.map((o) => (o.id === editingOffer ? offerForm : o));
    }
    setOffers(updated);
    try {
      await contentAPI.update('offers', { items: updated });
      toast.success('Offer saved.');
    } catch {
      toast.error('Failed to save offer.');
    }
    setEditingOffer(null);
  };
  const deleteOffer = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    const updated = offers.filter((o) => o.id !== id);
    setOffers(updated);
    try {
      await contentAPI.update('offers', { items: updated });
      toast.success('Offer deleted.');
    } catch {
      toast.error('Failed to delete offer.');
    }
  };
  const toggleOffer = async (id) => {
    const updated = offers.map((o) => (o.id === id ? { ...o, active: !o.active } : o));
    setOffers(updated);
    try {
      await contentAPI.update('offers', { items: updated });
    } catch {
      toast.error('Failed to toggle offer.');
    }
  };

  // ── Package CRUD ──
  const openNewPkg = () => {
    setPkgForm({ members: 6, label: '6 Members', fakeMultiplier: 1.18, enabled: true });
    setEditingPkg('new');
  };
  const openEditPkg = (pkg) => { setPkgForm({ ...pkg }); setEditingPkg(pkg.members); };
  const savePkg = async () => {
    let updated;
    if (editingPkg === 'new') {
      updated = [...packages, pkgForm];
    } else {
      updated = packages.map((p) => (p.members === editingPkg ? pkgForm : p));
    }
    // Sort by members count
    updated.sort((a, b) => a.members - b.members);
    setPackages(updated);
    try {
      await contentAPI.update('packages', { items: updated });
      toast.success('Package saved.');
    } catch { toast.error('Failed to save package.'); }
    setEditingPkg(null);
  };
  const deletePkg = async (members) => {
    if (!window.confirm('Delete this package card?')) return;
    const updated = packages.filter((p) => p.members !== members);
    setPackages(updated);
    try {
      await contentAPI.update('packages', { items: updated });
      toast.success('Package deleted.');
    } catch { toast.error('Failed to delete package.'); }
  };
  const togglePkg = async (members) => {
    const updated = packages.map((p) => p.members === members ? { ...p, enabled: !p.enabled } : p);
    setPackages(updated);
    try { await contentAPI.update('packages', { items: updated }); }
    catch { toast.error('Failed to toggle package.'); }
  };

  const fields = FIELD_CONFIGS[activeSection] || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface mb-1">Edit Website Content</h2>
          <p className="text-body-md text-on-surface-variant">Changes reflect on the public website immediately after saving.</p>
        </div>
        {activeSection !== 'offers' && activeSection !== 'packages' && (
          <button onClick={handleSave} disabled={saving || loading} className="btn-primary rounded-full disabled:opacity-60">
            <span className="material-symbols-outlined">{saving ? 'hourglass_empty' : 'save'}</span>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section Tabs */}
        <aside className="lg:col-span-3">
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-label-lg text-left transition-all ${
                  activeSection === s.key
                    ? 'bg-secondary-container text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}>
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor */}
        <div className="lg:col-span-9 card p-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeSection === 'offers' ? (
            // ── Offers Panel ──
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                <h3 className="text-headline-sm font-bold text-on-surface">Offers & Discount Banners</h3>
                <button onClick={openNewOffer} className="btn-primary rounded-full text-label-md">
                  <span className="material-symbols-outlined text-sm">add</span>Add Offer
                </button>
              </div>
              <p className="text-label-md text-on-surface-variant">
                Active offers show as banners on the Home page and apply the highest discount automatically on the Booking page.
              </p>
              {offers.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl block mb-3">local_offer</span>
                  <p>No offers yet. Add one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div key={offer.id} className={`card p-5 border-l-4 ${offer.active ? 'border-green-500' : 'border-outline-variant opacity-60'}`}>
                      <div className="flex gap-4">
                        {offer.imageUrl && (
                          <img src={offer.imageUrl} alt={offer.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-on-surface">{offer.title}</span>
                            <span className="bg-primary text-on-primary px-2 py-0.5 rounded-full text-label-md font-bold">{offer.discountPercent}% OFF</span>
                            <span className={`px-2 py-0.5 rounded-full text-label-md ${offer.active ? 'bg-green-100 text-green-700' : 'bg-surface-container text-on-surface-variant'}`}>
                              {offer.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-label-md text-on-surface-variant">{offer.subtitle}</p>
                          {offer.urgencyText && <p className="text-label-md text-primary font-semibold mt-1">⚡ {offer.urgencyText}</p>}
                          {offer.expiresAt && <p className="text-label-md text-on-surface-variant mt-1">Expires: {new Date(offer.expiresAt).toLocaleDateString('en-IN')}</p>}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button onClick={() => toggleOffer(offer.id)}
                            className={`px-3 py-1.5 rounded-lg text-label-md border transition-all ${offer.active ? 'border-green-400 text-green-600 hover:bg-green-50' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
                            {offer.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => openEditOffer(offer)} className="px-3 py-1.5 rounded-lg text-label-md border border-primary text-primary hover:bg-secondary-container transition-all">Edit</button>
                          <button onClick={() => deleteOffer(offer.id)} className="px-3 py-1.5 rounded-lg text-label-md border border-error text-error hover:bg-error-container transition-all">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeSection === 'packages' ? (
            // ── Packages Panel ──
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                <h3 className="text-headline-sm font-bold text-on-surface">Package Cards</h3>
                <button onClick={openNewPkg} className="btn-primary rounded-full text-label-md">
                  <span className="material-symbols-outlined text-sm">add</span>Add Package
                </button>
              </div>
              <p className="text-label-md text-on-surface-variant">Edit the package cards shown on the booking page. Fake markup creates a crossed-out "original" price (like Flipkart).</p>
              {packages.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl block mb-3">grid_view</span>
                  <p>No packages yet. Add one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <div key={pkg.members} className={`card p-5 flex items-center gap-4 ${!pkg.enabled ? 'opacity-50' : ''}`}>
                      <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0 text-primary font-black text-label-lg">{pkg.members}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface">{pkg.label}</p>
                        <p className="text-label-md text-on-surface-variant">Fake markup: {Math.round((pkg.fakeMultiplier - 1) * 100)}% above base price</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-label-md ${pkg.enabled ? 'bg-green-100 text-green-700' : 'bg-surface-container text-on-surface-variant'}`}>
                        {pkg.enabled ? 'Visible' : 'Hidden'}
                      </span>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => togglePkg(pkg.members)} className={`px-3 py-1.5 rounded-lg text-label-md border transition-all ${pkg.enabled ? 'border-green-400 text-green-600 hover:bg-green-50' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
                          {pkg.enabled ? 'Hide' : 'Show'}
                        </button>
                        <button onClick={() => openEditPkg(pkg)} className="px-3 py-1.5 rounded-lg text-label-md border border-primary text-primary hover:bg-secondary-container transition-all">Edit</button>
                        <button onClick={() => deletePkg(pkg.members)} className="px-3 py-1.5 rounded-lg text-label-md border border-error text-error hover:bg-error-container transition-all">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // ── Normal fields ──
            <div className="space-y-6">
              <h3 className="text-headline-sm font-bold text-on-surface border-b border-outline-variant pb-4">
                {SECTIONS.find((s) => s.key === activeSection)?.label}
              </h3>
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="text-label-lg text-on-surface-variant block mb-1">{field.label}</label>
                  {field.type === 'image' ? (
                    <ImageUploader label="" value={data[field.key] || ''} onChange={(url) => handleChange(field.key, url)} shape={field.shape || 'rect'} placeholder={`Browse ${field.label.toLowerCase()}`} />
                  ) : field.type === 'textarea' ? (
                    <textarea className="input-field resize-none" rows="4" value={data[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} />
                  ) : (
                    <input className="input-field" type="text" value={data[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} />
                  )}
                </div>
              ))}
              {activeSection === 'about' && (
                <div className="pt-4 border-t border-outline-variant">
                  <h4 className="text-headline-sm font-bold text-on-surface mb-4">Stats Display</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'eventsCount', label: 'Events Count (e.g. 2000+)' },
                      { key: 'foundedYear', label: 'Founded Year (e.g. Since 2010)' },
                      { key: 'location', label: 'Location (e.g. Kateel)' },
                    ].map((stat) => (
                      <div key={stat.key}>
                        <label className="text-label-lg text-on-surface-variant block mb-1">{stat.label}</label>
                        <input className="input-field" type="text" value={data.stats?.[stat.key] || ''} onChange={(e) => handleNestedChange('stats', stat.key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-6 p-4 bg-surface-container-low rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-primary flex-shrink-0">info</span>
                <p className="text-label-md text-on-surface-variant">Click <strong>Save Changes</strong> to publish updates to the live website.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Package Edit Modal ── */}
      {editingPkg !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h3 className="text-headline-sm font-bold text-on-surface">{editingPkg === 'new' ? 'New Package' : 'Edit Package'}</h3>
              <button onClick={() => setEditingPkg(null)} className="p-2 hover:bg-surface-container rounded-lg"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Members Count *</label>
                  <input className="input-field" type="number" min="1" value={pkgForm.members} onChange={(e) => setPkgForm({ ...pkgForm, members: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Card Label</label>
                  <input className="input-field" value={pkgForm.label} onChange={(e) => setPkgForm({ ...pkgForm, label: e.target.value })} placeholder="e.g. 6 Members" />
                </div>
              </div>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Fake Markup % (crossed-out price)</label>
                <input className="input-field" type="number" min="1" max="100" value={Math.round((pkgForm.fakeMultiplier - 1) * 100)} onChange={(e) => setPkgForm({ ...pkgForm, fakeMultiplier: 1 + Number(e.target.value) / 100 })} />
                <p className="text-label-md text-on-surface-variant mt-1">e.g. 20 = show 20% higher price crossed out</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="pkgEnabled" checked={pkgForm.enabled} onChange={(e) => setPkgForm({ ...pkgForm, enabled: e.target.checked })} className="w-4 h-4 accent-primary" />
                <label htmlFor="pkgEnabled" className="text-label-lg text-on-surface">Visible on booking page</label>
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant flex justify-end gap-3">
              <button onClick={() => setEditingPkg(null)} className="px-6 py-3 border border-outline-variant text-on-surface-variant rounded-lg text-label-lg hover:bg-surface-container transition-all">Cancel</button>
              <button onClick={savePkg} className="px-6 py-3 bg-primary text-on-primary rounded-lg text-label-lg font-semibold hover:bg-on-primary-fixed-variant transition-all">Save Package</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Offer Edit Modal ── */}      {editingOffer !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h3 className="text-headline-sm font-bold text-on-surface">{editingOffer === 'new' ? 'New Offer' : 'Edit Offer'}</h3>
              <button onClick={() => setEditingOffer(null)} className="p-2 hover:bg-surface-container rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Offer Title *</label>
                <input className="input-field" placeholder="e.g. Ganesh Chaturthi Special" value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })} />
              </div>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Subtitle / Description</label>
                <input className="input-field" placeholder="e.g. 95% Energetic performance guaranteed!" value={offerForm.subtitle} onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Discount %</label>
                  <input className="input-field" type="number" min="0" max="100" value={offerForm.discountPercent} onChange={(e) => setOfferForm({ ...offerForm, discountPercent: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Expires On</label>
                  <input className="input-field" type="date" value={offerForm.expiresAt ? offerForm.expiresAt.split('T')[0] : ''} onChange={(e) => setOfferForm({ ...offerForm, expiresAt: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Urgency Text</label>
                <input className="input-field" placeholder="e.g. Hurry! Only 5 slots left." value={offerForm.urgencyText} onChange={(e) => setOfferForm({ ...offerForm, urgencyText: e.target.value })} />
              </div>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Offer Image (Ganesh / Onam photo etc.)</label>
                <ImageUploader label="" value={offerForm.imageUrl || ''} onChange={(url) => setOfferForm({ ...offerForm, imageUrl: url })} shape="rect" placeholder="Upload offer image" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="offerActive" checked={offerForm.active} onChange={(e) => setOfferForm({ ...offerForm, active: e.target.checked })} className="w-4 h-4 accent-primary" />
                <label htmlFor="offerActive" className="text-label-lg text-on-surface">Active (show on website)</label>
              </div>
              <div>
                <label className="text-label-lg text-on-surface-variant block mb-2">Applies To (Package Size)</label>
                <div className="flex flex-wrap gap-2">
                  {['all', '6', '8', '12', '15', '18', '21', '24', '30'].map((v) => {
                    const selected = v === 'all'
                      ? offerForm.appliesTo === 'all'
                      : offerForm.appliesTo !== 'all' && (offerForm.appliesTo || '').split(',').includes(v);
                    return (
                      <button key={v} type="button"
                        onClick={() => {
                          if (v === 'all') { setOfferForm({ ...offerForm, appliesTo: 'all' }); return; }
                          const current = offerForm.appliesTo === 'all' ? [] : (offerForm.appliesTo || '').split(',').filter(Boolean);
                          const updated = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
                          setOfferForm({ ...offerForm, appliesTo: updated.length ? updated.join(',') : 'all' });
                        }}
                        className={`px-3 py-1.5 rounded-full text-label-md font-semibold border transition-all ${selected ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary'}`}>
                        {v === 'all' ? 'All Packages' : `${v} Members`}
                      </button>
                    );
                  })}
                </div>
                <p className="text-label-md text-on-surface-variant mt-1">Select which package sizes this offer applies to.</p>
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant flex justify-end gap-3">
              <button onClick={() => setEditingOffer(null)} className="px-6 py-3 border border-outline-variant text-on-surface-variant rounded-lg text-label-lg hover:bg-surface-container transition-all">Cancel</button>
              <button onClick={saveOffer} className="px-6 py-3 bg-primary text-on-primary rounded-lg text-label-lg font-semibold hover:bg-on-primary-fixed-variant transition-all">Save Offer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
