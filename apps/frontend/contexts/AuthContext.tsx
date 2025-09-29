import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<void>;
  loginWithGoogle: (credentialResponse: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
  
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/user/me",
        { withCredentials: true } 
      );
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  checkAuth();
}, []);

  const login = async (email: string, password: string) => {
  const now = new Date();
  const formattedTime = now.toLocaleTimeString("en-GB", { hour12: false });

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/api/user/signin', {
        email,
        password,
      },{
        withCredentials : true
      });
      
    const { userDetails } = response.data;
    setUser(JSON.parse(userDetails));
    localStorage.setItem('user', userDetails);
    localStorage.setItem("lastLogin", formattedTime);
    toast.success("Signed in Successfully!..");
    } catch (error: any) {
    console.error("login failed:", error);
    toast.error(error.response?.data?.message || 'Something went wrong');
    throw new Error('Login failed');
    }
  };

  const signup = async (name: string, email: string, password?: string) => {
    try {
      const response = await axios.post('http://localhost:3000/api/user/signup', {
        name,
        email,
        password,
      });
      toast.success(response.data.message);
    } catch (error:any) {
      toast.error(error.response?.data?.error || 'Something went wrong');
    }
  };

const loginWithGoogle = async (credentialResponse: any) => {
  const now = new Date();
  const formattedTime = now.toLocaleTimeString("en-GB", { hour12: false });
  try {
    setLoading(true);
    const response = await axios.post("http://localhost:3000/api/user/googleLogin",
      { credential: credentialResponse.credential },
      { withCredentials: true }
    );
    const { userDetails } = response.data;
    setUser(JSON.parse(userDetails));
    localStorage.setItem('user', userDetails);
    localStorage.setItem("lastLogin", formattedTime);
    toast.success("Yay!..Google Signup Succeed!");
  } catch (error:any) {
    console.error("Google login failed:", error);
    toast.error(error.response?.data?.message || 'Something went wrong');
    throw new Error("Google login failed");
  }
};


  const logout = async() => {
    try{
      const response = await axios.post('http://localhost:3000/api/user/logout',{},{
        withCredentials : true
      });
    localStorage.removeItem('user');
    setUser(null);
    toast.success(response.data.message || "logged out successfully!..");
    }catch(error){
      toast.error('Failed to logout');
    }
  };

  const value = {
    user,
    login,
    signup,
    loginWithGoogle,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};