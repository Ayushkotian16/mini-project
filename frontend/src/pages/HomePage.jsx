import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI, reviewAPI, contentAPI } from '../services/api';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY2gXvr5TLlT3ypR-fAnOnydCqElxAKTKQlBGdq1wK8sX-SwdhUrsynhG0uXs0AxpAM_gdQUnzbQsCnTqzCkWCEgVqSom0o0TKFu_Tl9NGXZ49PjS2dew3iIeaiELc19M7wbB-bkaqL_YQOSKsHHqROueFp4mzFQcMlF1byhnXbzi4hOvO3dGaiQM8gb87dO7A1hycCYHCAmv1x4OK34cObyPUypA33qOg4UW32k2kPk9SaHuvDv8kjtcXPAk6rjYrEHSnI3K_4PGv';
const DRUM_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzS7sIHFE6ZIHlKSjOEUq7g4tTgYzVUnAuxrChw1Z5CUJqXzj3XcTj8064IIPHpkzMsy7lU0Z4S9QjaT1NQLubdqOC1gWlnrXbOPrFCFAKnNOZbkZoAFTzwcBTD4MJDKMPAn9qNjKFNoIBaKw9QCyexRETnNzY9e4tl08wpKP1vyumgjJLxRJENOq3XGFWZdiZX6jBI7hhcfhbpDhxdYac41Mf795_LHaVpFalcq3x1aEBT-2XXSiGmosgld6S3qBEowG_jiUwllwt';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [content, setContent] = useState(null);

  useEffect(() => {
    // Fetch events marked showOnHome=true (approved bookings + admin-pinned)
    // Also fetch recent past events as fallback
    Promise.all([
      eventAPI.getAll({ showOnHome: 'true' }),
      eventAPI.getAll({ status: 'past' }),
    ]).then(([homeRes, pastRes]) => {
      const homeEvents = homeRes.data.events || [];
      const pastEvents = pastRes.data.events || [];
      // Merge: home-pinned first, then fill with past events (no duplicates), max 6
      const ids = new Set(homeEvents.map((e) => e._id));
      const merged = [...homeEvents, ...pastEvents.filter((e) => !ids.has(e._id))];
      setEvents(merged.slice(0, 6));
    }).catch(() => {});
    reviewAPI.getApproved().then((r) => setReviews(r.data.reviews.slice(0, 3))).catch(() => {});
    contentAPI.getAll().then((r) => setContent(r.data.content)).catch(() => {});
  }, []);

  const hero = content?.hero || {};
  const about = content?.about || {};
  const heritageImage = about.heritageImageUrl || DRUM_IMG;

  return (
    <>
      {/* Hero */}
      <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#9b0044 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container-max relative z-10 flex flex-col items-center text-center py-20">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/10 overflow-hidden mb-8">
            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="relative mb-8 w-full flex flex-col items-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] opacity-[0.03] pointer-events-none select-none">
              <img src={LOGO_URL} alt="" className="w-full h-full object-cover rounded-full animate-slow-spin" />
            </div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface z-10 leading-tight">
              {hero.title?.split(' ').slice(0, 1).join(' ') || 'Nandini'}{' '}
              <br />
              <span className="text-primary">{hero.title?.split(' ').slice(1).join(' ') || 'Chende Kateel'}</span>
            </h1>
          </div>
          <p className="text-body-lg text-on-surface-variant mb-10 max-w-2xl">
            {hero.description || 'Rhythm of Tradition, Beat of Excellence. Experience the majestic resonance of Kateel\'s finest percussion ensemble.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4 z-10">
            <Link to="/book" className="btn-primary">
              <span className="material-symbols-outlined">calendar_month</span>
              Book Us
            </Link>
            <Link to="/team" className="btn-outline">
              <span className="material-symbols-outlined">group</span>
              Meet the Team
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-surface-container-low border-y border-outline-variant">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <span className="block text-headline-md font-bold text-primary mb-2">{about.stats?.eventsCount || '2000+'}</span>
              <span className="text-label-lg text-on-surface-variant uppercase tracking-widest">Events Performed</span>
            </div>
            <div className="p-6 border-y md:border-y-0 md:border-x border-outline-variant">
              <span className="block text-headline-md font-bold text-primary mb-2">{about.stats?.foundedYear || 'Since 2010'}</span>
              <span className="text-label-lg text-on-surface-variant uppercase tracking-widest">Legacy of Rhythm</span>
            </div>
            <div className="p-6">
              <span className="block text-headline-md font-bold text-primary mb-2">{about.stats?.location || 'Kateel'}</span>
              <span className="text-label-lg text-on-surface-variant uppercase tracking-widest">Based in Karnataka</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Intro */}
      <section className="py-24 bg-surface-container-lowest overflow-hidden">
        <div className="container-max">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 relative flex justify-center">
              <div className="aspect-square w-full max-w-md rounded-full border-[3px] border-primary p-3">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img src={heritageImage} alt={about.heritageTitle || 'Our Heritage'} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-tertiary-fixed text-on-tertiary-fixed p-6 rounded-2xl shadow-luminous">
                <span className="material-symbols-outlined text-4xl">music_note</span>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <span className="section-label">{about.heritageLabel || 'Our Heritage'}</span>
              <h2 className="text-headline-md font-bold text-on-surface mb-6">
                {about.heritageTitle || 'Preserving the Percussive Art of Karnataka'}
              </h2>
              <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                {about.heritageDescription || about.description || 'Team Nandini Chende Kateel is more than just a musical group; we are the custodians of a rhythmic legacy. For over a decade, we have brought the thunderous energy of the Chende to festivals, temples, and corporate stages across India.'}
              </p>
              <Link to="/about" className="inline-flex items-center gap-2 text-primary font-semibold text-label-lg border-b-2 border-primary pb-1 hover:text-on-tertiary-fixed-variant transition-colors group">
                Learn More About Us
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Events */}
      {events.length > 0 && (
        <section className="py-24 bg-surface">
          <div className="container-max">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="section-label">Performances</span>
                <h2 className="text-headline-md font-bold text-on-surface">Recent Events</h2>
              </div>
              <Link to="/events" className="hidden md:flex items-center gap-2 text-primary font-semibold text-label-lg group">
                View All
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event._id} className="card overflow-hidden group hover:-translate-y-1 transition-transform">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-md">{event.category}</span>
                      <span className="text-label-md text-on-surface-variant">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-headline-sm font-bold text-on-surface mb-2">{event.title}</h3>
                    <p className="text-label-md text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link to="/events" className="btn-outline">View All Events</Link>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="py-24 bg-secondary-container">
          <div className="container-max">
            <div className="text-center mb-12">
              <span className="section-label">Testimonials</span>
              <h2 className="text-headline-md font-bold text-on-surface">What People Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="card p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-body-md text-on-surface-variant mb-6 leading-relaxed italic">"{review.message}"</p>
                  <div>
                    <p className="font-semibold text-on-surface">{review.name}</p>
                    {review.eventType && <p className="text-label-md text-on-surface-variant">{review.eventType}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-primary text-on-primary">
        <div className="container-max text-center">
          <h2 className="text-headline-md font-bold mb-4">Ready to Experience the Rhythm?</h2>
          <p className="text-body-lg opacity-80 mb-10 max-w-2xl mx-auto">
            Book Team Nandini Chende Kateel for your next event and create an unforgettable cultural experience.
          </p>
          <Link to="/book" className="inline-flex items-center gap-2 bg-on-primary text-primary px-8 py-4 rounded-full font-bold text-label-lg hover:bg-primary-fixed transition-all active:scale-95">
            <span className="material-symbols-outlined">calendar_month</span>
            Book Us Now
          </Link>
        </div>
      </section>
    </>
  );
}
