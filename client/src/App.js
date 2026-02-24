import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { Suspense, useEffect, lazy } from 'react';
import Lenis from 'lenis';

const Layout = lazy(() => import('./components/layout.jsx'));
const Login = lazy(() => import('./pages/login.jsx'));
const Signup = lazy(() => import('./pages/signup.jsx'));
const ForgotPassword = lazy(() => import('./pages/forgotPassword.jsx'));
const Dashboard = lazy(() => import('./pages/dashboard.jsx'));
const Planner = lazy(() => import('./pages/planner.jsx'));
const Applications = lazy(() => import('./pages/application.jsx'));
const Profile = lazy(() => import('./pages/profile.jsx'));
const AdminDashboard = lazy(() => import('./pages/adminDashboard.jsx'));

const LazyFallback = () => (
  <div className="text-center p-10">
    <div className="loading-spinner mx-auto mb-4"></div>
    <p className="text-muted">Loading...</p>
  </div>
);

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      smoothTouch: false
    });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes inside Layout */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;