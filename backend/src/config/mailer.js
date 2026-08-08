/**
 * Mailer — uses Nodemailer with Gmail (free).
 * Set GMAIL_USER and GMAIL_APP_PASSWORD in .env
 * Gmail App Password: https://myaccount.google.com/apppasswords
 */
const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
};

/**
 * Send a new-booking notification to the admin email.
 */
const sendBookingNotification = async (booking) => {
  const t = getTransporter();
  if (!t) return; // silently skip if not configured

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.GMAIL_USER;
  if (!adminEmail) return;

  const subject = `📥 New Booking: ${booking.fullName} — ${booking.eventType}`;
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e1bec4;border-radius:12px;overflow:hidden;">
      <div style="background:#9b0044;padding:24px;color:#fff;">
        <h2 style="margin:0;">New Booking Request</h2>
        <p style="margin:4px 0 0;opacity:0.8;">Team Nandini Chende Kateel — Admin Notification</p>
      </div>
      <div style="padding:24px;background:#fff;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#666;width:40%;">Name</td><td style="padding:8px 0;font-weight:600;">${booking.fullName}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;font-weight:600;">${booking.phone}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Event Type</td><td style="padding:8px 0;">${booking.eventType}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Event Date</td><td style="padding:8px 0;">${new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Venue</td><td style="padding:8px 0;">${booking.venueAddress}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">District</td><td style="padding:8px 0;">${booking.district}</td></tr>
          ${booking.venueLocation?.lat ? `<tr><td style="padding:8px 0;color:#666;">Map Location</td><td style="padding:8px 0;"><a href="https://www.google.com/maps?q=${booking.venueLocation.lat},${booking.venueLocation.lng}" style="color:#9b0044;">📍 Open in Google Maps</a><br/><small style="color:#999;">${booking.venueLocation.lat.toFixed(6)}, ${booking.venueLocation.lng.toFixed(6)}</small></td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#666;">Members</td><td style="padding:8px 0;">${booking.numberOfMembers}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Distance</td><td style="padding:8px 0;">${booking.distanceFromKateel} km</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Discount</td><td style="padding:8px 0;">${booking.discountPercent || 0}%</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Estimated Price</td><td style="padding:8px 0;">₹${booking.estimatedPrice?.toLocaleString('en-IN')}</td></tr>
          <tr style="background:#fdf2f5;"><td style="padding:8px;color:#9b0044;font-weight:700;">Final Price (after discount)</td><td style="padding:8px;color:#9b0044;font-weight:700;font-size:18px;">₹${booking.finalPrice?.toLocaleString('en-IN')}</td></tr>
          ${booking.specialNotes ? `<tr><td style="padding:8px 0;color:#666;">Notes</td><td style="padding:8px 0;font-style:italic;">${booking.specialNotes}</td></tr>` : ''}
        </table>
        <div style="margin-top:24px;padding:16px;background:#fdf2f5;border-radius:8px;border-left:4px solid #9b0044;">
          <p style="margin:0;color:#9b0044;font-weight:600;">Action Required</p>
          <p style="margin:4px 0 0;color:#666;">Please log in to the admin panel to review and approve or reject this booking.</p>
        </div>
      </div>
      <div style="padding:16px 24px;background:#f5f5f5;color:#999;font-size:12px;">
        Team Nandini Chende Kateel Admin System
      </div>
    </div>
  `;

  try {
    await t.sendMail({ from: `"Nandini Chende Kateel" <${process.env.GMAIL_USER}>`, to: adminEmail, subject, html });
    console.log(`✅ Booking notification email sent to ${adminEmail}`);
  } catch (err) {
    console.error('❌ Email notification failed:', err.message);
  }
};

module.exports = { sendBookingNotification };
