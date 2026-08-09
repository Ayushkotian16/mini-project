import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '../services/api';

const TEAM_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfOuxfduJkJ2EzLL_BARPFUoxsU1axaKsH_EZMjaOoUMjYJoKXDjfbkNm5BJCcbeTviiFR08M0YbbPs4EM_gSqX-2xesbcheBI_QF4abw5NzB0iYWhZlXjrJggHWm-e6yHgww0flVmZFL43aG04Lh97JGg6AYhJF9FTaYu93UR1tSPckEIAVknYqzCyziZJEBlFBw1rE7-cVQf3v2yJzzNeBVyS3fPGnVmERSjuwWp0kzHcCdEgJn_8NpoyChnpx2pyILdHWEiYZi9';
const FOUNDER_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2Ooft7EG8duViBq7XdYdFjuJUFJ6AVPkE9LZ8TobWGZcEQ6AYXOe0FyHH6-9aid8DGfuJIvFSa_18BOWx_MC5p4o3qvuJq7Ost2RW9B8F9xnsQmqzAy1F3xmj4_hnxMB72jva4w18HMGEdxDwKpxjFI7FqXm5uxlpz-WzYUkbBNEk-u5g-TaZyJ68mTKjwCGArwlLzzftdiYdBj3rdJuATUh68oQl83ISykDIjlg_rndsdr6uWqXYAz52nmZwp2YDCDcnWTlFjNBC';

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [contactInfo, setContactInfo] = useState({ phone: '+91 99019 33947', email: 'nandini.chende@gmail.com' });
  const [social, setSocial] = useState({ facebook: '', instagram: '', youtube: '', whatsapp: '' });

  useEffect(() => {
    Promise.all([
      contentAPI.getSection('about'),
      contentAPI.getSection('contact_info'),
      contentAPI.getSection('owner'),
      contentAPI.getSection('social_links'),
    ]).then(([aboutRes, contactRes, ownerRes, socialRes]) => {
      setAbout(aboutRes.data.data);
      const c = contactRes.data.data || {};
      const o = ownerRes.data.data || {};
      setContactInfo({
        phone: o.phone1 || c.phone || '+91 99019 33947',
        phone2: o.phone2 || '',
        email: c.email || o.email || 'nandini.chende@gmail.com',
        address: c.address || '',
      });
      if (socialRes.data.data) setSocial(socialRes.data.data);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const data = about || {};

  return (
    <div className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
    <>
      {/* Hero */}
      <section className="py-16 md:py-32 bg-surface-container-lowest">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <span className="inline-block px-4 py-1 bg-secondary-container text-primary rounded-full text-label-md mb-4">Traditional Excellence</span>
                <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-background">
                  {data.title || 'About Team Nandini Chende Kateel'}
                </h1>
              </div>
              <p className="text-body-lg text-on-surface-variant leading-relaxed">
                {data.description || 'Established in the sacred town of Kateel in 2010, Team Nandini Chende Kateel has become a hallmark of percussive excellence. We are dedicated to preserving and promoting the rhythmic heritage of the Chende.'}
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: 'event_available', value: data.stats?.eventsCount || '2000+', label: 'Events' },
                  { icon: 'history', value: data.stats?.foundedYear || 'Since 2010', label: 'Legacy' },
                  { icon: 'location_on', value: data.stats?.location || 'Kateel', label: 'Origins' },
                ].map((stat) => (
                  <div key={stat.label} className="card p-5 text-center">
                    <span className="material-symbols-outlined text-primary mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                    <h3 className="text-headline-sm font-bold text-primary">{stat.value}</h3>
                    <p className="text-label-md text-on-surface-variant">{stat.label}</p>
                  </div>
                ))}
              </div>
              <Link to="/book" className="btn-primary rounded-full">
                Book Us for Your Event
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="w-full aspect-square max-w-[500px] rounded-full overflow-hidden border-8 border-secondary-container shadow-luminous">
                <img src={data.teamImageUrl || TEAM_IMG} alt="Team performing" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-secondary-container py-24">
        <div className="container-max">
          <div className="bg-surface-container-lowest rounded-3xl p-8 md:p-16 shadow-luminous border border-outline-variant flex flex-col md:flex-row gap-12 items-center">
            <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
              <div className="w-full h-full rounded-full border-4 border-primary p-2 overflow-hidden">
                <img src={data.founderImageUrl || FOUNDER_IMG} alt={data.founderName || 'Kiran Anchan'} className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
              <div className="space-y-5 text-center md:text-left flex-grow">
              <div>
                <h2 className="text-headline-md font-bold text-primary">{data.founderName || 'Kiran Anchan'}</h2>
                <p className="text-label-lg text-tertiary">{data.founderTitle || 'Founder & Team Owner'}</p>
              </div>
              <p className="text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
                {data.founderBio || 'Kiran Anchan is the visionary behind Team Nandini Chende Kateel. With over a decade of dedication to the art of percussion, he has led the team to perform at prestigious events across the country.'}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {contactInfo.phone && (
                  <a href={`tel:${contactInfo.phone.replace(/\s/g,'')}`}
                    className="group flex items-center gap-2 px-5 py-3 rounded-full bg-secondary-container text-primary hover:bg-primary hover:text-on-primary transition-all">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                    <span className="text-label-lg font-semibold">{contactInfo.phone}</span>
                  </a>
                )}
                {contactInfo.phone2 && (
                  <a href={`tel:${contactInfo.phone2.replace(/\s/g,'')}`}
                    className="group flex items-center gap-2 px-5 py-3 rounded-full bg-secondary-container text-primary hover:bg-primary hover:text-on-primary transition-all">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                    <span className="text-label-lg font-semibold">{contactInfo.phone2}</span>
                  </a>
                )}
                {contactInfo.email && (
                  <a href={`mailto:${contactInfo.email}`}
                    className="group flex items-center gap-2 px-5 py-3 rounded-full bg-secondary-container text-primary hover:bg-primary hover:text-on-primary transition-all">
                    <span className="material-symbols-outlined">mail</span>
                    <span className="text-label-lg font-semibold hidden sm:inline">{contactInfo.email}</span>
                    <span className="text-label-lg font-semibold sm:hidden">Email</span>
                  </a>
                )}
                {social.whatsapp && social.whatsapp !== '#' && (
                  <a href={(() => { const d = social.whatsapp.replace(/\D/g,''); return `https://wa.me/${d.length===10?'91'+d:d}`; })()} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-3 rounded-full bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition-all">
                    <span className="material-symbols-outlined">chat</span>
                    <span className="text-label-lg font-semibold">WhatsApp</span>
                  </a>
                )}
                {social.instagram && social.instagram !== '#' && (
                  <a href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram}`} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-3 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-600 hover:text-white transition-all">
                    <span className="material-symbols-outlined">photo_camera</span>
                    <span className="text-label-lg font-semibold">Instagram</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="section-label">Our Values</span>
            <h2 className="text-headline-md font-bold text-on-surface">What Drives Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'music_note', title: 'Tradition', desc: 'We uphold the centuries-old art of Chende performance with unwavering respect for its cultural roots.' },
              { icon: 'verified', title: 'Excellence', desc: 'Every performance is delivered with the highest standards of discipline, precision, and artistic integrity.' },
              { icon: 'diversity_3', title: 'Community', desc: 'We are deeply rooted in the Kateel community, giving back through cultural education and youth training.' },
            ].map((v) => (
              <div key={v.title} className="card p-8 text-center">
                <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">{v.icon}</span>
                </div>
                <h3 className="text-headline-sm font-bold text-on-surface mb-3">{v.title}</h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
    </div>
  );
}
