# PriceRadar 🎯 — Intelligent Price Tracking & Deal Alert Engine

A full-stack, automated price monitoring web application created for a 3rd semester B.Tech Computer Science mini-project. 

Users register tracked product or stock URLs, specify their desired purchase price threshold, inspect interactive historical price fluctuation charts, and receive automated real-time alerts via Email (SMTP) and Telegram bot notifications whenever prices drop to or below their target.

---

## 🎨 Visual Design — Skeuomorphic "Vintage Ledger" Theme

PriceRadar rejects flat, generic SaaS styling in favor of physical, tangible paper-and-metal motifs:
- **Aged Ledger Palette:** Warm parchment backdrop (`#F5F0E8`), receipt-paper panels (`#FDFBF5`), deep savings green (`#1D5C2E`), and markdown alert amber (`#C8440A`).
- **Physical "Price Tag" Cards:** Tracked items styled as store hang-tags with punched hole eyelets, subtle rotation angles, and raised drop shadows.
- **Serrated "Receipt" Audit Logs:** Item history rendered as thermal printer printouts with custom SVG-clipped zigzag perforated bottom tear edges.
- **Tactile Stamped Buttons:** 3D bevel gradients with physically simulated `translateY(3px)` press depth and shadow shrinkage on click.
- **Sunken Inputs:** Inset shadows making text fields look and feel physically pressed into the surface.
- **Distinguished Typography:** High-contrast editorial serifs (**Playfair Display** & **DM Serif Display**) paired with clean sans-serif body text (**DM Sans**) and monospaced price tags (**Courier Prime**).

---

## 🛠️ Complete Tech Stack

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 4.x
- **Database:** MongoDB + Mongoose 8.x
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` password hashing + Google OAuth verification (`google-auth-library`)
- **Data Validation:** Joi schema validation
- **Web Scraping:** Axios + Cheerio with spoofed browser User-Agent headers
- **Currency Normalization:** Live exchange rate API (`open.er-api.com`) with fallback rate for INR $\rightarrow$ USD conversions
- **Automated Scheduling:** `node-cron` running 10-minute periodic batch checks
- **Alert Channels:** Nodemailer (SMTP with HTML templates) + `node-telegram-bot-api` (with interactive `/start` Chat ID helper)
- **Testing:** Jest + Supertest with `mongodb-memory-server`

### Frontend
- **Framework & Bundler:** React 19 + Vite 8
- **Routing:** React Router v7
- **Data Visualization:** Recharts for historical price trend line charts with target threshold reference lines and lowest-price dots
- **State Management:** React Context (`AuthContext`, `ToastContext`) with localStorage sync
- **Styling:** Modular CSS Tokens & CSS Modules

---

## 📁 Project Architecture

```
price-radar/
├── render.yaml                   # Render.com deployment blueprint
├── README.md                     # Documentation & setup guide
├── PROJECT_BRIEF.md              # Original project requirements
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & default site seed engine
│   ├── controllers/
│   │   ├── auth.js               # Signup, Login, Google OAuth controllers
│   │   ├── site.js               # Site selector CRUD
│   │   ├── track.js              # Watchlist CRUD & user ownership enforcement
│   │   └── test.js               # Live scraper preview validator
│   ├── middleware/
│   │   └── authMiddleware.js     # Bearer JWT verification middleware
│   ├── models/
│   │   ├── UserModel.js          # User schema
│   │   ├── SiteModel.js          # Supported retailer selector schema
│   │   └── TrackModel.js         # Track schema & price history sub-documents
│   ├── routes/
│   │   ├── auth.js               # /api/auth
│   │   ├── site.js               # /api/sites & /api/site
│   │   ├── track.js              # /api/track & /api/tracks
│   │   └── test.js               # /api/test
│   ├── utils/
│   │   ├── getPrice.js           # HTML scraper, currency converter & layout error detector
│   │   ├── scheduler.js          # Cron loop for price checking and alerting
│   │   ├── sendMail.js           # Nodemailer HTML dispatch helper
│   │   └── sendTelegram.js       # Telegram bot polling & message dispatcher
│   ├── tests/
│   │   ├── auth.test.js          # Auth endpoints unit tests
│   │   └── track.test.js         # Track CRUD & permission security tests
│   ├── Procfile                  # Railway / Heroku / Render process runner
│   ├── index.js                  # Express API bootloader
│   ├── .env.example              # Server environment template
│   └── package.json
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Configured Axios instance with auto JWT header
    │   ├── components/
    │   │   ├── AddTracker.jsx    # Add tracker form with live scrape preview
    │   │   ├── AllTracks.jsx     # Filterable list of price tag cards
    │   │   ├── TrackCard.jsx     # Individual price-tag component with trend pills
    │   │   ├── Navbar.jsx        # Skeuomorphic sticky navigation
    │   │   ├── Footer.jsx        # Brand footer
    │   │   └── Toast.module.css  # Notification styling
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Authentication state provider
    │   │   └── ToastContext.jsx  # Skeuomorphic toast/snackbar hook
    │   ├── layouts/
    │   │   ├── DefaultLayout.jsx # Public page layout (Navbar + Footer)
    │   │   └── AppLayout.jsx     # Protected authenticated layout
    │   ├── pages/
    │   │   ├── Home.jsx          # Landing page with interactive receipt demo
    │   │   ├── Login.jsx         # Sign-in page
    │   │   ├── Signup.jsx        # Registration page
    │   │   ├── Dashboard.jsx     # Watchlist dashboard & quick ledger stats
    │   │   ├── AddTracker.jsx    # Dedicated add-tracker page
    │   │   └── TrackDetail.jsx   # Interactive Recharts graph & receipt audit log
    │   ├── App.jsx               # Route tree
    │   ├── index.css             # Design token stylesheet
    │   └── main.jsx              # React DOM initialization
    ├── vercel.json               # Vercel SPA routing rewrites
    ├── vite.config.js            # Vite configuration with /api dev proxy
    ├── index.html                # Typography Google Fonts embed
    └── package.json
