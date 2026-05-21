import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Database,
  UserPlus,
  FileText,
  Receipt,
  Scan,
  FlaskConical,
  Pill,
  Banknote,
  Shield,
  Award,
  Settings,
  Activity,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MODULES } from '@/constants/modules';

const iconMap: Record<string, React.ComponentType<any>> = {
  Database,
  UserPlus,
  FileText,
  Receipt,
  Scan,
  FlaskConical,
  Pill,
  Banknote,
  Shield,
  Award,
  Settings,
  Activity,
  ClipboardCheck,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.2 }}
      className="flex h-screen flex-col border-r border-gray-200 bg-white"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100">
        {!collapsed && (
          <span className="text-xl font-bold text-blue-600">SIMRS</span>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {MODULES.map((module) => {
            const Icon = iconMap[module.icon];
            const isActive = location.pathname === module.path;

            return (
              <li key={module.id}>
                <button
                  onClick={() => navigate(module.path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? module.label : undefined}
                >
                  {Icon && <Icon size={20} />}
                  {!collapsed && <span>{module.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  );
}

export default Sidebar;
