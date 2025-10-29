import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { storage } from '../../utils/storage';

type AdvancedSettingsProps = {
  onBack?: () => void;
};

interface SystemSettings {
  maxAdvanceDays: number;
  maxConcurrentReservations: number;
  internalMessage: string;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ onBack }) => {
  const [formValues, setFormValues] = useState<SystemSettings>({
    maxAdvanceDays: 30,
    maxConcurrentReservations: 3,
    internalMessage: 'Recuerda confirmar la disponibilidad antes de aprobar una reserva especial.'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const settings = storage.get<SystemSettings>('community_spaces_settings');

        if (!isMounted) {
          return;
        }

        if (settings) {
          setFormValues({
            maxAdvanceDays: settings.maxAdvanceDays ?? 30,
            maxConcurrentReservations: settings.maxConcurrentReservations ?? 3,
            internalMessage:
              settings.internalMessage ?? 'Recuerda confirmar la disponibilidad antes de aprobar una reserva especial.'
          });
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudo cargar la configuración. Inténtalo nuevamente.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (
    field: 'maxAdvanceDays' | 'maxConcurrentReservations' | 'internalMessage',
    value: string
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]:
        field === 'internalMessage'
          ? value
          : Number.isNaN(Number(value)) || value === ''
          ? 0
          : Number(value)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      storage.set('community_spaces_settings', formValues);
      setSuccess('Configuración guardada correctamente.');
    } catch (err) {
      setError('No se pudo guardar la configuración. Inténtalo nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

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
        {isLoading && (
          <div className="rounded-md bg-purple-50 p-3 text-sm text-purple-700">
            Cargando configuración...
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">{success}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Días máximos de anticipación</label>
          <input
            type="number"
            value={formValues.maxAdvanceDays}
            onChange={(event) => handleChange('maxAdvanceDays', event.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading || isSaving}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Máximo de reservas simultáneas por usuario</label>
          <input
            type="number"
            value={formValues.maxConcurrentReservations}
            onChange={(event) => handleChange('maxConcurrentReservations', event.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading || isSaving}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mensaje de comunicación interna</label>
          <textarea
            value={formValues.internalMessage}
            onChange={(event) => handleChange('internalMessage', event.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
            disabled={isLoading || isSaving}
          />
        </div>
        <button
          className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={isLoading || isSaving}
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

export default AdvancedSettings;
