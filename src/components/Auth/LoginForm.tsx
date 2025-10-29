import React, { useState } from 'react';
import { LayoutGrid, Eye, EyeOff, User, UserPlus, Mail, Phone, IdCard, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { RegisterData } from '../../types';

const LoginForm: React.FC = () => {
  const { login, register } = useAuth();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loginData, setLoginData] = useState({
    identificationNumber: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    identificationNumber: '',
    fullName: '',
    phone: '',
    password: ''
  });

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {};

    if (!loginData.identificationNumber.trim()) {
      newErrors.identificationNumber = 'Este campo es obligatorio';
    }

    if (!loginData.password) {
      newErrors.password = 'Este campo es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {};

    if (!registerData.fullName.trim()) {
      newErrors.fullName = 'El nombre es obligatorio';
    }

    if (!registerData.email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (!registerData.identificationNumber.trim()) {
      newErrors.identificationNumber = 'La identificación es obligatoria';
    } else if (registerData.identificationNumber.replace(/\D/g, '').length < 6) {
      newErrors.identificationNumber = 'Debe tener al menos 6 dígitos';
    }

    if (!registerData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (registerData.phone.replace(/\D/g, '').length < 7) {
      newErrors.phone = 'Ingresa un número válido';
    }

    if (!registerData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    setLoading(true);
    setErrors({});

    const result = await login(
      loginData.identificationNumber,
      loginData.password
    );

    if (!result.success) {
      toast.error(result.error ?? 'No se pudo iniciar sesión');
    } else {
      toast.success('Sesión iniciada correctamente');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegisterForm()) return;

    setLoading(true);
    setErrors({});

    const result = await register(registerData);
    if (!result.success) {
      toast.error(result.error ?? 'No se pudo crear la cuenta');
    } else {
      toast.success('Cuenta creada exitosamente');
    }
    setLoading(false);
  };

  const handleTabChange = (isLoginTab: boolean) => {
    setIsLogin(isLoginTab);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-primary-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <LayoutGrid className="h-9 w-9 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Espacios Comunitarios
            </h1>
            <p className="text-primary-100 text-sm">
              Sistema de Gestión de Reservas
            </p>
          </div>

          <div className="px-8 py-6">
            <div className="flex gap-2 mb-6 p-1 bg-neutral-100 rounded-lg">
              <button
                onClick={() => handleTabChange(true)}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  isLogin
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Iniciar Sesión
              </button>
              <button
                onClick={() => handleTabChange(false)}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  !isLogin
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <UserPlus className="h-4 w-4 inline mr-2" />
                Registrarse
              </button>
            </div>

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">
                    <IdCard className="h-4 w-4 inline mr-2" />
                    Número de identificación
                  </label>
                  <input
                    type="text"
                    value={loginData.identificationNumber}
                    onChange={(e) => {
                      setLoginData({ ...loginData, identificationNumber: e.target.value });
                      if (errors.identificationNumber) {
                        setErrors({ ...errors, identificationNumber: '' });
                      }
                    }}
                    className={`input ${errors.identificationNumber ? 'input-error' : ''}`}
                    placeholder="123456789"
                  />
                  {errors.identificationNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slide-in">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.identificationNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => {
                        setLoginData({ ...loginData, password: e.target.value });
                        if (errors.password) {
                          setErrors({ ...errors, password: '' });
                        }
                      }}
                      className={`input ${errors.password ? 'input-error' : ''}`}
                      placeholder="Ingresa tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slide-in">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full mt-6"
                >
                  {loading ? (
                    <>
                      <div className="spinner w-4 h-4 mr-2" />
                      Iniciando...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-800 font-medium">Credenciales de prueba:</p>
                  <p className="text-xs text-blue-700 mt-1">ID: <span className="font-mono">900123456</span></p>
                  <p className="text-xs text-blue-700">Contraseña: <span className="font-mono">admin123</span></p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label">
                    <User className="h-4 w-4 inline mr-2" />
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={registerData.fullName}
                    onChange={(e) => {
                      setRegisterData({ ...registerData, fullName: e.target.value });
                      if (errors.fullName) {
                        setErrors({ ...errors, fullName: '' });
                      }
                    }}
                    className={`input ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="Juan Pérez"
                    autoComplete="name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slide-in">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => {
                      setRegisterData({ ...registerData, email: e.target.value });
                      if (errors.email) {
                        setErrors({ ...errors, email: '' });
                      }
                    }}
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slide-in">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <IdCard className="h-4 w-4 inline mr-2" />
                    Número de identificación
                  </label>
                  <input
                    type="text"
                    value={registerData.identificationNumber}
                    onChange={(e) => {
                      setRegisterData({ ...registerData, identificationNumber: e.target.value });
                      if (errors.identificationNumber) {
                        setErrors({ ...errors, identificationNumber: '' });
                      }
                    }}
                    className={`input ${errors.identificationNumber ? 'input-error' : ''}`}
                    placeholder="123456789"
                    inputMode="numeric"
                    autoComplete="off"
                  />
                  {errors.identificationNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slide-in">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.identificationNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => {
                      setRegisterData({ ...registerData, phone: e.target.value });
                      if (errors.phone) {
                        setErrors({ ...errors, phone: '' });
                      }
                    }}
                    className={`input ${errors.phone ? 'input-error' : ''}`}
                    placeholder="+57 300 123 4567"
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slide-in">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, password: e.target.value });
                        if (errors.password) {
                          setErrors({ ...errors, password: '' });
                        }
                      }}
                      className={`input ${errors.password ? 'input-error' : ''}`}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slide-in">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full mt-6"
                >
                  {loading ? (
                    <>
                      <div className="spinner w-4 h-4 mr-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