```

---

## ⚡ Quick Start & Local Setup

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/price-radar.git
cd price-radar

# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

---

### 2. Configure Environment Variables

#### Backend (`server/.env`)
Create a `server/.env` file with the following variables:

```env
# ── Server ─────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── MongoDB ────────────────────────────────────
MONGO_URI=mongodb://127.0.0.1:27017/priceradar

# ── JWT Secret ─────────────────────────────────
JWT_SECRET=super_secret_jwt_key_change_in_production

# ── Google OAuth (Optional) ────────────────────
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ── Email Alerts (Nodemailer SMTP) ────────────
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_SENDER=PriceRadar

# ── Telegram Alerts ────────────────────────────
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# ── Cron Job Schedule ──────────────────────────
CRON_SCHEDULE=*/10 * * * *
```

#### Frontend (`client/.env`)
Create a `client/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Run the Development Servers

**Start Backend Server:**
```bash
cd server
npm run dev
# Server listening on http://localhost:5000
```

**Start Frontend Client:**
```bash
cd client
npm run dev
# Vite dev server running on http://localhost:5173
```

---

### 4. Running Automated Tests

The test suite runs using an in-memory MongoDB server (`mongodb-memory-server`), requiring no local database configuration:

```bash
cd server
npm test
```

**Test Coverage Includes:**
- User registration & JWT generation
- Duplicate email rejection
- Valid & invalid password login
- Track creation & Joi validation
- Missing `demandPrice` rejection
- Authorization boundaries (User 2 cannot read or delete User 1's tracks $\rightarrow$ 403 Forbidden)
- Unauthenticated request rejection $\rightarrow$ 401 Unauthorized

---

## 🌐 Production Deployment Guide

### Option A: Backend on Render.com
1. Create a free account on [Render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Blueprint** and connect your GitHub repository (it will automatically detect [`render.yaml`](file:///c:/Users/ayush/Documents/price%20radar/render.yaml)).
3. Alternatively, create a **Web Service**:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add your Environment Variables in the Render dashboard:
   - `MONGO_URI` (from MongoDB Atlas)
   - `JWT_SECRET`
   - `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `EMAIL_FROM`, `EMAIL_SENDER`
   - `TELEGRAM_BOT_TOKEN`
5. Copy your live backend URL (e.g. `https://priceradar-api.onrender.com`).

---

### Option B: Frontend on Vercel
1. Create a free account on [Vercel](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project** and select your GitHub repository.
3. Configure the build settings:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the Environment Variable:
   - `VITE_API_URL` = `https://priceradar-api.onrender.com/api` (your backend URL + `/api`)
5. Click **Deploy**. Vercel will build the frontend and use [`vercel.json`](file:///c:/Users/ayush/Documents/price%20radar/client/vercel.json) to handle SPA client-side routing.

---

## 🤖 Setting Up Telegram Notifications

1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Type `/newbot` and follow the prompts to create your bot.
3. Copy the HTTP API token provided by BotFather into your `server/.env` under `TELEGRAM_BOT_TOKEN`.
4. Message `/start` directly to your new bot.
5. The bot will automatically reply with your unique **Chat ID** (e.g. `987654321`).
6. Paste this Chat ID into any PriceRadar tracker on your dashboard to activate mobile alerts!

---

## 💡 Credits & Inspiration

The core concept of extracting product prices via Cheerio DOM scraping was adapted from open-source web scraping tutorials and community blog posts. 

### Major Architectural & Feature Enhancements Added:
1. **Full-Stack JWT & Google Authentication**: User-isolated databases preventing unauthorized access or deletion of tracking records.
2. **Automated Batch Scheduling (`node-cron`)**: Autonomous background worker executing periodic batch checks without manual trigger requirements.
3. **Multi-Channel Dispatcher (SMTP + Telegram)**: Dual notification pipelines dispatching responsive HTML emails and Telegram push messages.
4. **Error-Hardened Scraper Engine**: Dynamic layout error boundary (`SELECTOR_NOT_FOUND`) preventing server halts on retailer DOM layout shifts, combined with live exchange rate normalization for international stores.
5. **Skeuomorphic "Vintage Ledger" User Interface**: Handcrafted tactile theme featuring physical price tag cards, serrated receipt logs, and interactive Recharts data visualization.

---

## 📄 License
MIT License © 2026 PriceRadar Team
