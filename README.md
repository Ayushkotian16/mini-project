# Team Nandini Chende Kateel — Website

Full-stack booking & CMS website for a traditional Chende percussion group based in Kateel, Karnataka.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT |
| Maps | OpenStreetMap + Leaflet + Nominatim (free, no key needed) |
| OTP SMS | Fast2SMS (free 100/day) → 2Factor.in fallback |
| Email | Nodemailer + Gmail App Password (free forever) |
| Payments | Razorpay (advance booking payment) |

---

## Project Structure

```
NandiniChendeKateel/
├── .env                  ← All environment variables (never commit this)
├── backend/
│   ├── src/
│   │   ├── config/       ← DB, SMS, Mailer, OTP store
│   │   ├── controllers/  ← Auth, Booking, Content, Events, Payment, etc.
│   │   ├── middleware/   ← JWT auth, error handler
│   │   ├── models/       ← Mongoose schemas
│   │   ├── routes/       ← Express routes
│   │   └── server.js     ← Entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/   ← Navbar, Footer, LocationPicker, ImageUploader, etc.
    │   ├── pages/        ← Public pages + Admin pages
    │   ├── services/     ← api.js (Axios)
    │   └── context/      ← AuthContext
    └── package.json
```

---

## Setup & Run Locally

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

Edit the `.env` file in the root folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nandini_chende
JWT_SECRET=your_secret_here
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
REGISTER_SECRET=your_register_secret

# SMS OTP (Fast2SMS — free 100/day)
# Sign up: https://www.fast2sms.com
FAST2SMS_API_KEY=your_key

# Email notifications (Gmail App Password)
# Setup: https://myaccount.google.com/apppasswords
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your16charapppassword
ADMIN_NOTIFY_EMAIL=notify@gmail.com

# Razorpay (advance payment)
# Keys: https://dashboard.razorpay.com → Settings → API Keys
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_ADVANCE_PERCENT=20

FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Run

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## Admin Panel

URL: `/admin/login`

First time setup — go to `/admin/register` and use the `REGISTER_SECRET` from `.env`.

### Admin Features

| Section | What you can do |
|---|---|
| Bookings | View, edit all fields, approve/reject, delete |
| Pricing Settings | Price per member, distance surcharge, advance %, toggle OTP & advance payment |
| Owner Details | Name, 2 phone numbers, email |
| Content → Hero | Title, description, logo |
| Content → About | Heritage text, founder info, stats |
| Content → Contact Info | Address, phone, email (shows on Contact page & Footer) |
| Content → Social Links | Facebook, Instagram, YouTube, WhatsApp |
| Content → Offers & Banners | Add Ganesh/Onam offers with image, discount %, urgency text, expiry, applies-to packages |
| Content → Package Cards | Edit booking package cards, fake markup %, show/hide |
| Events | Add/edit/delete events |
| Team | Add/edit/delete team members |
| Reviews | Approve/reject customer reviews |
| Messages | View contact form submissions |

---

## Booking Flow

1. Customer visits `/book`
2. Selects a package card (or Custom)
3. Fills form — name, phone, venue (OSM map), date, event type
4. Phone OTP verification (can be disabled from admin)
5. Date conflict check — 6-hour gap enforced
6. Booking submitted → admin gets email notification
7. Optional Razorpay advance payment (can be disabled from admin)

### Offer System

- Offers are created in Admin → Content → Offers & Banners
- Each offer has: title, discount %, image, urgency text, expiry date, applies-to packages
- **Direct visit** to `/book` → no discount applied, offers shown as info
- **Click "Book Now" on an offer banner** → `/book?offerId=xxx` → that offer's discount applied
- Flash popup on first visit only shows offers with discount > 0

---

## Deployment

### Backend (e.g. Render / Railway)

1. Set all `.env` variables in the platform's environment settings
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Set `NODE_ENV=production`

### Frontend (e.g. Vercel / Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_GOOGLE_MAPS_KEY` if you want Google Maps (optional — OSM works without it)
4. Add a proxy or set `VITE_API_URL` to your backend URL

### Vite proxy config (for production)

In `frontend/vite.config.js` the proxy points to `http://localhost:5000`. For production, set the API base URL in `frontend/src/services/api.js`:

```js
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://your-backend.onrender.com/api'
    : '/api',
});
```

---

## Free Services Summary

| Service | Free Limit | Notes |
|---|---|---|
| Gmail email | 500/day | Free forever with App Password |
| Fast2SMS | 100 SMS/day | Recharge ₹200 for ~1000 SMS |
| OpenStreetMap | Unlimited | No key needed |
| Razorpay test | Unlimited | Fake money only |
| Razorpay live | No monthly fee | 2% per transaction |
| MongoDB local | Unlimited | Use MongoDB Atlas free tier for cloud |

---

## GitHub

Repo: [https://github.com/Ayushkotian16/mini-project](https://github.com/Ayushkotian16/mini-project)

> ⚠️ Never commit `.env` — it is in `.gitignore`
