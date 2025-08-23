import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@repo/ui/contexts/AuthContext';
import { ThemeProvider } from '@repo/ui/contexts/ThemeContext';
import ProtectedRoute from '@repo/ui/components/Auth/ProtectedRoute';
import LoginPage from '@repo/ui/components/Auth/LoginPage';
import SignupPage from '@repo/ui/components/Auth/SignupPage';
import DashboardLayout from '@repo/ui/components/Layout/DashboardLayout';
import Home from '@repo/ui/components/Pages/Home';
import Notes from '@repo/ui/components/Pages/Notes';
import User from '@repo/ui/components/Pages/User';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
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
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}