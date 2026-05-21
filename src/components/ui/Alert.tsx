import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  title?: string;
  onClose?: () => void;
}

const typeConfig: Record<string, { icon: React.ElementType; bg: string; border: string; text: string; iconColor: string }> = {
  success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', iconColor: 'text-green-500' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', iconColor: 'text-amber-500' },
  error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-500' },
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconColor: 'text-blue-500' },
};

export function Alert({ type, message, title, onClose }: AlertProps): React.ReactElement {
  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 ${config.bg} ${config.border}`}
      role="alert"
    >
      <IconComponent size={20} className={`shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className={`flex-1 ${config.text}`}>
        {title && <p className="font-medium">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`shrink-0 ${config.iconColor} hover:opacity-70`}
          aria-label="Close alert"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export default Alert;
