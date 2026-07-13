import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function HomeRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-bg p-6">
      <div className="max-w-md w-full bg-card-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-stone-charcoal mb-2">AngkorWatDayTour Vendor Dashboard</h1>
        <p className="text-stone-gray">Your provider dashboard will appear here once onboarding is approved.</p>
      </div>
    </div>
  );
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
            <ProtectedRoute>
              <HomeRoute />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
