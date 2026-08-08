import React, { useEffect, useState } from 'react';
import { teamAPI } from '../services/api';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';

const LEVEL_COLORS = {
  Expert: 'bg-primary text-on-primary',
  Intermediate: 'bg-tertiary text-on-tertiary',
  Beginner: 'bg-secondary-container text-on-secondary-container',
};

// Build correct social URL from user input
const buildSocialUrl = (platform, value) => {
  if (!value) return null;
  const v = value.trim();
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  switch (platform) {
    case 'facebook':  return `https://facebook.com/${v}`;
    case 'instagram': return `https://instagram.com/${v}`;
    case 'youtube':   return `https://youtube.com/@${v}`;
    case 'whatsapp':  return `https://wa.me/${v.replace(/\D/g, '')}`;
    default:          return v;
  }
};

const SOCIAL_META = [
  { key: 'instagram', icon: 'photo_camera', label: 'Instagram', color: 'hover:bg-pink-500 hover:text-white' },
  { key: 'facebook',  icon: 'facebook',     label: 'Facebook',  color: 'hover:bg-blue-600 hover:text-white' },
  { key: 'youtube',   icon: 'play_circle',  label: 'YouTube',   color: 'hover:bg-red-600 hover:text-white' },
  { key: 'whatsapp',  icon: 'chat',         label: 'WhatsApp',  color: 'hover:bg-green-500 hover:text-white' },
];

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', phone: '', age: '', yearsOfExperience: '',
    role: 'Chende Artist', experienceLevel: 'Beginner', bio: '', imageUrl: '',
    socialLinks: { facebook: '', instagram: '', youtube: '', whatsapp: '' },
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    teamAPI.getPublic()
      .then((r) => setMembers(r.data.members))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await teamAPI.apply(form);
      toast.success('Application submitted! We will review and contact you.');
      setForm({
        name: '', phone: '', age: '', yearsOfExperience: '',
        role: 'Chende Artist', experienceLevel: 'Beginner', bio: '', imageUrl: '',
        socialLinks: { facebook: '', instagram: '', youtube: '', whatsapp: '' },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-surface-container-lowest">
        <div className="container-max text-center">
          <span className="section-label">Our Performers</span>
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-4">Our Rhythmic Masters</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Meet the disciplined performers who carry the soul of the Chende drum, blending ancient tradition with contemporary precision.
          </p>
        </div>
      </section>

      {/* Team Grid — larger cards */}
      <section className="py-16 bg-surface">
        <div className="container-max">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block">group</span>
              <p className="text-body-lg">Team members coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member) => (
                <div key={member._id} className="card overflow-hidden hover:-translate-y-1 transition-transform group">
                  {/* Photo — circle on white background */}
                  <div className="relative h-72 bg-white overflow-hidden flex items-center justify-center">
                    {member.imageUrl ? (
                      <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    ) : (
                      <div className="w-56 h-56 rounded-full bg-secondary-container flex items-center justify-center border-4 border-primary/20">
                        <span className="material-symbols-outlined text-8xl text-primary/30">person</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-headline-sm font-bold text-on-surface mb-1">{member.name}</h3>
                    <p className="text-body-md text-on-surface-variant mb-1">{member.role}</p>

                    {member.bio && (
                      <p className="text-label-md text-on-surface-variant mb-3 line-clamp-2 leading-relaxed">{member.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-label-md text-on-surface-variant mb-4">
                      {member.yearsOfExperience > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                          {member.yearsOfExperience} yrs exp
                        </span>
                      )}
                      {member.performancesCompleted > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary text-sm">verified</span>
                          {member.performancesCompleted} shows
                        </span>
                      )}
                    </div>

                    {/* Social Links */}
                    {member.socialLinks && Object.values(member.socialLinks).some(Boolean) && (
                      <div className="flex items-center gap-2 pt-4 border-t border-outline-variant">
                        {SOCIAL_META.map((s) => {
                          const url = buildSocialUrl(s.key, member.socialLinks[s.key]);
                          if (!url) return null;
                          return (
                            <a
                              key={s.key}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={s.label}
                              onClick={(e) => e.stopPropagation()}
                              className={`w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant transition-all ${s.color}`}
                            >
                              <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Join Form */}
      <section className="py-20 bg-surface-container-low">
        <div className="container-max">
          <div className="max-w-2xl mx-auto card p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-headline-md font-bold text-on-surface mb-2">Join Our Team</h2>
              <p className="text-body-md text-on-surface-variant">Ready to beat with us? Fill out the form below to apply.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo upload — Instagram style circle */}
              <div className="flex flex-col items-center gap-2">
                <ImageUploader
                  label="Your Photo"
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  shape="circle"
                  isPublic={true}
                  placeholder="Upload your photo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Full Name *</label>
                  <input className="input-field" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Phone Number *</label>
                  <input className="input-field" placeholder="+91 00000 00000" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Age</label>
                  <input className="input-field" placeholder="25" type="number" min="10" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Years of Experience</label>
                  <input className="input-field" placeholder="0" type="number" min="0" value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Role</label>
                  <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option>Chende Artist</option>
                    <option>Taala Artist</option>
                    <option>Valamiri Player</option>
                    <option>Support Staff</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Experience Level</label>
                  <select className="input-field" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-label-lg text-on-surface-variant block mb-1">Short Bio</label>
                <textarea className="input-field resize-none" rows="3" placeholder="Tell us about your musical journey..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>

              {/* Social Links */}
              <div className="pt-2 border-t border-outline-variant">
                <p className="text-label-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">share</span>
                  Social Media <span className="text-on-surface-variant font-normal">(optional)</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'instagram', icon: 'photo_camera', placeholder: 'Instagram username or URL' },
                    { key: 'facebook',  icon: 'facebook',     placeholder: 'Facebook username or URL' },
                    { key: 'youtube',   icon: 'play_circle',  placeholder: 'YouTube channel or URL' },
                    { key: 'whatsapp',  icon: 'chat',         placeholder: 'WhatsApp number (e.g. 919901933947)' },
                  ].map((s) => (
                    <div key={s.key} className="relative">
                      <span className="material-symbols-outlined absolute left-0 bottom-2 text-outline text-[18px]">{s.icon}</span>
                      <input
                        className="input-field pl-7"
                        placeholder={s.placeholder}
                        value={form.socialLinks[s.key]}
                        onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, [s.key]: e.target.value } })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full btn-primary justify-center py-4 rounded-lg disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
