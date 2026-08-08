import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI, reviewAPI, contentAPI, bookingAPI } from '../services/api';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY2gXvr5TLlT3ypR-fAnOnydCqElxAKTKQlBGdq1wK8sX-SwdhUrsynhG0uXs0AxpAM_gdQUnzbQsCnTqzCkWCEgVqSom0o0TKFu_Tl9NGXZ49PjS2dew3iIeaiELc19M7wbB-bkaqL_YQOSKsHHqROueFp4mzFQcMlF1byhnXbzi4hOvO3dGaiQM8gb87dO7A1hycCYHCAmv1x4OK34cObyPUypA33qOg4UW32k2kPk9SaHuvDv8kjtcXPAk6rjYrEHSnI3K_4PGv';

// Countdown hook — returns { days, hours, minutes, seconds } until target date
function useCountdown(target) {
  const calc = () => {
    if (!target) return null;
    const diff = new Date(target) - new Date();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [target]);
  return time;
}

function OfferBanner({ offer }) {
  const countdown = useCountdown(offer.expiresAt);
  // Emojis that burst from corners
  const emojis = ['🎉','🥁','🎊','✨','🔥','💥','🎶','🏷️','⚡','🎁'];
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-yellow-400/60 group">
      {/* Animated emoji confetti */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {emojis.map((e, i) => (
          <span key={i} className="absolute text-2xl animate-bounce select-none"
            style={{
              left: `${(i % 5) * 22 + Math.random() * 5}%`,
              bottom: `${Math.random() * 30}%`,
              animationDelay: `${i * 0.18}s`,
              animationDuration: `${1.2 + (i % 3) * 0.4}s`,
              opacity: 0.85,
            }}>
            {e}
          </span>
        ))}
      </div>

      {/* Shimmer sweep */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute -top-1/2 -left-1/4 w-1/2 h-[200%] bg-white/10 rotate-12 animate-[shimmer_2.5s_infinite_linear]" />
      </div>

      {/* Background */}
      {offer.imageUrl ? (
        <div className="absolute inset-0">
          <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-tertiary" />
      )}

      <div className="relative z-30 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          {/* Discount badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-label-md font-black mb-3 animate-pulse shadow-lg shadow-yellow-400/50">
            🏷️ {offer.discountPercent}% OFF — LIMITED TIME!
          </div>
          <h3 className="text-headline-sm md:text-headline-md font-black text-white mb-1 drop-shadow-lg">{offer.title}</h3>
          {offer.subtitle && <p className="text-body-md text-white/90 mb-2 font-semibold">{offer.subtitle}</p>}
          {offer.urgencyText && (
            <p className="text-label-lg text-yellow-300 font-black flex items-center gap-1 animate-pulse">
              ⚡ {offer.urgencyText} ⚡
            </p>
          )}
          {countdown && (
            <div className="flex gap-3 mt-3">
              {[{ v: countdown.days, l: 'Days' }, { v: countdown.hours, l: 'Hrs' }, { v: countdown.minutes, l: 'Min' }, { v: countdown.seconds, l: 'Sec' }].map(({ v, l }) => (
                <div key={l} className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 text-center min-w-[48px] border border-yellow-400/40">
                  <span className="block text-headline-sm font-black text-yellow-300 leading-none">{String(v).padStart(2, '0')}</span>
                  <span className="block text-label-md text-white/70">{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <Link to={`/book?offerId=${offer.id}`}
          className="flex-shrink-0 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-label-lg px-8 py-4 rounded-full shadow-2xl shadow-yellow-400/40 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap border-2 border-yellow-300 animate-pulse">
          🎉 Book Now & Save!
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [content, setContent] = useState(null);
  const [activeOffers, setActiveOffers] = useState([]);

  useEffect(() => {
    Promise.all([
      eventAPI.getAll({ showOnHome: 'true' }),
      eventAPI.getAll({ status: 'past' }),
    ]).then(([homeRes, pastRes]) => {
      const homeEvents = homeRes.data.events || [];
      const pastEvents = pastRes.data.events || [];
      const ids = new Set(homeEvents.map((e) => e._id));
      const merged = [...homeEvents, ...pastEvents.filter((e) => !ids.has(e._id))];
      setEvents(merged.slice(0, 6));
    }).catch(() => {});

    reviewAPI.getApproved().then((r) => setReviews(r.data.reviews.slice(0, 3))).catch(() => {});
    contentAPI.getAll().then((r) => setContent(r.data.content)).catch(() => {});

    bookingAPI.getPricing().then((r) => {
      setActiveOffers(r.data.activeOffers || []);
    }).catch(() => {});
  }, []);

  const hero = content?.hero || {};
  const about = content?.about || {};

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
            {hero.description || "Rhythm of Tradition, Beat of Excellence. Experience the majestic resonance of Kateel's finest percussion ensemble."}
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

      {/* ── Active Offer Banners ── */}
      {activeOffers.length > 0 && (
        <section className="py-16 bg-surface-container-low">
          <div className="container-max">
            <div className="mb-8 text-center">
              <span className="section-label">Special Offers</span>
              <h2 className="text-headline-md font-bold text-on-surface">Book Now & Save Big</h2>
            </div>
            <div className="space-y-6">
              {activeOffers.map((offer) => (
                <OfferBanner key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* About Intro — heritage section WITHOUT image */}
      <section className="py-24 bg-surface-container-lowest overflow-hidden">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
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
                View All <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
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
