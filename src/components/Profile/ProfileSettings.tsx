import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, User as UserIcon, IdCard, Lock, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UpdateProfilePayload } from '../../types';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  identificationNumber: string;
  password: string;
  confirmPassword: string;
}

const initialFormState: FormState = {
  fullName: '',
  email: '',
  phone: '',
  identificationNumber: '',
  password: '',
  confirmPassword: ''
};

const ProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      setFormState((prev) => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        identificationNumber: user.identificationNumber,
        password: '',
        confirmPassword: ''
      }));
      setErrors({});
    }
  }, [user]);

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  if (!user) {
    return null;
  }

  const handleInputChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): Partial<Record<keyof FormState, string>> => {
    const validationErrors: Partial<Record<keyof FormState, string>> = {};

    if (!formState.fullName.trim()) {
      validationErrors.fullName = 'Ingresa tu nombre completo.';
    }

    if (!formState.email.trim()) {
      validationErrors.email = 'Ingresa un correo electrónico.';
    } else if (!emailRegex.test(formState.email.trim())) {
      validationErrors.email = 'El correo electrónico no es válido.';
    }

    const phoneDigits = formState.phone.replace(/\D/g, '');
    if (!formState.phone.trim()) {
      validationErrors.phone = 'Ingresa un número de teléfono.';
    } else if (phoneDigits.length < 7) {
      validationErrors.phone = 'Ingresa un teléfono válido (al menos 7 dígitos).';
    }

    const idDigits = formState.identificationNumber.replace(/\D/g, '');
    if (!formState.identificationNumber.trim()) {
      validationErrors.identificationNumber = 'Ingresa tu número de identificación.';
    } else if (idDigits.length < 6) {
      validationErrors.identificationNumber = 'El número de identificación debe tener al menos 6 dígitos.';
    }

    if (formState.password) {
      if (formState.password.length < 6) {
        validationErrors.password = 'La nueva contraseña debe tener al menos 6 caracteres.';
      }
      if (formState.password !== formState.confirmPassword) {
        validationErrors.confirmPassword = 'Las contraseñas no coinciden.';
      }
    } else if (formState.confirmPassword) {
      validationErrors.confirmPassword = 'Ingresa la nueva contraseña para confirmar.';
    }

    return validationErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const payload: UpdateProfilePayload = {
      fullName: formState.fullName.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      identificationNumber: formState.identificationNumber.trim() || undefined,
    };

    if (formState.password) {
      payload.password = formState.password;
    }

    const result = await updateProfile(payload);

    if (result.success) {
      setStatusMessage({ type: 'success', message: 'Perfil actualizado correctamente.' });
      setFormState((prev) => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      setLastUpdatedAt(new Date());
    } else {
      setStatusMessage({ type: 'error', message: result.error ?? 'No se pudo actualizar el perfil.' });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Perfil</h1>
          <p className="text-gray-600 mt-1">
            Actualiza tus datos personales y credenciales de acceso para mantener tu información al día.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {statusMessage && (
            <div
              className={`p-4 rounded-md border ${
                statusMessage.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {statusMessage.message}
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <UserIcon className="inline h-4 w-4 mr-1" /> Nombre completo
                </label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={handleInputChange('fullName')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fullName ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu nombre completo"
                  required
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline h-4 w-4 mr-1" /> Correo electrónico
                </label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange('email')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="correo@ejemplo.com"
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline h-4 w-4 mr-1" /> Teléfono de contacto
                </label>
                <input
                  type="tel"
                  value={formState.phone}
                  onChange={handleInputChange('phone')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Número de teléfono"
                  required
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <IdCard className="inline h-4 w-4 mr-1" /> Número de identificación
                </label>
                <input
                  type="text"
                  value={formState.identificationNumber}
                  onChange={handleInputChange('identificationNumber')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.identificationNumber ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Número de identificación"
                  required
                />
                {errors.identificationNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.identificationNumber}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Seguridad</h2>
            <p className="text-sm text-gray-600 mb-4">
              Si deseas cambiar tu contraseña, ingresa una nueva y confírmala. Déjala en blanco para mantener la actual.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Lock className="inline h-4 w-4 mr-1" /> Nueva contraseña
                </label>
                <input
                  type="password"
                  value={formState.password}
                  onChange={handleInputChange('password')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Lock className="inline h-4 w-4 mr-1" /> Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={formState.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Confirma tu contraseña"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-medium">
          {lastUpdatedAt
            ? `Última actualización guardada: ${lastUpdatedAt.toLocaleString('es-ES')}`
            : 'Aún no has guardado cambios en esta sesión.'}
        </p>
        <p className="mt-1">
          Miembro desde{' '}
          {new Date(user.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
};

export default ProfileSettings;
