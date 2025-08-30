import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
const darkMode : boolean = localStorage.getItem('theme') === 'dark' ? true : false;

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signup(name, email, password);
      setEmail('');
      setName('');
      setPassword('');
      navigate('/dashboard');
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await loginWithGoogle(credentialResponse);
      navigate('/dashboard');
    } catch (err) {
      setError('Google Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-sm">
        <div className="p-6 pb-4 text-center">
          <h1 className="mb-2">Create Account</h1>
          <p className="text-muted-foreground">Sign up to start tracking your daily notes</p>
        </div>
        <div className="p-6 pt-0 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 
                    ${darkMode 
                      ? 'bg-black text-white border-gray-600 placeholder-gray-400'
                      : 'bg-white text-black border-gray-300 placeholder-gray-500'}
                    border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`
                  }
                  required
                  />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 
                    ${darkMode 
                      ? 'bg-black text-white border-gray-600 placeholder-gray-400'
                      : 'bg-white text-black border-gray-300 placeholder-gray-500'}
                    border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`
                  }
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block">Password</label>  
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 
                    ${darkMode 
                      ? 'bg-black text-white border-gray-600 placeholder-gray-400'
                      : 'bg-white text-black border-gray-300 placeholder-gray-500'}
                    border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`
                  }
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              toast.error("Google Signin failed");
            }}
            useOneTap // optional: enables One Tap login prompt
          />
          
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;