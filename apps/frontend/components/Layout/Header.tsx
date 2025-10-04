import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, FileText, User, Sun, Moon, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'HOME', icon: Home },
    { path: '/dashboard/subject', label: 'NOTES', icon: FileText },
    { path: '/dashboard/user', label: 'USER', icon: User },
  ];

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Navigation */}
        <nav className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Center: Dark Mode Toggle */}
        <div className="flex items-center space-x-2">
          <Sun className="w-4 h-4" />
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDark ? 'bg-primary' : 'bg-switch-background'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <Moon className="w-4 h-4" />
        </div>

        {/* Right: User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="relative h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <span className="text-sm font-medium">
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
            </span>
          </button>
          
          {isUserMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-20">
                <div className="p-3 border-b border-border">
                  <p className="font-medium">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      navigate('/dashboard/user');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;