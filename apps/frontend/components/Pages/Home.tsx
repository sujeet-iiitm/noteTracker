import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, TrendingUp, Calendar } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Notes',
      value: '24',
      description: 'Notes created this month',
      icon: FileText,
    },
    {
      title: 'This Week',
      value: '7',
      description: 'Notes added this week',
      icon: Calendar,
    },
    {
      title: 'Streak',
      value: '5 days',
      description: 'Current writing streak',
      icon: TrendingUp,
    },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-lg shadow-sm">
              <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
                <h4 className="text-sm font-medium">
                  {stat.title}
                </h4>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
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
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1 space-y-1">
                  <p className="leading-none">
                    Added new note: "Meeting Notes - Project Review"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2 hours ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;