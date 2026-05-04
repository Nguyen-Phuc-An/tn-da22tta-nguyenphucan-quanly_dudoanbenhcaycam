import React from 'react';
import UserHeader from './UserHeader';

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default UserLayout;
