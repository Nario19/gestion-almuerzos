'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, registro, usuario, esAdmin } = useAuth();

  const [esRegistro, setEsRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Campos de registro requeridos: Nombre, DNI, Teléfono, Contraseña
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');

  // Campo de login
  const [identificadorLogin, setIdentificadorLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  // Si ya tiene sesión activa
  if (usuario) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
            {esAdmin ? <ShieldCheck className="w-8 h-8" /> : <User className="w-8 h-8" />}
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Sesión iniciada como {usuario.nombreCompleto}
          </h2>
          <p className="text-xs text-slate-500">
            {esAdmin ? 'Cuenta con privilegios de Administrador' : `DNI: ${usuario.dni} • ${usuario.hijos.length} hijos registrados`}
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/"
              className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm transition"
            >
              Ir al Catálogo de Almuerzos
            </Link>
            {esAdmin ? (
              <Link
                href="/cocina"
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition"
              >
                Ir a Panel de Cocina y Despacho
              </Link>
            ) : (
              <Link
                href="/hijos"
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition"
              >
                Administrar Mis Hijos ({usuario.hijos.length})
              </Link>
            )}
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
          setErrorMsg('Por favor completa todos los campos (Nombre, DNI, Teléfono y Contraseña).');
          setCargando(false);
          return;
        }

        if (dni.trim().length < 8) {
          setErrorMsg('El DNI debe tener 8 dígitos.');
          setCargando(false);
          return;
        }

        const res = await registro({
          nombreCompleto: nombre,
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
          router.push('/');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
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
                  Nombres y Apellidos del Padre / Tutor *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez Quispe"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
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
                    type="text"
                    maxLength={12}
                    placeholder="Ej. 72345678"
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono Celular (WhatsApp) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="Ej. 987 654 321"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="Crea una contraseña segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    required
                  />
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
                    type="password"
                    placeholder="••••••••"
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    required
                  />
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
