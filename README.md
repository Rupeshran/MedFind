# 💊 MedFind – Comprehensive Medicine Availability & Health Platform

> A full-stack, industry-grade web application that helps patients find medicines, compare prices, check for drug interactions, verify prescriptions via OCR, consult a multilingual AI chatbot, and manage reservations at nearby pharmacies — all from one unified platform.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + custom design system |
| Animations | Framer Motion |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth & Security | JWT, bcryptjs |
| File Upload | Multer |
| Email Notifications | Nodemailer |
| Maps & Navigation | Google Maps API (`@react-google-maps/api`) |
| Payments | Stripe API |
| PWA | Web App Manifest + Service Workers |
| Data Vis | Recharts |

---

## 📁 Project Structure

```
medfind/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatbotController.js         ← AI Chatbot (Multilingual)
│   │   ├── demandController.js          ← Market Demand / Trending Analytics
│   │   ├── drugInteractionController.js ← Drug Interaction Checker
│   │   ├── expiryTrackerController.js   ← Inventory Expiry tracker
│   │   ├── healthProfileController.js   ← User health data
│   │   ├── inventoryController.js       
│   │   ├── medicineController.js
│   │   ├── ocrController.js             ← Automatic Prescription OCR
│   │   ├── orderController.js           ← Order Tracking & Management
│   │   ├── pharmacyController.js
│   │   ├── priceCompareController.js    ← Alternative Medicine Pricing Engine
│   │   ├── reservationController.js
│   │   ├── smartSearchController.js     ← NLP / Smart Symptom Search
│   │   └── verificationController.js    ← Medicine Verification
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/                          ← DB schemas (User, Pharmacy, Medicine, Inventory, DrugInteraction, ExpiryTracker, SearchLog, etc.)
│   ├── routes/                          ← API Endpoints for all 15+ micro-features
│   ├── uploads/                         ← Prescription images & assets
│   ├── utils/                           ← Seed data & helpers
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/
    │   │   ├── common/                  ← Reusable UI (MedAssistPanel, Stats, Modals)
    │   │   ├── layout/
    │   │   └── pharmacy/
    │   ├── contexts/
    │   ├── pages/
    │   │   ├── admin/
    │   │   ├── pharmacy/
    │   │   ├── public/
    │   │   └── user/
    │   │       ├── DrugInteractionPage.jsx
    │   │       ├── ExpiryTrackerPage.jsx
    │   │       ├── HealthProfilePage.jsx
    │   │       ├── MedicineDetailPage.jsx
    │   │       ├── MedicineVerifyPage.jsx
    │   │       ├── OrderTrackingPage.jsx
    │   │       ├── PharmacyMapPage.jsx
    │   │       ├── PrescriptionScanPage.jsx
    │   │       ├── PriceComparePage.jsx
    │   │       ├── SearchPage.jsx
    │   │       ├── TrendingPage.jsx
    │   │       └── (Other Default Pages...)
    │   ├── services/                    ← Axios API client setup
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🌟 Key Features

### 🤖 AI & Smart Search
- **MedBot Multilingual Assistant:** An AI-powered chatbot supporting regional colloquials (e.g., Agartala dialects, Tamil, Bengali, Telugu, Bhojpuri) for inclusive healthcare access.
- **Smart NLP Search:** Search by symptoms, medicine names, or compositions with AI-driven recommendations.
- **Prescription OCR Scanner:** Automatically extracts medicine names and dosages from uploaded prescription images using OCR engines.

### 🏥 Pharmacy & Procurement
- **Real-time Inventory & Expiry Tracking:** Live stock updates for pharmacies and proactive warnings for close-to-expiration medications.
- **Price Comparison Engine:** Suggests cheaper generic alternatives for branded medicines to save user costs.
- **Order Tracking & Reservations:** Complete end-to-end journey for holding or reserving medicines before pickup.
- **Stripe Payment Gateway:** Secure online payments for orders directly from the user dashboard.
- **Pharmacy Map Integration:** Interactive Google Maps routing and directions embedded directly into pharmacy cards for easy local navigation.

### 📅 Daily Health Companion
- **Medicine Intake Reminders:** A visual dose timeline and scheduling system to manage daily medication.
- **PWA (Progressive Web App):** Install MedFind on any device for a native-like experience with offline support.

### 🛡️ Safety & Health Management
- **Drug Interaction Checker:** Real-time warnings about dangerous or contraindicated medicine combinations.
- **Personalized Health Profiles:** Securely stores user conditions and allergies to proactively warn against harmful prescriptions.
- **Medicine Verification:** Authenticity checker ensuring users buy legitimate medications.
- **Automated Email Notifications:** Timely email updates via integrated Nodemailer for account creation and reservation confirmations.

### 📊 Analytics & Admin
- **Trend Analysis:** Tracks locally trending demanded medicines to help pharmacies restock efficiently.
- **Robust Dashboard:** Comprehensive admin tools, chart visualizations, and user/pharmacy management.

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Git

---

### 1. Clone / Extract the project

```bash
cd medfind
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit your `.env` variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/medfind
JWT_SECRET=your_super_secret_key_here_change_this
JWT_EXPIRE=7d
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_auth_password
NODE_ENV=development
```

Create the required uploads folder:
```bash
mkdir -p uploads/prescriptions uploads/misc
```

Seed the database with localized demo data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

> **Note:** The API will run at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend folder:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

> 💡 **Google Maps API Key:** Go to [Google Cloud Console](https://console.cloud.google.com/), enable **Maps JavaScript API** and **Places API**, then copy your key.

Start the frontend application:
```bash
npm run dev
```

> **Note:** The app will run at `http://localhost:5173`

---

## 🔑 Demo Login Credentials

After running `npm run seed`, access the system using these pre-configured accounts (Password for all: `password123`):

| Role | Email |
|------|-------|
| **Admin** | admin@medfind.com |
| **Pharmacy 1** | rajesh@citymedical.com |
| **Pharmacy 2** | priya@lifeline.com |
| **User** | anita@gmail.com |
| **User** | mohan@gmail.com |

---

## 🎨 Design System

- **Font:** Syne (headings) + DM Sans (body)
- **Primary color:** `#15b36d` (brand green)
- **Accent:** `#3b82f6` (blue / trust)
- **Interface:** Modern glassmorphism, rounded 16px soft shadows, responsive mobile-first architecture 
- **Animations:** Fluid Framer Motion stagger reveals and dynamic hover interactions

---

## 🔧 Troubleshooting

- **MongoDB connection error:** Make sure MongoDB daemon is running via `mongod`.
- **Port already in use:** Change `PORT=5000` in `.env` to an open port or terminate the conflicting process.
- **Google Maps not loading:** Verify your `VITE_GOOGLE_MAPS_API_KEY` is completely valid and all required Google Maps APIs are enabled.
- **Uploads failing:** Ensure the `backend/uploads/prescriptions/` directory correctly exists on disk with write permissions.
- **Emails not sending:** Confirm you are using a generated Google App Password in `EMAIL_PASS`, not your regular Gmail password.

---

*Built for a modern, accessible, and seamless healthcare future.*
