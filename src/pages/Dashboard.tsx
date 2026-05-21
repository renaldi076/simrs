import React from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MODULES } from '@/constants/modules';
import { Card3D } from '@/components/ui/Card3D';

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
};

export function Dashboard(): React.ReactElement {
  const { state } = useAuth();
  const navigate = useNavigate();
  const user = state.user;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {user?.fullName}
        </h1>
        <p className="mt-1 text-gray-500">Pilih modul untuk memulai</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {MODULES.map((module, index) => {
          const Icon = iconMap[module.icon];
          return (
            <Card3D
              key={module.id}
              icon={Icon ? <Icon size={28} /> : null}
              label={module.label}
              description={module.description}
              colorScheme={module.colorScheme}
              onClick={() => navigate(module.path)}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
