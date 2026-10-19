'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  UtensilsCrossed,
  User,
  Phone,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modoParam = searchParams.get('modo');
  const { login, registro, usuario, esAdmin, esSuperAdmin, cargando: cargandoAuth, logout } = useAuth();

  const [esRegistro, setEsRegistro] = useState(modoParam === 'registro');
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (modoParam === 'registro') {
      setEsRegistro(true);
    }
  }, [modoParam]);

  // Estados para mostrar u ocultar contraseña
  const [verPasswordLogin, setVerPasswordLogin] = useState(false);
  const [verPasswordRegistro, setVerPasswordRegistro] = useState(false);

  // Campos de registro requeridos: Nombre, DNI, Teléfono, Contraseña
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');

  // Campo de login
  const [identificadorLogin, setIdentificadorLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  // Si ya es admin con sesión activa, redirigir
  React.useEffect(() => {
    if (usuario) {
      if (esSuperAdmin) {
        router.replace('/superadmin');
      } else if (esAdmin) {
        router.replace('/admin');
      }
    }
  }, [usuario, esAdmin, esSuperAdmin, router]);

  if (cargandoAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Verificando sesión...</p>
      </div>
    );
  }

  // Si ya tiene sesión activa
  if (usuario) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
            {esSuperAdmin ? (
              <ShieldCheck className="w-8 h-8 text-purple-600" />
            ) : esAdmin ? (
              <ShieldCheck className="w-8 h-8" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Sesión iniciada como {usuario.nombreCompleto}
          </h2>
          <p className="text-xs text-slate-500">
            {esSuperAdmin
              ? 'Cuenta con privilegios de Super Administrador (Control Multi-Colegios)'
              : esAdmin
              ? usuario.colegioNombre
                ? `Administrador de sede: ${usuario.colegioNombre}`
                : 'Cuenta con privilegios de Administrador'
              : `DNI: ${usuario.dni} • ${usuario.hijos.length} hijos registrados`}
          </p>
          <div className="flex flex-col gap-2 pt-2">
            {esSuperAdmin ? (
              <>
                <Link
                  href="/superadmin"
                  className="py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-sm transition shadow-xs"
                >
                  Ir al Panel de Super Administrador
                </Link>
                <Link
                  href="/admin"
                  className="py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs transition"
                >
                  Ir al Panel de Menús & Operaciones
                </Link>
                <Link
                  href="/despacho"
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition"
                >
                  Ir a Despacho & Excel
                </Link>
              </>
            ) : esAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm transition shadow-xs"
                >
                  Ir al Panel de Administración (Admin)
                </Link>
                <Link
                  href="/despacho"
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition"
                >
                  Ir a Despacho & Excel
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm transition"
                >
                  Ir al Catálogo de Almuerzos
                </Link>
                <Link
                  href="/hijos"
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition"
                >
                  Administrar Mis Hijos ({usuario.hijos.length})
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => logout()}
              className="py-2.5 px-4 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-2xl transition border border-rose-200 flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCargando(true);

    try {
      if (esRegistro) {
        if (!nombre.trim() || !dni.trim() || !telefono.trim() || !password) {
          setErrorMsg('Por favor completa todos los campos.');
          setCargando(false);
          return;
        }

        if (dni.trim().length !== 8) {
          setErrorMsg('El DNI debe tener exactamente 8 dígitos.');
          setCargando(false);
          return;
        }

        if (telefono.trim().length !== 9) {
          setErrorMsg('El número de celular debe tener exactamente 9 dígitos.');
          setCargando(false);
          return;
        }

        if (password.length < 6) {
          setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
          setCargando(false);
          return;
        }

        const res = await registro({
          nombreCompleto: nombre.trim().toUpperCase(),
          dni: dni.trim(),
          telefono: telefono.trim(),
          password,
        });

        if (!res.ok) {
          setErrorMsg(res.error || 'Error al crear la cuenta.');
        } else {
          router.push('/hijos?primera_vez=true');
        }
      } else {
        if (!identificadorLogin.trim() || !passwordLogin) {
          setErrorMsg('Ingresa tu número de DNI y contraseña.');
          setCargando(false);
          return;
        }

        const res = await login(identificadorLogin.trim(), passwordLogin);
        if (!res.ok) {
          setErrorMsg(res.error || 'Credenciales no válidas.');
        } else {
          if (res.esSuperAdmin) {
            router.push('/superadmin');
          } else if (res.esAdmin) {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || 'Error de conexión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-20">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20 mb-3">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {esRegistro ? 'Registro de Padre de Familia' : 'Acceso a la Plataforma'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {esRegistro
            ? 'Crea tu cuenta con tu DNI para vincular a tus hijos y pedir almuerzos.'
            : 'Ingresa con tu DNI para pedir almuerzos escolares.'}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        {/* Pestañas: Login vs Registro */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setEsRegistro(false);
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl transition ${
              !esRegistro ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setEsRegistro(true);
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl transition ${
              esRegistro ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Registrarse
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {esRegistro ? (
            /* CAMPOS DE REGISTRO EXCLUSIVOS */
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombres y Apellidos completos del Padre *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="EJ. JUAN PÉREZ QUISPE"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número de DNI (8 dígitos) *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    placeholder="Ej. 72345678"
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono Celular (9 dígitos) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={9}
                    placeholder="Ej. 987654321"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña (mínimo 6 caracteres) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={verPasswordRegistro ? 'text' : 'password'}
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVerPasswordRegistro(!verPasswordRegistro)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition"
                    title={verPasswordRegistro ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {verPasswordRegistro ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* CAMPOS DE INICIO DE SESIÓN */
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número de DNI
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Ingresa tu DNI"
                    value={identificadorLogin}
                    onChange={(e) => setIdentificadorLogin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={verPasswordLogin ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVerPasswordLogin(!verPasswordLogin)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition"
                    title={verPasswordLogin ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {verPasswordLogin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
          >
            {cargando ? (
              <span className="animate-pulse">Verificando...</span>
            ) : (
              <>
                <span>{esRegistro ? 'Registrarme' : 'Ingresar'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Nota informativa sobre Administrador */}
        {!esRegistro && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              ¿Eres del personal de cocina o administración? Ingresa con tu cuenta de administrador.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600">Cargando...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
