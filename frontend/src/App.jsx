import { Routes, Route, Navigate } from 'react-router-dom'
import MedAssistPanel from './components/common/MedAssistPanel'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'

// Layout
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Public pages
import HomePage from './pages/public/HomePage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import PharmacyRegisterPage from './pages/public/PharmacyRegisterPage'

// User pages
import UserDashboard from './pages/user/UserDashboard'
import SearchPage from './pages/user/SearchPage'
import SearchResultsPage from './pages/user/SearchResultsPage'
import ReservationHistoryPage from './pages/user/ReservationHistoryPage'
import PrescriptionsPage from './pages/user/PrescriptionsPage'
import ProfilePage from './pages/user/ProfilePage'
import MedicineDetailPage from './pages/user/MedicineDetailPage'

// New Feature Pages
import DrugInteractionPage from './pages/user/DrugInteractionPage'
import HealthProfilePage from './pages/user/HealthProfilePage'
import PrescriptionScanPage from './pages/user/PrescriptionScanPage'
import MedicineVerifyPage from './pages/user/MedicineVerifyPage'
import ExpiryTrackerPage from './pages/user/ExpiryTrackerPage'
import PriceComparePage from './pages/user/PriceComparePage'
import OrderTrackingPage from './pages/user/OrderTrackingPage'
import PharmacyMapPage from './pages/user/PharmacyMapPage'
import TrendingPage from './pages/user/TrendingPage'
import PaymentSuccessPage from './pages/user/PaymentSuccessPage'
import PaymentCancelPage from './pages/user/PaymentCancelPage'
import ReminderPage from './pages/user/ReminderPage'

// Pharmacy pages
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard'
import InventoryPage from './pages/pharmacy/InventoryPage'
import PharmacyReservationsPage from './pages/pharmacy/PharmacyReservationsPage'
import PrescriptionVerificationPage from './pages/pharmacy/PrescriptionVerificationPage'
import PharmacySettingsPage from './pages/pharmacy/PharmacySettingsPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsersPage from './pages/admin/ManageUsersPage'
import ManagePharmaciesPage from './pages/admin/ManagePharmaciesPage'
import VerifyPharmaciesPage from './pages/admin/VerifyPharmaciesPage'
import ReportsPage from './pages/admin/ReportsPage'

// Guards
const RequireAuth = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

const PublicOnly = ({ children }) => {
  const { user } = useAuth()
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'pharmacy') return <Navigate to="/pharmacy" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

const Layout = ({ children, noFooter }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    {!noFooter && <Footer />}
  </>
)

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/login" element={<PublicOnly><Layout noFooter><LoginPage /></Layout></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Layout noFooter><RegisterPage /></Layout></PublicOnly>} />
          <Route path="/pharmacy/register" element={<Layout noFooter><PharmacyRegisterPage /></Layout>} />

          {/* Public Feature Pages */}
          <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/search/results" element={<Layout><SearchResultsPage /></Layout>} />
          <Route path="/medicines/:id" element={<Layout><MedicineDetailPage /></Layout>} />
          <Route path="/interactions" element={<Layout noFooter><DrugInteractionPage /></Layout>} />
          <Route path="/pharmacy-map" element={<Layout noFooter><PharmacyMapPage /></Layout>} />
          <Route path="/trending" element={<Layout noFooter><TrendingPage /></Layout>} />
          <Route path="/price-compare" element={<Layout noFooter><PriceComparePage /></Layout>} />
          <Route path="/verify-medicine" element={<Layout noFooter><MedicineVerifyPage /></Layout>} />
          <Route path="/prescription-scan" element={<Layout noFooter><PrescriptionScanPage /></Layout>} />

          {/* User (Auth Required) */}
          <Route path="/dashboard" element={<RequireAuth roles={['user']}><Layout><UserDashboard /></Layout></RequireAuth>} />
          <Route path="/reservations" element={<RequireAuth roles={['user']}><Layout><ReservationHistoryPage /></Layout></RequireAuth>} />
          <Route path="/prescriptions" element={<RequireAuth roles={['user']}><Layout><PrescriptionsPage /></Layout></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth roles={['user']}><Layout><ProfilePage /></Layout></RequireAuth>} />
          <Route path="/health-profile" element={<RequireAuth roles={['user']}><Layout noFooter><HealthProfilePage /></Layout></RequireAuth>} />
          <Route path="/expiry-tracker" element={<RequireAuth roles={['user']}><Layout noFooter><ExpiryTrackerPage /></Layout></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth roles={['user']}><Layout noFooter><OrderTrackingPage /></Layout></RequireAuth>} />
          <Route path="/payment/success" element={<RequireAuth roles={['user']}><Layout noFooter><PaymentSuccessPage /></Layout></RequireAuth>} />
          <Route path="/payment/cancel" element={<RequireAuth roles={['user']}><Layout noFooter><PaymentCancelPage /></Layout></RequireAuth>} />
          <Route path="/reminders" element={<RequireAuth roles={['user']}><Layout noFooter><ReminderPage /></Layout></RequireAuth>} />

          {/* Pharmacy */}
          <Route path="/pharmacy" element={<RequireAuth roles={['pharmacy']}><Layout noFooter><PharmacyDashboard /></Layout></RequireAuth>} />
          <Route path="/pharmacy/inventory" element={<RequireAuth roles={['pharmacy']}><Layout noFooter><InventoryPage /></Layout></RequireAuth>} />
          <Route path="/pharmacy/reservations" element={<RequireAuth roles={['pharmacy']}><Layout noFooter><PharmacyReservationsPage /></Layout></RequireAuth>} />
          <Route path="/pharmacy/prescriptions" element={<RequireAuth roles={['pharmacy']}><Layout noFooter><PrescriptionVerificationPage /></Layout></RequireAuth>} />
          <Route path="/pharmacy/settings" element={<RequireAuth roles={['pharmacy']}><Layout noFooter><PharmacySettingsPage /></Layout></RequireAuth>} />

          {/* Admin */}
          <Route path="/admin" element={<RequireAuth roles={['admin']}><Layout noFooter><AdminDashboard /></Layout></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth roles={['admin']}><Layout noFooter><ManageUsersPage /></Layout></RequireAuth>} />
          <Route path="/admin/pharmacies" element={<RequireAuth roles={['admin']}><Layout noFooter><ManagePharmaciesPage /></Layout></RequireAuth>} />
          <Route path="/admin/verify" element={<RequireAuth roles={['admin']}><Layout noFooter><VerifyPharmaciesPage /></Layout></RequireAuth>} />
          <Route path="/admin/reports" element={<RequireAuth roles={['admin']}><Layout noFooter><ReportsPage /></Layout></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <MedAssistPanel />
      </AuthProvider>
    </LanguageProvider>
  )
}
