# Smart Travel Companion — Backend

> Node.js + Express + MongoDB + Gemini AI

## Project Structure

```
stc-backend/
├── src/
│   ├── index.js                  # Express server entry point
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js               # JWT protect middleware
│   │   └── errorHandler.js       # Global error handler
│   ├── models/
│   │   ├── User.js               # User schema (auth, XP, badges, contacts)
│   │   ├── Trip.js               # Trip + itinerary schema
│   │   ├── Expense.js            # Expense tracking schema
│   │   └── Document.js           # Travel document schema
│   ├── services/
│   │   └── geminiService.js      # All Gemini AI functions
│   ├── controllers/
│   │   ├── authController.js     # register, login, profile
│   │   ├── aiController.js       # itinerary, visa, chat, packing, culture
│   │   ├── tripController.js     # CRUD for trips
│   │   ├── expenseController.js  # CRUD + summary for expenses
│   │   ├── documentController.js # upload, download, delete docs
│   │   ├── weatherController.js  # Open-Meteo (free, no key)
│   │   ├── currencyController.js # ExchangeRate-API
│   │   ├── placesController.js   # Google Maps Places API
│   │   ├── safetyController.js   # SOS, emergency contacts
│   │   └── rewardsController.js  # XP, badges
│   └── routes/
│       ├── auth.js
│       ├── ai.js
│       ├── trips.js
│       ├── expenses.js
│       ├── documents.js
│       └── misc.js               # weather, currency, places, safety, rewards
├── uploads/                      # User-uploaded documents (gitignored)
├── frontend-integration/
│   ├── api.js                    # → copy to src/services/api.js in frontend
│   ├── AuthContext.jsx           # → replace src/context/AuthContext.jsx
│   └── AIPlanner.jsx             # → replace src/pages/AIPlanner.jsx
├── .env.example                  # Copy to .env and fill in keys
└── package.json
```

## Quick Setup

### 1. Install dependencies
```bash
cd stc-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in your API keys
```

### 3. Get API Keys

| Service | Where to get | Required? |
|---------|-------------|-----------|
| **MongoDB** | [mongodb.com/atlas](https://www.mongodb.com/atlas) (free tier) | ✅ Yes |
| **Gemini AI** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | ✅ Yes |
| **Google Maps** | [console.cloud.google.com](https://console.cloud.google.com) | ⚠️ For GPS Finder |
| **Fast2SMS** | [fast2sms.com](https://www.fast2sms.com) | ⚠️ For SOS alerts |
| **ExchangeRate-API** | [exchangerate-api.com](https://www.exchangerate-api.com) (free tier) | ⚠️ Optional (fallback exists) |
| **Open-Meteo** | No key needed | ✅ Free |

### 4. Start server
```bash
npm run dev     # Development with nodemon
npm start       # Production
```

Server starts at: `https://smart-travel-companion-backend.vercel.app`

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in, returns JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### AI (Gemini)
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/itinerary` | `{destination, days, budget, currency, travelers, tripType}` | Generate full itinerary |
| POST | `/api/ai/packing-list` | `{destination, days, tripType, weather}` | AI packing list |
| POST | `/api/ai/visa-info` | `{fromCountry, toCountry}` | Visa requirements |
| POST | `/api/ai/chat` | `{message}` | Travel assistant chat |
| POST | `/api/ai/culture` | `{destination}` | Culture & etiquette tips |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | All user trips |
| POST | `/api/trips` | Create trip |
| GET | `/api/trips/:id` | Single trip |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | All expenses |
| GET | `/api/expenses/summary` | Category breakdown |
| POST | `/api/expenses` | Add expense |
| PUT | `/api/expenses/:id` | Edit expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | All documents |
| POST | `/api/documents/upload` | Upload file (multipart) |
| DELETE | `/api/documents/:id` | Delete |
| GET | `/api/documents/:id/download` | Download file |

### Weather
| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| GET | `/api/weather` | `?city=Goa` or `?lat=15.2&lng=73.9` | 7-day forecast |

### Currency
| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| GET | `/api/currency/rates` | `?base=USD` | All rates |
| GET | `/api/currency/convert` | `?from=USD&to=INR&amount=100` | Convert |
| GET | `/api/currency/popular` | `?base=INR` | Popular travel currencies |

### Safety
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/safety/numbers` | Emergency numbers by country |
| GET | `/api/safety/contacts` | User's emergency contacts |
| POST | `/api/safety/contacts` | Add contact |
| DELETE | `/api/safety/contacts/:id` | Remove contact |
| POST | `/api/safety/sos` | Trigger SOS (logs event) |

### Rewards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rewards` | XP, level, badges |
| POST | `/api/rewards/award-badge` | `{badgeId}` — award badge |
| POST | `/api/rewards/add-xp` | `{amount, reason}` — add XP |

---

## Connect Frontend to Backend

### Step 1 — Add env var to frontend
In your frontend `.env`:
```
VITE_API_URL=https://smart-travel-companion-backend.vercel.app/api
```

### Step 2 — Copy integration files
```bash
# From stc-backend/frontend-integration/:
cp api.js           ../Yoshimithsu/src/services/api.js
cp AuthContext.jsx  ../Yoshimithsu/src/context/AuthContext.jsx
cp AIPlanner.jsx    ../Yoshimithsu/src/pages/AIPlanner.jsx
```

### Step 3 — Update other pages similarly
For each feature page (BudgetTracker, DocVault, etc.),
replace mock data calls with the real API:

```js
// Before (mock)
await new Promise(r => setTimeout(r, 1000))

// After (real)
import { expensesAPI } from '../services/api'
const res = await expensesAPI.getAll({ tripId })
setExpenses(res.data.data)
```

---

## Security Features
- JWT authentication on all protected routes
- bcrypt password hashing (12 rounds)
- Rate limiting (200 req/15min general, 10 req/min for AI)
- Helmet.js security headers
- CORS configured for frontend only
- File type validation for document uploads
- Per-user upload directories

## Health Check
```
GET https://smart-travel-companion-backend.vercel.app/api/health
```
