import React, { useState } from 'react';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';
import LocationPicker from '../components/LocationPicker';

const PERF_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAINcFOmkmTGhufQE7dRDV-3CZe4js0lwaqvW4FbraXuBcvGsWfFBEjBp7RjP5ymFyr7wjZ3jGLedknAkx-UwBbKn0jZl0Oj3eDsQdMGhEo0gZSLUtVnM8SZNOBvBpT8kmIWolFImypjhBFD0NzA5ZwviHDNzSK8Wyu7ZpYl9CrQBUhXEJxlwRZC6onMFAdBdzSPU95t7G2DArlH4NZB07thweyJj7O2nWNrervlA_e_-joJLVV1LHfrdSFPYa3VVlDKemYrYmOADF3';

// Pricing:
//   Base = members × ₹1,000
//   Distance surcharge:
//     ≤ 5 km  → ₹0
//     > 5 km  → distance × ₹150  (e.g. 6km = ₹900, 7km = ₹1,050)
const calcPrice = (members, distance) => {
  const n = Math.max(Number(members) || 5, 5);
  const d = Math.max(Number(distance) || 0, 0);
  const base = 1000 * n;
  const surcharge = d > 5 ? Math.round(d * 150) : 0;
  return { base, surcharge, total: base + surcharge };
};

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  district: 'Dakshina Kannada',
  venueAddress: '',
  venueLocation: { lat: null, lng: null, placeId: '', formattedAddress: '' },
  distanceFromKateel: 0,
  eventType: 'Temple Festival',
  numberOfMembers: 5,
  eventDate: '',
  specialNotes: '',
};

