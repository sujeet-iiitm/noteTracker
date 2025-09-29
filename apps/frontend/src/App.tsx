import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import LoginPage from '../components/Auth/LoginPage';
import SignupPage from '../components/Auth/SignupPage';
import DashboardLayout from '../components/Layout/DashboardLayout';
import Home from '../components/Pages/Home';
import Notes from '../components/Pages/Notes';
import User from '../components/Pages/User';
import LandingPage from '../components/Pages/LandingPage';
import ViewSharedNote from '../components/Pages/ViewSharedNote';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';

function AppRoutes({ showLanding, setShowLanding }: { showLanding: boolean; setShowLanding: (val: boolean) => void }) {
  const location = useLocation();

  const isSharedNoteRoute = location.pathname.startsWith("/note/viewNote");

  if (isSharedNoteRoute) {
    return (
      <Routes>
        <Route path="/note/viewNote/:slug" element={<ViewSharedNote />} />
      </Routes>
    );
  }

  return (
    <>
      {showLanding ? (
        <LandingPage onComplete={() => setShowLanding(false)} />
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="notes" element={<Notes />} />
            <Route path="user" element={<User />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <AppRoutes showLanding={showLanding} setShowLanding={setShowLanding} />
          </div>
        </Router>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
