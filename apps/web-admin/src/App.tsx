import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from './stores/authStore';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import BookingsPage from './pages/BookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import PayoutsPage from './pages/PayoutsPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';

function AdminRoute({ children }: { children: React.ReactNode }) {
 const user = useAuthStore((state) => state.user);
 const isAuthenticated = useAuthStore((state) => state.isAuthenticated)();

 if (!isAuthenticated) {
 return <Navigate to="/login" replace />;
 }

 if (user?.role?.name !== 'admin') {
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
 path="/"
 element={
 <AdminRoute>
 <AdminLayout />
 </AdminRoute>
 }
 >
 <Route index element={<DashboardPage />} />
 <Route path="providers" element={<ProvidersPage />} />
 <Route path="providers/:id" element={<ProviderDetailPage />} />
 <Route path="listings" element={<ListingsPage />} />
 <Route path="listings/:id" element={<ListingDetailPage />} />
 <Route path="bookings" element={<BookingsPage />} />
 <Route path="bookings/:id" element={<BookingDetailPage />} />
 <Route path="payouts" element={<PayoutsPage />} />
 <Route path="users" element={<UsersPage />} />
 <Route path="users/:id" element={<UserDetailPage />} />
 </Route>
 </Routes>
 </BrowserRouter>
 );
}

export default App;
