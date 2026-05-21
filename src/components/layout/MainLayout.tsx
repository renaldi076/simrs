import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export function MainLayout(): React.ReactElement {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
