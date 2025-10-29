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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full animate-scale-in">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-neutral-100/50">
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
            <div className="relative">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl ring-4 ring-white/20">
                <LayoutGrid className="h-10 w-10 text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Espacios Comunitarios
              </h1>
              <p className="text-primary-100 text-base">
                Sistema de Gestión de Reservas
              </p>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="flex gap-2 mb-6 p-1.5 bg-neutral-100 rounded-xl shadow-inner">
              <button
                onClick={() => handleTabChange(true)}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  isLogin
                    ? 'bg-white text-primary-700 shadow-md scale-[1.02]'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Iniciar Sesión
              </button>
              <button
                onClick={() => handleTabChange(false)}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  !isLogin
                    ? 'bg-white text-primary-700 shadow-md scale-[1.02]'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
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
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
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
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
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

                <div className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl border border-primary-200/60 shadow-sm">
                  <p className="text-xs text-primary-900 font-semibold mb-2">Credenciales de prueba:</p>
                  <div className="space-y-1">
                    <p className="text-xs text-primary-800">ID: <span className="font-mono font-semibold">900123456</span></p>
                    <p className="text-xs text-primary-800">Contraseña: <span className="font-mono font-semibold">admin123</span></p>
                  </div>
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
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
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
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
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
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
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
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
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
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
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
