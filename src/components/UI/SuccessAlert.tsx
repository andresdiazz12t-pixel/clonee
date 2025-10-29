import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({
  title = 'Éxito',
  message,
  onDismiss
}) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-slide-in" role="alert">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-800">{title}</h3>
          <p className="mt-1 text-sm text-green-700">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-green-500 hover:text-green-700 transition-colors"
            aria-label="Cerrar alerta"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessAlert;
