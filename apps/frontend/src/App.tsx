import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, ProtectedRoute, LoginPage, SignupPage, DashboardLayout, Home, Notes, User, Button } from '@repo/ui';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="bg-red-500 text-white p-4">Tailwind Test</div>
              <div className="p-10">
              <div className="bg-red-500 text-white p-4">Tailwind Test</div>
              <Button />
              </div>
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