export default function BookingPage() {
  const [step, setStep] = useState(1); // 1=form, 3=success
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const price = calcPrice(form.numberOfMembers, form.distanceFromKateel);

  // Location picker callback — updates address + distance together
  const handleLocationChange = (loc) => {
    setForm((prev) => ({
      ...prev,
      venueAddress: loc.address || prev.venueAddress,
      distanceFromKateel: loc.distance ?? prev.distanceFromKateel,
      venueLocation: {
        lat: loc.lat,
        lng: loc.lng,
        placeId: loc.placeId || '',
        formattedAddress: loc.address || '',
      },
    }));
  };

  const handleSendOTP = async () => {
    if (!form.phone || form.phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    try {
      const res = await bookingAPI.sendOTP(form.phone);
      setOtpSent(true);
      toast.success('OTP sent to your phone!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await bookingAPI.verifyOTP(form.phone, otp);
      setOtpVerified(true);
      toast.success('Phone verified!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error('Please verify your phone number first.');
      return;
    }
    if (!form.venueAddress) {
      toast.error('Please enter venue address.');
      return;
    }
    if (!form.eventDate) {
      toast.error('Please select event date.');
      return;
    }
    setLoading(true);
    try {
      await bookingAPI.create(form);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
    setForm(EMPTY_FORM);
  };

  // ── Success screen ──────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="container-max">
          <div className="max-w-2xl mx-auto card p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-luminous">
              <span className="material-symbols-outlined text-on-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-headline-md font-bold text-on-surface mb-4">Booking Request Received!</h2>
            <p className="text-body-lg text-on-surface-variant mb-4">
              Your booking request has been submitted successfully.
            </p>
            <p className="text-body-md text-on-surface-variant mb-8">
              <strong>Kiran Anchan</strong> will contact you at <strong>{form.phone}</strong> to finalize the details and confirm the slot.
            </p>
            <div className="bg-secondary-container rounded-xl p-6 mb-8 text-left space-y-2">
              <p className="text-label-lg font-semibold text-on-surface">Booking Summary</p>
              <p className="text-body-md text-on-surface-variant">Event: {form.eventType}</p>
              <p className="text-body-md text-on-surface-variant">Date: {new Date(form.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-body-md text-on-surface-variant">Venue: {form.venueAddress}</p>
              <p className="text-body-md text-on-surface-variant">Distance: {form.distanceFromKateel} km from Kateel Temple</p>
              <p className="text-body-md font-semibold text-primary">Estimated Total: ₹ {price.total.toLocaleString('en-IN')}</p>
            </div>
            <button onClick={handleReset} className="btn-primary rounded-full">
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────
  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-surface-container-lowest">
        <div className="container-max text-center">
          <span className="section-label">Book a Performance</span>
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold text-primary mb-4">Request a Performance</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Experience the rhythmic power of Kateel's finest Chende troupe at your special event.
          </p>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── Booking Form ── */}
            <div className="lg:col-span-7 card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Name + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-label-lg text-primary block mb-1">Full Name *</label>
                    <input
                      className="input-field"
                      placeholder="Your full name"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-label-lg text-primary block mb-1">Phone Number *</label>
                    <div className="flex gap-2 items-end">
                      <input
                        className="input-field flex-1"
                        placeholder="+91 00000 00000"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading || otpVerified}
                        className="px-4 py-2 bg-primary text-on-primary text-label-md rounded-lg hover:bg-on-primary-fixed-variant transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        {otpVerified ? '✓ Verified' : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  {/* OTP field */}
                  {otpSent && !otpVerified && (
                    <div className="md:col-span-2">
                      <label className="text-label-lg text-primary block mb-1">Enter OTP *</label>
                      <div className="flex gap-2 items-end">
                        <input
                          className="input-field flex-1 tracking-[0.4em] text-center font-bold text-headline-sm"
                          placeholder="• • • • • •"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={loading}
                          className="px-4 py-2 bg-tertiary text-on-tertiary text-label-md rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </div>
                      <p className="text-label-md text-on-surface-variant mt-1">
                        Didn't receive?{' '}
                        <button type="button" onClick={handleSendOTP} className="text-primary hover:underline">Resend OTP</button>
                      </p>
                    </div>
                  )}
                </div>

                {/* District + Event Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-label-lg text-primary block mb-1">District *</label>
                    <select className="input-field" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                      <option>Dakshina Kannada</option>
                      <option>Udupi</option>
                      <option>Kasargod</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-label-lg text-primary block mb-1">Event Type *</label>
                    <select className="input-field" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                      <option>Temple Festival</option>
                      <option>Wedding Ceremony</option>
                      <option>Corporate Event</option>
                      <option>Private Celebration</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                {/* Location Picker — Google Maps + current location + auto distance */}
                <LocationPicker
                  value={{
                    address: form.venueAddress,
                    lat: form.venueLocation?.lat,
                    lng: form.venueLocation?.lng,
                    distance: form.distanceFromKateel,
                  }}
                  onChange={handleLocationChange}
                />

                {/* Manual distance override (if no map) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-label-lg text-primary block mb-1">
                      Distance from Kateel (km)
                      {form.venueLocation?.lat && (
                        <span className="ml-2 text-label-md text-green-600 font-normal">Auto-calculated</span>
                      )}
                    </label>
                    <input
                      className="input-field"
                      type="number"
                      min="0"
                      value={form.distanceFromKateel}
                      onChange={(e) => setForm({ ...form, distanceFromKateel: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-label-lg text-primary block mb-1">Number of Members (Min 5) *</label>
                    <input
                      className="input-field"
                      type="number"
                      min="5"
                      value={form.numberOfMembers}
                      onChange={(e) => setForm({ ...form, numberOfMembers: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Event Date */}
                <div>
                  <label className="text-label-lg text-primary block mb-1">Event Date *</label>
                  <input
                    className="input-field"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    required
                  />
                </div>

                {/* Special Notes */}
                <div>
                  <label className="text-label-lg text-primary block mb-1">Special Notes / Requirements</label>
                  <textarea
                    className="input-field resize-none"
                    rows="3"
                    placeholder="Tell us more about the event flow, timing, special requirements..."
                    value={form.specialNotes}
                    onChange={(e) => setForm({ ...form, specialNotes: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !otpVerified}
                  className="w-full btn-primary justify-center py-4 rounded-lg disabled:opacity-60 text-body-md"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : 'Submit Booking Request'}
                </button>

                {!otpVerified && (
                  <p className="text-label-md text-on-surface-variant text-center flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Please verify your phone number before submitting.
                  </p>
                )}
              </form>
            </div>

            {/* ── Price Calculator ── */}
            <aside className="lg:col-span-5 space-y-6 sticky top-24">
              {/* Live estimate card */}
              <div className="bg-primary text-on-primary p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-headline-sm font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">calculate</span>
                    Live Price Estimate
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-on-primary/20">
                      <span className="text-label-lg opacity-80">Base (₹1,000 × {form.numberOfMembers} members)</span>
                      <span className="font-bold">₹ {price.base.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-on-primary/20">
                      <span className="text-label-lg opacity-80">
                        Distance ({form.distanceFromKateel} km)
                        {form.venueLocation?.lat && (
                          <span className="ml-1 text-[10px] bg-on-primary/20 px-1.5 py-0.5 rounded-full">GPS</span>
                        )}
                      </span>
                      <span className="font-bold">₹ {price.surcharge.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3">
                      <span className="text-headline-sm font-bold">Estimated Total</span>
                      <span className="text-headline-md font-bold">₹ {price.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <p className="mt-6 text-label-md italic opacity-70">
                    * Final price confirmed by Kiran Anchan after review.
                  </p>
                </div>
                {/* Disclaimer banner */}
                <div className="mt-4 flex items-start gap-3 bg-on-primary/10 border border-on-primary/20 rounded-xl p-4">
                  <span className="material-symbols-outlined text-tertiary-fixed flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  <div>
                    <p className="text-label-lg font-bold text-on-primary">This is an approximate estimate only.</p>
                    <p className="text-label-md text-on-primary/80 mt-1">
                      Actual bill may vary based on event duration, special requirements, and timing.
                      Contact us for <span className="font-semibold text-tertiary-fixed">discounts & final pricing</span>.
                    </p>
                    <a
                      href="tel:+919901933947"
                      className="mt-2 inline-flex items-center gap-1 text-label-md font-semibold text-tertiary-fixed hover:underline"
                    >
                      <span className="material-symbols-outlined text-sm">call</span>
                      +91 99019 33947
                    </a>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/5 rounded-full" />
              </div>

              {/* Pricing logic */}
              <div className="card p-6">
                <h3 className="text-primary font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  Pricing Logic
                </h3>
                <ul className="space-y-2 text-label-md text-on-surface-variant">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Base fee: ₹1,000 per member.</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Up to 5 km: No distance charge.</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Beyond 5 km: ₹150 × total distance km.</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Example: 6 km, 5 members = ₹5,000 + ₹900 = <strong className="text-primary">₹5,900</strong></li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Example: 10 km, 5 members = ₹5,000 + ₹1,500 = <strong className="text-primary">₹6,500</strong></li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Minimum 5 members required.</li>
                </ul>
              </div>

              {/* Performance image */}
              <div className="relative h-48 rounded-xl overflow-hidden ghost-border">
                <img src={PERF_IMG} alt="Performance" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                  <p className="text-on-primary text-label-lg font-semibold">Kateel Durgaparameshwari Temple</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
