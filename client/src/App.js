import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import { Suspense, lazy } from "react";
const Interviews = lazy(() => import("./pages/interviews.jsx"));
const News = lazy(() => import("./pages/news.jsx"));

const Layout = lazy(() => import("./components/layout.jsx"));
const ProtectedRoute = lazy(() => import("./components/protectedRoute.jsx"));
const AdminRoute = lazy(() => import("./components/adminRoute.jsx"));
const PublicRoute = lazy(() => import("./components/publicRoute.jsx"));

const Landing = lazy(() => import("./pages/landing.jsx"));
const Login = lazy(() => import("./pages/login.jsx"));
const Signup = lazy(() => import("./pages/signup.jsx"));
const ForgotPassword = lazy(() => import("./pages/forgotPassword.jsx"));
const Dashboard = lazy(() => import("./pages/dashboard.jsx"));
const Planner = lazy(() => import("./pages/planner.jsx"));
const Applications = lazy(() => import("./pages/application.jsx"));
const Profile = lazy(() => import("./pages/profile.jsx"));
const AdminDashboard = lazy(() => import("./pages/adminDashboard.jsx"));

const LazyFallback = () => (
  <div className="text-center p-10">
    <div className="loading-spinner mx-auto mb-4"></div>
    <p className="text-muted">Loading...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            {/* Open to everyone */}
            <Route path="/" element={<Landing />} />

            {/* Only for logged-out visitors */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Requires login */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/interviews" element={<Interviews />} />
                <Route path="/news" element={<News />} />
                <Route path="/profile" element={<Profile />} />

                {/* Requires login AND admin role */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Route>
            </Route>

            {/* Unknown paths go to the landing page, not the login wall */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
