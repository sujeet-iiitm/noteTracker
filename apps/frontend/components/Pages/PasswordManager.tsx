import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Trash2, RefreshCw, Plus, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

interface PasswordInput {
  id : string,
  title : string,
  username : string,
  password : string
}

const PasswordManager: React.FC = () => {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const [passwords, setPasswords] = useState<PasswordInput[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({
    title: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchPasswords();
  }, []);

const fetchPasswords = async () => {
  setLoading(true);
  try {
    const response = await axios.get('http://localhost:3000/api/password/allPasswords', {
      withCredentials: true,
    });
    const decryptedPasswords = response.data.decryptedPasswords || [];
    setPasswords(Array.isArray(decryptedPasswords) ? decryptedPasswords : []);
  } catch (error) {
    toast.error('Failed to fetch passwords');
    console.error('Error fetching passwords:', error);
  } finally {
    setLoading(false);
  }
};

  const handleGeneratePassword = () => {
    let chars = '';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (chars === '') {
      toast.error('Please select at least one character type');
      return;
    }

    let password = '';
    const array = new Uint32Array(passwordLength);
    crypto.getRandomValues(array);

    for (let i = 0; i < passwordLength; i++) {
      password += chars[array[i] % chars.length];
    }

    setGeneratedPassword(password);
    setPasswordCopied(false);
  };

  const copyGeneratedPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setPasswordCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  const copyPassword = (password: string, title: string) => {
    navigator.clipboard.writeText(password);
    toast.success(`${title} password copied!`);
  };

  const deletePassword = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
    await axios.delete('http://localhost:3000/api/password/deleteAPassword', {
      data: { id, title },
      withCredentials: true,
    });
        setPasswords(passwords.filter(p => p.id !== id));
        toast.success('Password deleted successfully');
      } catch (error) {
        toast.error('Failed to delete password');
        console.error('Error deleting password:', error);
      }
    }
  };

const handleAddPassword = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newPasswordData.title || !newPasswordData.password) {
    toast.error('Title and password are required');
    return;
  }

  try {
    const response = await axios.post(
      'http://localhost:3000/api/password/saveAPassword',
      {
        title: newPasswordData.title,
        username: newPasswordData.username,
        password: newPasswordData.password
      },
      { withCredentials: true }
    );

    setPasswords(Array.isArray(response.data.password) ? response.data.password : [...passwords, newPasswordData]);

    setNewPasswordData({ title: '', username: '', password: '' });
    setShowAddForm(false);
    toast.success('Password added successfully!');
  } catch (error) {
    toast.error('Failed to add password');
    console.error('Error adding password:', error);
  }
};


  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Password Manager</h1>
          <p className="text-muted-foreground">Generate secure passwords and manage your credentials</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="mb-4">Password Generator</h2>
          
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={generatedPassword}
                readOnly
                placeholder="Click generate to create a password"
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground"
              />
              <button
                onClick={copyGeneratedPassword}
                disabled={!generatedPassword}
                className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Copy password"
              >
                {passwordCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between mb-2">
                <span>Password Length: {passwordLength}</span>
              </label>
              <input
                type="range"
                min="8"
                max="32"
                value={passwordLength}
                onChange={(e) => setPasswordLength(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span>Uppercase (A-Z)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span>Lowercase (a-z)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span>Numbers (0-9)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span>Symbols (!@#$)</span>
              </label>
            </div>

            <button
              onClick={handleGeneratePassword}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Generate Password
            </button>
          </div>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Password
          </button>
        )}

        {showAddForm && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="mb-4">Add New Password</h2>
            <form onSubmit={handleAddPassword} className="space-y-4">
              <div>
                <label className="block mb-2">Title *</label>
                <input
                  type="text"
                  value={newPasswordData.title}
                  onChange={(e) => setNewPasswordData({ ...newPasswordData, title: e.target.value })}
                  placeholder="e.g., Gmail Account"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Username/Email (optional)</label>
                <input
                  type="text"
                  value={newPasswordData.username}
                  onChange={(e) => setNewPasswordData({ ...newPasswordData, username: e.target.value })}
                  placeholder="e.g., user@example.com"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-2">Password *</label>
                <input
                  type="text"
                  value={newPasswordData.password}
                  onChange={(e) => setNewPasswordData({ ...newPasswordData, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2>Saved Passwords ({passwords.length})</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading passwords...</div>
          ) : passwords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No passwords saved yet.</p>
              <p className="mt-2">Generate and add your first password above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {passwords.map((password : PasswordInput) => (
                <div
                  key={password.id}
                  className="flex items-center justify-between gap-4 p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      <span className="font-medium truncate">{password.title}</span>
                      <span className="font-mono text-muted-foreground">
                        {visiblePasswords.has(password.id)
                          ? password.password
                          : '•'.repeat(Math.min(password.password.length, 20))}
                      </span>
                    </div>
                    {password.username && (
                      <div className="text-sm text-muted-foreground mt-1">{password.username}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePasswordVisibility(password.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title={visiblePasswords.has(password.id) ? 'Hide password' : 'View password'}
                    >
                      {visiblePasswords.has(password.id) ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => copyPassword(password.password, password.title)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Copy password"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deletePassword(password.id, password.title)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                      title="Delete password"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordManager;
