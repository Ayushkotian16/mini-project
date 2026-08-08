import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookingAPI, contentAPI, paymentAPI } from '../services/api';
import toast from 'react-hot-toast';
import LocationPicker from '../components/LocationPicker';

// Default packages — overridden by backend data
const DEFAULT_PACKAGES = [
  { members: 6,  label: '6 Members',  fakeMultiplier: 1.20, enabled: true },
  { members: 8,  label: '8 Members',  fakeMultiplier: 1.18, enabled: true },
  { members: 12, label: '12 Members', fakeMultiplier: 1.15, enabled: true },
  { members: 15, label: '15 Members', fakeMultiplier: 1.15, enabled: true },
  { members: 18, label: '18 Members', fakeMultiplier: 1.12, enabled: true },
  { members: 21, label: '21 Members', fakeMultiplier: 1.12, enabled: true },
  { members: 24, label: '24 Members', fakeMultiplier: 1.10, enabled: true },
  { members: 30, label: '30 Members', fakeMultiplier: 1.10, enabled: true },
];

const calcPrice = (members, distance, ppm = 1000, spm = 150, freeKm = 5, discPct = 0) => {
  const n = Math.max(Number(members) || 5, 5);
  const d = Math.max(Number(distance) || 0, 0);
  const base = ppm * n;
  const surcharge = d > freeKm ? Math.round(d * spm) : 0;
  const subtotal = base + surcharge;
  const discountAmt = Math.round(subtotal * discPct / 100);
  return { base, surcharge, subtotal, discountAmt, total: subtotal - discountAmt };
};

// Charm pricing — makes 6000 → 5999, 7500 → 7499 etc.
const charm = (n) => Math.max(0, Math.floor(Number(n)) - 1);

// Get applicable offers for a member count
const getApplicableOffers = (offers, members) =>
  offers.filter((o) => !o.appliesTo || o.appliesTo === 'all' || (o.appliesTo || '').split(',').map(Number).includes(Number(members)));

const getBestDiscount = (offers, members) => {
  const applicable = getApplicableOffers(offers, members);
  if (!applicable.length) return 0;
  return Math.max(...applicable.map((o) => Number(o.discountPercent) || 0));
};

const EMPTY_FORM = {
  fullName: '', phone: '', district: 'Dakshina Kannada', venueAddress: '',
  venueLocation: { lat: null, lng: null, placeId: '', formattedAddress: '' },
  distanceFromKateel: 0, eventType: 'Temple Festival',
  numberOfMembers: 6, eventDate: '', specialNotes: '',
};

