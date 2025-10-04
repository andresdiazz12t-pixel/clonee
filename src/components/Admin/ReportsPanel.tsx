import React from 'react';
import { BarChart3 } from 'lucide-react';

type ReportsPanelProps = {
  onBack?: () => void;
};

const ReportsPanel: React.FC<ReportsPanelProps> = ({ onBack }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-full">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes y Analíticas</h1>
            <p className="text-gray-600">Visualiza métricas clave para la toma de decisiones.</p>
          </div>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Volver al Panel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["Uso mensual", "Reservas canceladas", "Espacios populares", "Ingresos estimados"].map((title) => (
          <div key={title} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-500">
              Este es un panel de ejemplo que muestra cómo se visualizarán las métricas y gráficos del sistema.
            </p>
            <div className="mt-4 h-24 bg-gradient-to-r from-green-200 via-green-100 to-green-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPanel;
