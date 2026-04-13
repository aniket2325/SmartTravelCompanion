import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import SignIn from './components/Auth/SignIn'
import SignUp from './components/Auth/SignUp'
import DashboardLayout from './pages/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import LandingPage from './pages/LandingPage'
import AIPlanner from './pages/AIPlanner'
import GPSFinder from './pages/GPSFinder'
import SOSSafety from './pages/SOSSafety'
import BudgetTracker from './pages/BudgetTracker'
import DocVault from './pages/DocVault'
import VisaChecker from './pages/VisaChecker'
import GroupTravel from './pages/GroupTravel'
import WeatherPage from './pages/WeatherPage'
import Bookings from './pages/Bookings'
import Rewards from './pages/Rewards'
import CurrencyConverter from './pages/CurrencyConverter'
import ProfileSettings from './pages/ProfileSettings'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/signin" replace />
  return children
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function RouteEffect() {
  const location = useLocation()
  
  // Set dynamic document title and handle dark mode
  import('react').then(({ useEffect }) => {
    useEffect(() => {
      // Title
      const path = location.pathname.split('/').pop() || 'welcome'
      const title = path.charAt(0).toUpperCase() + path.slice(1)
      document.title = title === 'Welcome' ? 'Smart Travel Companion' : `${title} | STC`

      // Dark mode initialization (stub for future full theme logic)
      const isDark = localStorage.getItem('stc_darkmode') === 'true'
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }, [location.pathname])
  })
  return null
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <RouteEffect />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="planner" element={<AIPlanner />} />
          <Route path="maps" element={<GPSFinder />} />
          <Route path="safety" element={<SOSSafety />} />
          <Route path="budget" element={<BudgetTracker />} />
          <Route path="docs" element={<DocVault />} />
          <Route path="visa" element={<VisaChecker />} />
          <Route path="group" element={<GroupTravel />} />
          <Route path="weather" element={<WeatherPage />} />
          <Route path="currency" element={<CurrencyConverter />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 249, 255, 0.85))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 1)',
              padding: '14px 24px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}