// Flash overlay shown on first visit when offers with real discount are active
function OfferFlash({ offers, onDismiss }) {
  const realOffers = offers.filter((o) => Number(o.discountPercent) > 0);
  if (!realOffers.length) return null;
  const best = realOffers[0];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-tertiary text-on-primary rounded-3xl shadow-2xl max-w-md w-full p-8 text-center overflow-hidden">
        {/* Sparkle rings */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 w-16 h-16 border-2 border-yellow-300/30 rounded-full animate-ping" />
          <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-yellow-300/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>
        {best.imageUrl && (
          <img src={best.imageUrl} alt={best.title} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
        )}
        <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-label-lg font-black mb-3 animate-bounce">
          🎉 {best.discountPercent}% OFF — Limited Offer!
        </div>
        <h2 className="text-headline-sm font-black mb-2">{best.title}</h2>
        {best.subtitle && <p className="text-body-md opacity-80 mb-3">{best.subtitle}</p>}
        {best.urgencyText && <p className="text-label-lg text-yellow-300 font-bold mb-6">⚡ {best.urgencyText}</p>}
        <button onClick={() => onDismiss(best.id)}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-label-lg py-4 rounded-full shadow-lg active:scale-95 transition-all">
          Book Now & Claim Offer →
        </button>
        <button onClick={() => onDismiss(null)} className="mt-3 text-label-md text-on-primary/60 hover:text-on-primary transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  );
}

// Single package card — shows available offers as info, applies selected offer discount
function PackageCard({ pkg, pricingSettings, activeOffers, onSelect, isSelected, selectedOffer }) {
  const disc = selectedOffer && Number(selectedOffer.discountPercent) > 0 ? Number(selectedOffer.discountPercent) : 0;
  const p = calcPrice(pkg.members, 0, pricingSettings.pricePerMember, pricingSettings.distanceSurchargePerKm, pricingSettings.freeDistanceKm, disc);
  const fakeOriginal = Math.ceil(calcPrice(pkg.members, 0, pricingSettings.pricePerMember, pricingSettings.distanceSurchargePerKm, pricingSettings.freeDistanceKm, 0).subtotal * pkg.fakeMultiplier / 100) * 100;
  const displayTotal = charm(p.total);
  const savings = fakeOriginal - displayTotal;
  const savingsPct = Math.round((savings / fakeOriginal) * 100);
  const realOffers = activeOffers.filter((o) => Number(o.discountPercent) > 0);

  return (
    <div
      onClick={() => onSelect(pkg.members)}
      className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all select-none group
        ${isSelected ? 'border-primary bg-secondary-container shadow-lg scale-[1.02]' : 'border-outline-variant bg-surface hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5'}`}
    >
      {/* Savings badge */}
      <div className="absolute -top-3 -right-3 bg-green-500 text-white text-label-md font-black px-3 py-1 rounded-full shadow">
        {savingsPct}% off
      </div>

      {/* Offer info tags — shows available offers, not applied */}
      {realOffers.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {realOffers.slice(0, 2).map((o) => (
            <span key={o.id} className="inline-flex items-center gap-1 bg-yellow-400/20 border border-yellow-400 text-yellow-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
              🏷 {o.title} — {o.discountPercent}% OFF available
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary text-on-primary' : 'bg-secondary-container text-primary'}`}>
          <span className="material-symbols-outlined text-sm">group</span>
        </div>
        <div>
          <p className="font-bold text-on-surface text-label-lg">{pkg.label}</p>
          <p className="text-label-md text-on-surface-variant">+ Distance charges apply</p>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-label-md text-on-surface-variant line-through">₹{fakeOriginal.toLocaleString('en-IN')}</p>
          <p className="text-headline-sm font-black text-primary">₹{displayTotal.toLocaleString('en-IN')}</p>
          {disc > 0 ? (
            <p className="text-label-md text-green-600 font-bold">🎉 {disc}% OFF — Save ₹{savings.toLocaleString('en-IN')}</p>
          ) : (
            <p className="text-label-md text-green-600 font-semibold">Save ₹{savings.toLocaleString('en-IN')}</p>
          )}
        </div>
        <div className={`px-4 py-2 rounded-full text-label-md font-bold transition-all ${isSelected ? 'bg-primary text-on-primary' : 'bg-secondary-container text-primary group-hover:bg-primary group-hover:text-on-primary'}`}>
          {isSelected ? '✓ Selected' : 'Book Now'}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isCustom, setIsCustom] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState(null);
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [selectedOfferId, setSelectedOfferId] = useState(null); // null = no offer selected
  const formRef = useRef(null);

  const [pricingSettings, setPricingSettings] = useState({ pricePerMember: 1000, distanceSurchargePerKm: 150, freeDistanceKm: 5 });
  const [activeOffers, setActiveOffers] = useState([]);
  const [owner, setOwner] = useState({ name: 'Kiran Anchan', phone1: '', phone2: '' });
  const [paymentConfig, setPaymentConfig] = useState({ enabled: false, advancePercent: 20 });
  const [otpRequired, setOtpRequired] = useState(true);

  useEffect(() => {
    // Read offerId from URL (e.g. /book?offerId=ganesh123)
    const urlOfferId = searchParams.get('offerId');
    if (urlOfferId) setSelectedOfferId(urlOfferId);

    bookingAPI.getPricing().then((r) => {
      setPricingSettings(r.data.pricing || {});
      setActiveOffers(r.data.activeOffers || []);
      setOwner(r.data.owner || { name: 'Kiran Anchan', phone1: '', phone2: '' });
      setOtpRequired(r.data.otpRequired !== false);
      // Only show flash if no offer was pre-selected via URL and real discount offers exist
      if (!urlOfferId) {
        const realOffers = (r.data.activeOffers || []).filter((o) => Number(o.discountPercent) > 0);
        const seen = sessionStorage.getItem('offerFlashSeen');
        if (!seen && realOffers.length > 0) {
          setShowFlash(true);
          sessionStorage.setItem('offerFlashSeen', '1');
        }
      }
    }).catch(() => {});
    contentAPI.getSection('packages').then((r) => {
      const items = r.data.data?.items;
      if (items && items.length > 0) setPackages(items);
    }).catch(() => {});
    paymentAPI.getConfig().then((r) => {
      // Merge advancePaymentEnabled from pricing into paymentConfig
      bookingAPI.getPricing().then((pr) => {
        setPaymentConfig({
          ...r.data,
          enabled: r.data.enabled && pr.data.advancePaymentEnabled !== false,
        });
      }).catch(() => setPaymentConfig(r.data));
    }).catch(() => {});
  }, []);

  // Only apply the selected offer's discount; if none selected, no discount
  const selectedOffer = selectedOfferId ? activeOffers.find((o) => o.id === selectedOfferId) : null;
  const bestDiscount = selectedOffer && Number(selectedOffer.discountPercent) > 0
    ? Number(selectedOffer.discountPercent) : 0;
  const price = calcPrice(form.numberOfMembers, form.distanceFromKateel,
    pricingSettings.pricePerMember, pricingSettings.distanceSurchargePerKm,
    pricingSettings.freeDistanceKm, bestDiscount);

  const selectPackage = (members) => {
    setIsCustom(false);
    setForm((f) => ({ ...f, numberOfMembers: members }));
    setStep(2);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const selectCustom = () => {
    setIsCustom(true);
    setForm((f) => ({ ...f, numberOfMembers: 5 }));
    setStep(2);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const [dateAvailable, setDateAvailable] = useState(true);
  const [dateConflictMsg, setDateConflictMsg] = useState('');

  const handleDateChange = async (e) => {
    const d = e.target.value;
    setForm((prev) => ({ ...prev, eventDate: d }));
    if (!d) return;
    try {
      const res = await bookingAPI.checkAvailability(d);
      if (!res.data.available) {
        const c = res.data.conflicts[0];
        const t = new Date(c.eventDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        setDateAvailable(false);
        setDateConflictMsg(`Slot near ${t} is already booked. Please choose a date/time at least 6 hours away.`);
      } else {
        setDateAvailable(true);
        setDateConflictMsg('');
      }
    } catch { setDateAvailable(true); setDateConflictMsg(''); }
  };

  const handleLocationChange = (loc) => {
    setForm((prev) => ({
      ...prev,
      venueAddress: loc.address || prev.venueAddress,
      distanceFromKateel: loc.distance ?? prev.distanceFromKateel,
      venueLocation: { lat: loc.lat, lng: loc.lng, placeId: loc.placeId || '', formattedAddress: loc.address || '' },
    }));
  };

  const handleSendOTP = async () => {
    if (!form.phone || form.phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit phone number.'); return;
    }
    setLoading(true);
    try {
      await bookingAPI.sendOTP(form.phone);
      setOtpSent(true);
      toast.success('OTP sent to your phone!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) { toast.error('Please enter the 6-digit OTP.'); return; }
    setLoading(true);
    try {
      await bookingAPI.verifyOTP(form.phone, otp);
      setOtpVerified(true);
      toast.success('Phone verified!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otpRequired && !otpVerified) { toast.error('Please verify your phone number first.'); return; }
    if (!form.venueAddress) { toast.error('Please enter venue address.'); return; }
    if (!form.eventDate) { toast.error('Please select event date.'); return; }
    if (!dateAvailable) { toast.error('Selected date is not available. Please choose another date.'); return; }
    setLoading(true);
    try {
      const res = await bookingAPI.create({ ...form, selectedOfferId: selectedOfferId || null });
      const bookingId = res.data.booking._id;
      setSubmittedBookingId(bookingId);
      // If Razorpay is configured, go to payment step; else go to success
      if (paymentConfig.enabled) {
        setStep(3);
      } else {
        setStep(4);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking.');
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setStep(1); setOtpSent(false); setOtpVerified(false);
    setOtp(''); setForm(EMPTY_FORM); setIsCustom(false);
    setSubmittedBookingId(null); setSelectedOfferId(null);
    setSearchParams({});
  };

  // ── Razorpay payment handler ──
  const handlePayNow = async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.createOrder(submittedBookingId);
      const { orderId, amount, advanceAmount, customerName, customerPhone, keyId } = res.data;

      const options = {
        key: paymentConfig.keyId || keyId,
        amount,
        currency: 'INR',
        name: 'Team Nandini Chende Kateel',
        description: `Advance booking payment (${paymentConfig.advancePercent}%)`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: submittedBookingId,
            });
            toast.success('Payment successful! Booking confirmed.');
            setStep(4);
          } catch {
            toast.error('Payment verification failed. Please contact us.');
          }
        },
        prefill: { name: customerName, contact: customerPhone },
        theme: { color: '#9b0044' },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  // ── Payment screen (step 3) ──
  if (step === 3) {
    const advanceAmt = Math.round(charm(price.total) * paymentConfig.advancePercent / 100);
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="container-max">
          <div className="max-w-xl mx-auto card p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-primary text-4xl">payments</span>
            </div>
            <h2 className="text-headline-md font-bold text-on-surface mb-2">Booking Request Received!</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              {owner.name} will confirm your slot. Pay a small advance now to secure your booking.
            </p>
            <div className="bg-secondary-container rounded-2xl p-6 mb-6 text-left space-y-2">
              <div className="flex justify-between text-label-md">
                <span className="text-on-surface-variant">Estimated Total</span>
                <span className="font-semibold">₹{price.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-label-md">
                <span className="text-on-surface-variant">Advance to pay ({paymentConfig.advancePercent}%)</span>
                <span className="font-black text-primary text-body-lg">₹{advanceAmt.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-label-md">
                <span className="text-on-surface-variant">Balance (pay on event day)</span>
                <span className="font-semibold">₹{(price.total - advanceAmt).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button onClick={handlePayNow} disabled={loading}
              className="w-full btn-primary justify-center py-4 rounded-full text-body-md mb-3 disabled:opacity-60">
              {loading ? <span className="flex items-center gap-2 justify-center"><div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />Processing...</span>
                : `Pay Advance ₹${advanceAmt.toLocaleString('en-IN')} →`}
            </button>
            <button onClick={() => setStep(4)} className="text-label-md text-on-surface-variant hover:text-primary transition-colors">
              Skip payment — I'll pay later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success screen (step 4) ──
  if (step === 4) {
    const fakeOrig = Math.ceil(price.subtotal * 1.15 / 100) * 100;
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="container-max">
          <div className="max-w-2xl mx-auto card p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-luminous">
              <span className="material-symbols-outlined text-on-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-headline-md font-bold text-on-surface mb-4">Booking Request Received!</h2>
            <p className="text-body-lg text-on-surface-variant mb-4">Your booking request has been submitted successfully.</p>
            <p className="text-body-md text-on-surface-variant mb-8">
              <strong>{owner.name}</strong> will contact you at <strong>{form.phone}</strong> to finalize the details.
              {owner.phone1 && <> Reach us at <strong>{owner.phone1}</strong>{owner.phone2 && <> or <strong>{owner.phone2}</strong></>}.</>}
            </p>
            <div className="bg-secondary-container rounded-xl p-6 mb-8 text-left space-y-2">
              <p className="text-label-lg font-semibold text-on-surface">Booking Summary</p>
              <p className="text-body-md text-on-surface-variant">Event: {form.eventType}</p>
              <p className="text-body-md text-on-surface-variant">Date: {new Date(form.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-body-md text-on-surface-variant">Venue: {form.venueAddress}</p>
              <p className="text-body-md text-on-surface-variant">Members: {form.numberOfMembers} | Distance: {form.distanceFromKateel} km</p>
              {bestDiscount > 0 && <p className="text-body-md text-green-600 font-semibold">🎉 {bestDiscount}% OFF Applied — Saved ₹{price.discountAmt.toLocaleString('en-IN')}</p>}
              <p className="text-body-md text-on-surface-variant line-through">Original: ₹{fakeOrig.toLocaleString('en-IN')}</p>
              <p className="text-headline-sm font-black text-primary">You Pay: ₹{charm(price.total).toLocaleString('en-IN')}</p>
              <p className="text-label-md text-on-surface-variant italic">* Approximate estimate. Negotiate with {owner.name}.</p>
            </div>
            <button onClick={handleReset} className="btn-primary rounded-full">Submit Another Request</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <>
      {showFlash && <OfferFlash offers={activeOffers} onDismiss={(offerId) => {
        setShowFlash(false);
        if (offerId) setSelectedOfferId(offerId);
      }} />}

      {/* Hero */}
      <section className="py-16 bg-surface-container-lowest">
        <div className="container-max text-center">
          <span className="section-label">Book a Performance</span>
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold text-primary mb-2">Request a Performance</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-4">
            Experience the rhythmic power of Kateel's finest Chende troupe at your special event.
          </p>
          {activeOffers.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-label-lg font-black animate-bounce">
              🎉 Special Offer Active — Up to {Math.max(...activeOffers.map((o) => o.discountPercent))}% OFF!
            </div>
          )}
        </div>
      </section>

      {/* ── Package Cards ── */}
      <section className="py-12 bg-surface">
        <div className="container-max">
          <div className="text-center mb-8">
            <span className="section-label">Choose Your Package</span>
            <h2 className="text-headline-md font-bold text-on-surface">
              Starting from ₹{charm(calcPrice(6, 0, pricingSettings.pricePerMember, pricingSettings.distanceSurchargePerKm, pricingSettings.freeDistanceKm, bestDiscount).total).toLocaleString('en-IN')} only
            </h2>
            <p className="text-body-md text-on-surface-variant mt-1">All prices are base rate. Distance charges added at checkout.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {packages.filter((pkg) => pkg.enabled !== false).map((pkg) => (
              <PackageCard
                key={pkg.members}
                pkg={pkg}
                pricingSettings={pricingSettings}
                activeOffers={activeOffers}
                selectedOffer={selectedOffer}
                onSelect={selectPackage}
                isSelected={!isCustom && step === 2 && form.numberOfMembers === pkg.members}
              />
            ))}
          </div>
          {/* Custom option */}
          <div
            onClick={selectCustom}
            className={`cursor-pointer rounded-2xl border-2 p-5 flex items-center justify-between transition-all
              ${isCustom && step === 2 ? 'border-primary bg-secondary-container shadow-lg' : 'border-outline-variant bg-surface hover:border-primary/50 hover:shadow-md'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined">tune</span>
              </div>
              <div>
                <p className="font-bold text-on-surface text-label-lg">Custom Package</p>
                <p className="text-label-md text-on-surface-variant">Choose any number of members — we'll calculate the price for you</p>
              </div>
            </div>
            <div className={`px-5 py-2 rounded-full text-label-md font-bold ${isCustom && step === 2 ? 'bg-primary text-on-primary' : 'bg-secondary-container text-primary'}`}>
              {isCustom && step === 2 ? '✓ Selected' : 'Customize →'}
            </div>
          </div>
        </div>
      </section>

      {/* ── Booking Form (slides in after selecting a package) ── */}
      {step === 2 && (
        <section ref={formRef} className="py-12 bg-surface-container-low border-t border-outline-variant">
          <div className="container-max">
            {/* Selected package summary bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8 p-4 bg-secondary-container rounded-2xl border border-outline-variant">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-semibold text-on-surface">
                  {isCustom ? 'Custom Package' : `${form.numberOfMembers} Members Package`} selected
                </span>
                {bestDiscount > 0 && (
                  <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-label-md font-bold flex items-center gap-1">
                    🏷 {selectedOffer?.title} — {bestDiscount}% OFF Applied!
                    <button type="button" onClick={() => setSelectedOfferId(null)} className="ml-1 text-white/70 hover:text-white">✕</button>
                  </span>
                )}
                {!selectedOfferId && activeOffers.filter(o => Number(o.discountPercent) > 0).length > 0 && (
                  <span className="text-label-md text-on-surface-variant flex items-center gap-1">
                    🏷 Offers available — click an offer banner on the home page to apply
                  </span>
                )}
              </div>
              <button onClick={() => setStep(1)} className="text-label-md text-primary font-semibold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_back</span>Change Package
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ── Form ── */}
              <div className="lg:col-span-7 card p-8">
                <h3 className="text-headline-sm font-bold text-on-surface mb-6">Your Details</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-label-lg text-primary block mb-1">Full Name *</label>
                      <input className="input-field" placeholder="Your full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-label-lg text-primary block mb-1">Phone Number *</label>
                      <div className="flex gap-2 items-end">
                        <input className="input-field flex-1" placeholder="+91 00000 00000" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                        {otpRequired && (
                          <button type="button" onClick={handleSendOTP} disabled={loading || otpVerified}
                            className="px-4 py-2 bg-primary text-on-primary text-label-md rounded-lg hover:bg-on-primary-fixed-variant transition-all disabled:opacity-50 whitespace-nowrap">
                            {otpVerified ? '✓ Verified' : 'Send OTP'}
                          </button>
                        )}
                      </div>
                    </div>
                    {otpRequired && otpSent && !otpVerified && (
                      <div className="md:col-span-2">
                        <label className="text-label-lg text-primary block mb-1">Enter OTP *</label>
                        <div className="flex gap-2 items-end">
                          <input className="input-field flex-1 tracking-[0.4em] text-center font-bold text-headline-sm" placeholder="• • • • • •" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
                          <button type="button" onClick={handleVerifyOTP} disabled={loading} className="px-4 py-2 bg-tertiary text-on-tertiary text-label-md rounded-lg hover:opacity-90 transition-all disabled:opacity-50">Verify</button>
                        </div>
                        <p className="text-label-md text-on-surface-variant mt-1">
                          Didn't receive? <button type="button" onClick={handleSendOTP} className="text-primary hover:underline">Resend OTP</button>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-label-lg text-primary block mb-1">District *</label>
                      <select className="input-field" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                        <option>Dakshina Kannada</option><option>Udupi</option><option>Kasargod</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-label-lg text-primary block mb-1">Event Type *</label>
                      <select className="input-field" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                        <option>Temple Festival</option><option>Wedding Ceremony</option><option>Corporate Event</option><option>Private Celebration</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  {isCustom && (
                    <div>
                      <label className="text-label-lg text-primary block mb-1">Number of Members (Min 5) *</label>
                      <input className="input-field" type="number" min="5" value={form.numberOfMembers} onChange={(e) => setForm({ ...form, numberOfMembers: e.target.value })} required />
                    </div>
                  )}
                  <LocationPicker value={{ address: form.venueAddress, lat: form.venueLocation?.lat, lng: form.venueLocation?.lng, distance: form.distanceFromKateel }} onChange={handleLocationChange} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-label-lg text-primary block mb-1">
                        Distance from Kateel (km)
                        {form.venueLocation?.lat && <span className="ml-2 text-label-md text-green-600 font-normal">Auto-calculated</span>}
                      </label>
                      <input className="input-field" type="number" min="0" value={form.distanceFromKateel} onChange={(e) => setForm({ ...form, distanceFromKateel: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-label-lg text-primary block mb-1">Event Date *</label>
                      <input className={`input-field ${!dateAvailable ? 'border-red-500 ring-1 ring-red-500' : ''}`} type="date" min={new Date().toISOString().split('T')[0]} value={form.eventDate} onChange={handleDateChange} required />
                      {!dateAvailable && (
                        <p className="text-label-md text-red-600 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">warning</span>{dateConflictMsg}
                        </p>
                      )}
                      {dateAvailable && form.eventDate && (
                        <p className="text-label-md text-green-600 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>Date is available!
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-label-lg text-primary block mb-1">Special Notes / Requirements</label>
                    <textarea className="input-field resize-none" rows="3" placeholder="Tell us more about the event..." value={form.specialNotes} onChange={(e) => setForm({ ...form, specialNotes: e.target.value })} />
                  </div>
                  <button type="submit" disabled={loading || (otpRequired && !otpVerified)}
                    className="w-full btn-primary justify-center py-4 rounded-lg disabled:opacity-60 text-body-md">
                    {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />Submitting...</span> : 'Submit Booking Request'}
                  </button>
                  {otpRequired && !otpVerified && <p className="text-label-md text-on-surface-variant text-center flex items-center justify-center gap-1"><span className="material-symbols-outlined text-sm">info</span>Please verify your phone number before submitting.</p>}
                </form>
              </div>

              {/* ── Price Summary Sidebar ── */}
              <aside className="lg:col-span-5 space-y-6 sticky top-24">
                <div className="bg-primary text-on-primary p-8 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-headline-sm font-bold mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined">calculate</span>Live Price Estimate
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-on-primary/20">
                        <span className="text-label-lg opacity-80">Base (₹{pricingSettings.pricePerMember?.toLocaleString('en-IN')} × {form.numberOfMembers} members)</span>
                        <span className="font-bold">₹{price.base.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-on-primary/20">
                        <span className="text-label-lg opacity-80">Distance ({form.distanceFromKateel} km){form.venueLocation?.lat && <span className="ml-1 text-[10px] bg-on-primary/20 px-1.5 py-0.5 rounded-full">GPS</span>}</span>
                        <span className="font-bold">₹{price.surcharge.toLocaleString('en-IN')}</span>
                      </div>
                      {bestDiscount > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-on-primary/20">
                          <span className="text-label-lg opacity-80 flex items-center gap-1">
                            <span className="material-symbols-outlined text-yellow-300 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_offer</span>
                            Offer Discount ({bestDiscount}%)
                          </span>
                          <span className="font-bold text-yellow-300">-₹{price.discountAmt.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3">
                        <span className="text-headline-sm font-bold">{bestDiscount > 0 ? 'You Pay' : 'Estimated Total'}</span>
                        <div className="text-right">
                          {bestDiscount > 0 && <span className="block text-label-md opacity-60 line-through">₹{price.subtotal.toLocaleString('en-IN')}</span>}
                          <span className="text-headline-md font-bold">₹{charm(price.total).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                    {selectedOffer && Number(selectedOffer.discountPercent) > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 bg-on-primary/15 rounded-lg px-3 py-2">
                          <span className="material-symbols-outlined text-yellow-300 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_offer</span>
                          <span className="text-label-md text-white font-semibold">{selectedOffer.title} — {selectedOffer.discountPercent}% OFF</span>
                        </div>
                      </div>
                    )}
                    {!selectedOfferId && activeOffers.filter(o => Number(o.discountPercent) > 0).length > 0 && (
                      <div className="mt-4 bg-on-primary/10 rounded-lg px-3 py-2">
                        <p className="text-label-md text-white/70">💡 {activeOffers.filter(o => Number(o.discountPercent) > 0).length} offer(s) available — go to home page and click an offer banner to apply discount</p>
                      </div>
                    )}
                    <p className="mt-6 text-label-md italic opacity-70">* Final price confirmed by {owner.name} after review.</p>
                  </div>
                  <div className="mt-4 flex items-start gap-3 bg-on-primary/10 border border-on-primary/20 rounded-xl p-4">
                    <span className="material-symbols-outlined text-tertiary-fixed flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                    <div>
                      <p className="text-label-lg font-bold text-on-primary">Approximate estimate only.</p>
                      <p className="text-label-md text-on-primary/80 mt-1">Actual bill may vary. You can negotiate with the owner.</p>
                      {owner.phone1 && <a href={`tel:${owner.phone1}`} className="mt-2 inline-flex items-center gap-1 text-label-md font-semibold text-tertiary-fixed hover:underline"><span className="material-symbols-outlined text-sm">call</span>{owner.phone1}</a>}
                      {owner.phone2 && <a href={`tel:${owner.phone2}`} className="mt-1 flex items-center gap-1 text-label-md font-semibold text-tertiary-fixed hover:underline"><span className="material-symbols-outlined text-sm">call</span>{owner.phone2}</a>}
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                  <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/5 rounded-full" />
                </div>
                <div className="card p-6">
                  <h3 className="text-primary font-bold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>Pricing Logic
                  </h3>
                  <ul className="space-y-2 text-label-md text-on-surface-variant">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Base fee: ₹{pricingSettings.pricePerMember?.toLocaleString('en-IN')} per member.</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Up to {pricingSettings.freeDistanceKm} km: No distance charge.</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Beyond {pricingSettings.freeDistanceKm} km: ₹{pricingSettings.distanceSurchargePerKm} × total km.</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Minimum 5 members required.</li>
                    {bestDiscount > 0 && <li className="flex items-start gap-2 text-green-300 font-semibold"><span className="mt-0.5">🎉</span>{selectedOffer?.title}: {bestDiscount}% discount applied!</li>}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
