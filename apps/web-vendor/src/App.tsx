import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from './stores/authStore';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ListingsPage from './pages/ListingsPage';
import ListingFormPage from './pages/ListingFormPage';
import CalendarPage from './pages/CalendarPage';
import BookingsPage from './pages/BookingsPage';
import EarningsPage from './pages/EarningsPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
 const isAuthenticated = useAuthStore((state) => state.isAuthenticated)();
 return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function ApprovedProviderRoute({ children }: { children: React.ReactNode }) {
 const user = useAuthStore((state) => state.user);
 const isAuthenticated = useAuthStore((state) => state.isAuthenticated)();

 if (!isAuthenticated) {
 return <Navigate to="/login" replace />;
 }

 if (user?.role?.name !== 'provider') {
 return <Navigate to="/login" replace />;
 }

 return <>{children}</>;
}

function App() {
 return (
 <BrowserRouter>
 <Routes>
 <Route path="/login" element={<LoginPage />} />
 <Route
 path="/onboarding"
 element={
 <ProtectedRoute>
 <OnboardingPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/"
 element={
 <ApprovedProviderRoute>
 <DashboardLayout />
 </ApprovedProviderRoute>
 }
 >
 <Route index element={<DashboardPage />} />
 <Route path="listings" element={<ListingsPage />} />
 <Route path="listings/new" element={<ListingFormPage />} />
 <Route path="listings/:id/edit" element={<ListingFormPage />} />
 <Route path="calendar" element={<CalendarPage />} />
 <Route path="bookings" element={<BookingsPage />} />
 <Route path="earnings" element={<EarningsPage />} />
 <Route path="settings" element={<SettingsPage />} />
 </Route>
 </Routes>
 </BrowserRouter>
 );
}

export default App;
