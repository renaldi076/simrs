import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Breadcrumb } from '@/components/layout/Breadcrumb';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps): React.ReactElement {
  const { state, logout } = useAuth();
  const user = state.user;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <Breadcrumb />
      </div>

      {/* Right: User info + Logout */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {user.fullName}
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {user.role}
            </span>
          </div>
        )}
        <button
          onClick={() => logout('manual')}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-red-600"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Header;
