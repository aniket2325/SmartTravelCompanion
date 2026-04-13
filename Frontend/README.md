# Smart Travel Companion 🌍

> Team: Recursive Delopys | HackIndia Spark 6 @ NIT Delhi

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **AI Engine**: Google Gemini AI
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── SignIn.jsx        # Sign in page (email + Google OAuth)
│   │   └── SignUp.jsx        # Multi-step sign up
│   ├── Dashboard/            # Feature components (WIP)
│   └── Layout/
│       └── Sidebar.jsx       # Collapsible sidebar nav
├── context/
│   └── AuthContext.jsx       # Auth state management
├── pages/
│   ├── DashboardHome.jsx     # Main dashboard
│   ├── DashboardLayout.jsx   # Layout wrapper
│   └── PlaceholderPage.jsx   # Placeholder for unbuilt routes
├── App.jsx                   # Routes + providers
├── main.jsx                  # Entry point
└── index.css                 # Tailwind + global styles
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file in the root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_KEY=your_google_maps_key_here
VITE_FIREBASE_API_KEY=your_firebase_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## Roadmap

### ✅ Phase 1 — Done
- [x] Project scaffold (Vite + React + Tailwind)
- [x] Auth pages (Sign In / Sign Up with Google OAuth)
- [x] Dashboard layout + sidebar
- [x] Dashboard home with stats, quick actions, trips

### 🚧 Phase 2 — In Progress
- [ ] AI Trip Planner (Gemini AI integration)
- [ ] GPS Nearby Finder (Google Maps SDK)
- [ ] SOS Safety feature
- [ ] Budget Tracker
- [ ] Document Vault

### 📋 Phase 3 — Planned
- [ ] Visa Checker
- [ ] Group Travel Coordinator
- [ ] Weather + Packing Planner
- [ ] Booking System
- [ ] Rewards & Badges