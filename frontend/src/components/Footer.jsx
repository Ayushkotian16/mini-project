import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '../services/api';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY2gXvr5TLlT3ypR-fAnOnydCqElxAKTKQlBGdq1wK8sX-SwdhUrsynhG0uXs0AxpAM_gdQUnzbQsCnTqzCkWCEgVqSom0o0TKFu_Tl9NGXZ49PjS2dew3iIeaiELc19M7wbB-bkaqL_YQOSKsHHqROueFp4mzFQcMlF1byhnXbzi4hOvO3dGaiQM8gb87dO7A1hycCYHCAmv1x4OK34cObyPUypA33qOg4UW32k2kPk9SaHuvDv8kjtcXPAk6rjYrEHSnI3K_4PGv';

export default function Footer() {
  const [info, setInfo] = useState({
    address: 'Kateel Temple Road, Kateel, Mangalore, Karnataka - 574148',
    phone: '+91 99019 33947',
    email: 'nandini.chende@gmail.com',
  });
  const [social, setSocial] = useState({ facebook: '#', instagram: '#', youtube: '#', whatsapp: '#' });

  useEffect(() => {
    Promise.all([
      contentAPI.getSection('contact_info'),
      contentAPI.getSection('owner'),
    ]).then(([contactRes, ownerRes]) => {
      const c = contactRes.data.data || {};
      const o = ownerRes.data.data || {};
      setInfo({
        address: c.address || 'Kateel Temple Road, Kateel, Mangalore, Karnataka - 574148',
        phone: o.phone1 || c.phone || '+91 99019 33947',
        phone2: o.phone2 || '',
        email: c.email || o.email || 'nandini.chende@gmail.com',
      });
    }).catch(() => {});
    contentAPI.getSection('social_links').then((r) => { if (r.data.data) setSocial(r.data.data); }).catch(() => {});
  }, []);

  return (
    <footer className="w-full bg-primary text-on-primary">
      <div className="container-max py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-on-primary/30 overflow-hidden flex-shrink-0">
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-headline-sm font-bold">Nandini</span>
            </div>
            <p className="text-body-md opacity-80 leading-relaxed">
              Preserving the thunderous legacy of Kateel's percussive arts. Experience the rhythm that defines our culture.
            </p>
            <div className="flex gap-3">
              {(() => {
                const buildUrl = (platform, v) => {
                  if (!v || v === '#') return null;
                  if (v.startsWith('http')) return v;
                  if (platform === 'whatsapp') {
                    const d = v.replace(/\D/g,'');
                    return `https://wa.me/${d.length === 10 ? '91'+d : d}`;
                  }
                  if (platform === 'instagram') return `https://instagram.com/${v}`;
                  if (platform === 'facebook') return `https://facebook.com/${v}`;
                  if (platform === 'youtube') return `https://youtube.com/@${v}`;
                  return v;
                };
                return [
                  { key: 'facebook', icon: 'facebook', label: 'Facebook' },
                  { key: 'instagram', icon: 'photo_camera', label: 'Instagram' },
                  { key: 'youtube', icon: 'play_circle', label: 'YouTube' },
                  { key: 'whatsapp', icon: 'chat', label: 'WhatsApp' },
                ].map(({ key, icon, label }) => {
                  const url = buildUrl(key, social[key]);
                  if (!url) return null;
                  return (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}
                      className="w-10 h-10 rounded-full border border-on-primary/30 flex items-center justify-center hover:bg-on-primary/10 transition-colors">
                      <span className="material-symbols-outlined text-xl">{icon}</span>
                    </a>
                  );
                });
              })()}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="text-label-lg uppercase tracking-widest opacity-60 font-bold">Quick Links</h4>
            <ul className="space-y-3">
              {[{ to: '/', label: 'Home' }, { to: '/about', label: 'About Us' }, { to: '/team', label: 'Team Members' }, { to: '/events', label: 'Events' }, { to: '/book', label: 'Book Us' }].map((link) => (
                <li key={link.to}><Link to={link.to} className="text-body-md opacity-80 hover:opacity-100 transition-opacity">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-5">
            <h4 className="text-label-lg uppercase tracking-widest opacity-60 font-bold">Services</h4>
            <ul className="space-y-3 text-body-md opacity-80">
              <li>Temple Festival Performances</li>
              <li>Corporate Events</li>
              <li>Wedding Ceremonies</li>
              <li>Cultural Workshops</li>
              <li>Private Celebrations</li>
            </ul>
          </div>

          {/* Contact — from DB */}
          <div className="space-y-5">
            <h4 className="text-label-lg uppercase tracking-widest opacity-60 font-bold">Get in Touch</h4>
            <div className="space-y-4">
              {info.address && (
                <div className="flex gap-3 opacity-80">
                  <span className="material-symbols-outlined flex-shrink-0">location_on</span>
                  <p className="text-body-md">{info.address}</p>
                </div>
              )}
              {info.phone && (
                <div className="flex gap-3 opacity-80">
                  <span className="material-symbols-outlined flex-shrink-0">call</span>
                  <a href={`tel:${info.phone.replace(/\s/g,'')}`} className="text-body-md hover:opacity-100 transition-opacity">{info.phone}</a>
                </div>
              )}
              {info.phone2 && (
                <div className="flex gap-3 opacity-80">
                  <span className="material-symbols-outlined flex-shrink-0">call</span>
                  <a href={`tel:${info.phone2.replace(/\s/g,'')}`} className="text-body-md hover:opacity-100 transition-opacity">{info.phone2}</a>
                </div>
              )}
              {info.email && (
                <div className="flex gap-3 opacity-80">
                  <span className="material-symbols-outlined flex-shrink-0">mail</span>
                  <a href={`mailto:${info.email}`} className="text-body-md hover:opacity-100 transition-opacity">{info.email}</a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-on-primary/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-label-md opacity-60">© 2024 Team Nandini Chende Kateel. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/contact" className="text-label-md opacity-60 hover:opacity-100 transition-opacity">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
