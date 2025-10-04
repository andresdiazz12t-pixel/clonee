import React from 'react';
import { Settings } from 'lucide-react';

type AdvancedSettingsProps = {
  onBack?: () => void;
};

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ onBack }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-full">
            <Settings className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración Avanzada</h1>
            <p className="text-gray-600">Personaliza reglas y parámetros específicos del sistema.</p>
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

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Días máximos de anticipación</label>
          <input
            type="number"
            defaultValue={30}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Máximo de reservas simultáneas por usuario</label>
          <input
            type="number"
            defaultValue={3}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mensaje de comunicación interna</label>
          <textarea
            defaultValue="Recuerda confirmar la disponibilidad antes de aprobar una reserva especial."
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
          />
        </div>
        <button className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors">
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

export default AdvancedSettings;
