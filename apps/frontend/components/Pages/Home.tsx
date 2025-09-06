import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Notebook, Calendar, Loader } from 'lucide-react';
import { useNotes } from '../Hooks/useNotes';

const Home: React.FC = () => {
  const { notes, loading } = useNotes();
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'This Week',
      value: notes.weeklyNotes.length,
      description: 'Notes added this week',
      icon: Calendar,
    },
    {
      title: 'This Month',
      value: notes.monthlyNotes.length,
      description: 'Notes created this month',
      icon: FileText,
    },
    {
      title: 'This Year',
      value: notes.yearlyNotes.length,
      description: 'Notes created this year',
      icon: Calendar,
    },
  ];

  const recentNotes = notes.allNotes.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1>Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-muted-foreground">
          Track your daily thoughts and ideas. Keep your notes organized and accessible.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/dashboard/notes')}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Note</span>
        </button>
        <button
          onClick={() => navigate('/dashboard/notes')}
          className="border border-border bg-background text-foreground px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          View All Notes
        </button>
      </div>

      {/* Stats Cards */}
            <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
        <h4 className="text-sm font-medium text-center">
          Total Notes Saved till :
        </h4>
        <Notebook className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{notes.allNotes.length}</div>
        <p className="text-xs text-muted-foreground"><br/>
          This was you total Notes saved Count.
        </p>
      </div>
      </div>
      <div className="grid grid-cols-1 space-y-3 md:grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-lg shadow-sm">
              <div className="p-6 pb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium">{stat.title}</h4>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">
                  {loading ? (
                    <span className="animate-pulse text-muted-foreground">...</span>
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="p-6 pb-4">
          <h3>Recent Activity</h3>
          <p className="text-muted-foreground">Your latest notes and updates</p>
        </div>
        <div className="p-6 pt-0">
          {loading ? (
            <div className='flex items-center justify-center'>
            <Loader className="w-6 h-6 animate-spin" />
            <br/>
            <span >Loading Your Recent Activities...</span>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-muted-foreground">No recent notes found.</div>
          ) : (
            <div className="space-y-4">
              {recentNotes.map((note) => (
                <div key={note.id} className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="leading-none font-medium">
                      {note.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {note.description?.slice(0, 80) || 'No description'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created on: {new Date(note.createdAt).toLocaleString()}
                    </p>
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

export default Home;