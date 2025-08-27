import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User as UserIcon, Mail, Calendar, Save, Edit, Loader } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface UserDetails {
  name: string;
  email: string;
  createdAt: string;
  userId: string;
}

interface NotesDetails {
  id: string;
  title: string;
  description: string;
  shortNote: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface NotesGroup {
  allNotes: NotesDetails[];
  weeklyNotes: NotesDetails[];
  monthlyNotes: NotesDetails[];
  yearlyNotes: NotesDetails[];
}

const User: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [notes, setNotes] = useState<NotesGroup>({
    allNotes: [],
    weeklyNotes: [],
    monthlyNotes: [],
    yearlyNotes: [],
  });

  const storedUser = localStorage.getItem('user');
  const userDetails: UserDetails | null = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const [allRes, weekRes, monthRes, yearRes] = await Promise.all([
          axios.get('http://localhost:3000/api/note/allNotes', { withCredentials: true }),
          axios.get('http://localhost:3000/api/note/weeklyNotes', { withCredentials: true }),
          axios.get('http://localhost:3000/api/note/monthlyNotes', { withCredentials: true }),
          axios.get('http://localhost:3000/api/note/yearlyNotes', { withCredentials: true }),
        ]);

        setNotes({
          allNotes: allRes.data.notes || allRes.data || [],
          weeklyNotes: weekRes.data || [],
          monthlyNotes: monthRes.data || [],
          yearlyNotes: yearRes.data || [],
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          logout();
          navigate('/login');
        } else {
          toast.error('Error fetching notes');
          console.log('Error fetching notes:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [logout, navigate]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setUpdating(true);
    try {
      const response = await axios.put(
        'http://localhost:3000/api/user/editUserDetails',
        formData,
        { withCredentials: true }
      );
      
      // Update localStorage with new user data
      if (userDetails) {
        const updatedUser = { ...userDetails, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      toast.success(response.data.message || 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Error updating profile. Try again.');
        console.log('Error while updating:', error);
      }
    } finally {
      setUpdating(false);
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await axios.delete(
        'http://localhost:3000/api/user/deleteAccount',
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        localStorage.removeItem('user');
        logout();
        navigate('/login');
      }
      toast.success(response.data.message || 'Account deleted successfully');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete account. Try again.');
        console.log('Error deleting account:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1>User Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3>Profile Information</h3>
                <button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  disabled={updating}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isEditing
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {updating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {userDetails?.name
                      ? userDetails.name.charAt(0).toUpperCase()
                      : userDetails?.email.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3>{userDetails?.name || 'User'}</h3>
                  <p className="text-muted-foreground">{userDetails?.email}</p>
                </div>
              </div>

              <div className="border-t border-border"></div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                        isEditing ? 'bg-input-background' : 'bg-muted'
                      }`}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                        isEditing ? 'bg-input-background' : 'bg-muted'
                      }`}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-4">
                <h4>Account Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Joined:</span>
                    <span className="text-sm">{formatDate(userDetails?.createdAt || '')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <h3>Your Activity</h3>
              <p className="text-muted-foreground">Overview of your notes and activity</p>
            </div>
            <div className="p-6 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Notes</span>
                    <span className="font-medium">{notes.allNotes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">This Week</span>
                    <span className="font-medium">{notes.weeklyNotes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="font-medium">{notes.monthlyNotes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">This Year</span>
                    <span className="font-medium">{notes.yearlyNotes.length}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-border"></div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Last login: Today at 10:30 AM</div>
                  <div className="text-xs text-muted-foreground">
                    Last note: {notes.allNotes.length > 0 ? 'Recently' : 'No notes yet'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card border border-destructive rounded-lg shadow-sm">
          <div className="p-6 border-b border-destructive">
            <h3 className="text-destructive">Danger Zone</h3>
            <p className="text-muted-foreground">
              These actions are permanent and cannot be undone.
            </p>
          </div>
          <div className="p-6">
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg border border-destructive w-full max-w-md">
            <h2 className="text-lg font-semibold text-destructive mb-2">Confirm Account Deletion</h2>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete your account? This action cannot be undone and will delete
              all your notes permanently.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirm(false);
                  await deleteAccount();
                }}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default User;