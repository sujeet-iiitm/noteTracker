import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;