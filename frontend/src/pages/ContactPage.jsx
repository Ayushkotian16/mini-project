import React, { useState, useEffect } from 'react';
import { contactAPI, reviewAPI, contentAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [reviewForm, setReviewForm] = useState({ name: '', message: '', rating: 5, eventType: '' });
  const [submittingContact, setSubmittingContact] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    address: 'Kateel Temple Road, Kateel, Mangalore, Karnataka - 574148',
    phone: '+91 99019 33947',
    email: 'nandini.chende@gmail.com',
  });

  useEffect(() => {
    contentAPI.getSection('contact_info').then((r) => {
      if (r.data.data) setContactInfo(r.data.data);
    }).catch(() => {});
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmittingContact(true);
    try {
      await contactAPI.submit(contactForm);
      toast.success('Message sent! We will get back to you soon.');
      setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewAPI.submit(reviewForm);
      toast.success('Thank you for your review! It will appear after approval.');
      setReviewForm({ name: '', message: '', rating: 5, eventType: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <section className="py-16 bg-surface-container-lowest">
        <div className="container-max text-center">
          <span className="section-label">Get in Touch</span>
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-4">Contact Us</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Have a question or want to book us? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-7 card p-8">
              <h2 className="text-headline-sm font-bold text-on-surface mb-6">Send a Message</h2>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Name *</label>
                    <input className="input-field" placeholder="Your name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Email *</label>
                    <input className="input-field" type="email" placeholder="your@email.com" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Phone</label>
                    <input className="input-field" type="tel" placeholder="+91 00000 00000" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Subject *</label>
                    <input className="input-field" placeholder="How can we help?" value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="text-label-lg text-on-surface-variant block mb-1">Message *</label>
                  <textarea className="input-field resize-none" rows="5" placeholder="Your message..." value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required />
                </div>
                <button type="submit" disabled={submittingContact} className="w-full btn-primary justify-center py-4 rounded-lg disabled:opacity-60">
                  {submittingContact ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info + Review Form */}
            <div className="lg:col-span-5 space-y-8">
              <div className="card p-8">
                <h3 className="text-headline-sm font-bold text-on-surface mb-6">Contact Information</h3>
                <div className="space-y-5">
                  {[
                    { icon: 'location_on', text: contactInfo.address, href: null },
                    { icon: 'call', text: contactInfo.phone, href: contactInfo.phone ? `tel:${contactInfo.phone.replace(/\s/g,'')}` : null },
                    { icon: 'mail', text: contactInfo.email, href: contactInfo.email ? `mailto:${contactInfo.email}` : null },
                  ].filter(i => i.text).map((item) => (
                    <div key={item.icon} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">{item.icon}</span>
                      </div>
                      {item.href ? (
                        <a href={item.href} className="text-body-md text-on-surface-variant hover:text-primary transition-colors whitespace-pre-line self-center">{item.text}</a>
                      ) : (
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line self-center">{item.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Form */}
              <div id="review-form" className="card p-8">
                <h3 className="text-headline-sm font-bold text-on-surface mb-6">Leave a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Your Name *</label>
                    <input className="input-field" placeholder="Name" value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Rating *</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="text-2xl transition-transform hover:scale-110">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${star <= reviewForm.rating ? 1 : 0}`, color: star <= reviewForm.rating ? '#9b0044' : '#e1bec4' }}>star</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Event Type</label>
                    <input className="input-field" placeholder="e.g. Temple Festival" value={reviewForm.eventType} onChange={(e) => setReviewForm({ ...reviewForm, eventType: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-label-lg text-on-surface-variant block mb-1">Your Review *</label>
                    <textarea className="input-field resize-none" rows="3" placeholder="Share your experience..." value={reviewForm.message} onChange={(e) => setReviewForm({ ...reviewForm, message: e.target.value })} required maxLength={500} />
                  </div>
                  <button type="submit" disabled={submittingReview} className="w-full btn-primary justify-center py-3 rounded-lg disabled:opacity-60">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
