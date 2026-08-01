import React, { useEffect, useState } from 'react';
import { eventAPI } from '../services/api';

const TABS = ['upcoming', 'past'];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    eventAPI.getAll({ status: activeTab })
      .then((r) => setEvents(r.data.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <>
      <section className="py-16 bg-surface-container-lowest">
        <div className="container-max text-center">
          <span className="section-label">Our Journey</span>
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-4">Events & Performances</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            From sacred temple festivals to grand corporate stages — every performance is a celebration of rhythm.
          </p>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="container-max">
          {/* Tabs */}
          <div className="flex gap-3 mb-10">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-label-lg font-semibold transition-all capitalize ${
                  activeTab === tab ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container hover:bg-outline-variant'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block">event_busy</span>
              <p className="text-body-lg">No {activeTab} events found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event._id} className="card overflow-hidden group hover:-translate-y-1 transition-transform">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-md">{event.category}</span>
                    </div>
                    <h3 className="text-headline-sm font-bold text-on-surface mb-2">{event.title}</h3>
                    {event.description && <p className="text-body-md text-on-surface-variant mb-3 line-clamp-2">{event.description}</p>}
                    <div className="flex flex-wrap gap-4 text-label-md text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
                        {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                        {event.location}
                      </span>
                      {event.membersCount > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary text-sm">group</span>
                          {event.membersCount} Performers
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
