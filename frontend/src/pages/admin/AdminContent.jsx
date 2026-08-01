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

export default function AdminContent() {
  const [activeSection, setActiveSection] = useState('hero');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSection = (section) => {
    setLoading(true);
    contentAPI.getSection(section)
      .then((r) => setData(r.data.data || {}))
      .catch(() => toast.error('Failed to load content.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSection(activeSection); }, [activeSection]);

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (parent, key, value) => {
    setData((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] || {}), [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await contentAPI.update(activeSection, data);
      toast.success('Content saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save content.');
    } finally {
      setSaving(false);
    }
  };

  const fields = FIELD_CONFIGS[activeSection] || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface mb-1">Edit Website Content</h2>
          <p className="text-body-md text-on-surface-variant">Changes reflect on the public website immediately after saving.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="btn-primary rounded-full disabled:opacity-60"
        >
          <span className="material-symbols-outlined">{saving ? 'hourglass_empty' : 'save'}</span>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section Tabs */}
        <aside className="lg:col-span-3">
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-label-lg text-left transition-all ${
                  activeSection === s.key
                    ? 'bg-secondary-container text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
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
          ) : (
            <div className="space-y-6">
              <h3 className="text-headline-sm font-bold text-on-surface border-b border-outline-variant pb-4">
                {SECTIONS.find((s) => s.key === activeSection)?.label}
              </h3>

              {fields.map((field) => (
                <div key={field.key}>
                  <label className="text-label-lg text-on-surface-variant block mb-1">{field.label}</label>
                  {field.type === 'image' ? (
                    <ImageUploader
                      label=""
                      value={data[field.key] || ''}
                      onChange={(url) => handleChange(field.key, url)}
                      shape={field.shape || 'rect'}
                      placeholder={`Browse ${field.label.toLowerCase()}`}
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="input-field resize-none"
                      rows="4"
                      value={data[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  ) : (
                    <input
                      className="input-field"
                      type="text"
                      value={data[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}

              {/* Stats sub-fields for about section */}
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
                        <input
                          className="input-field"
                          type="text"
                          value={data.stats?.[stat.key] || ''}
                          onChange={(e) => handleNestedChange('stats', stat.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview hint */}
              <div className="mt-6 p-4 bg-surface-container-low rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-primary flex-shrink-0">info</span>
                <p className="text-label-md text-on-surface-variant">
                  Click <strong>Save Changes</strong> to publish updates to the live website. Changes take effect immediately.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
