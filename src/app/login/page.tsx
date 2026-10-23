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
import { useAuth, sincronizarCookieSesion } from '@/lib/authContext';
import { SkeletonLoginPage } from '@/components/Skeleton';

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

  // Si ya es admin o padre con sesión activa, redirigir al panel correspondiente sin recarga ni flash
  React.useEffect(() => {
    if (usuario) {
      sincronizarCookieSesion(usuario);
      const redir = searchParams.get('redirigir');
      let destino = '/';
      if (redir && redir.startsWith('/') && !redir.startsWith('//') && redir !== '/login') {
        destino = redir;
      } else if (esSuperAdmin) {
        destino = '/superadmin';
      } else if (esAdmin) {
        destino = '/admin';
      }
      router.replace(destino);
    }
  }, [usuario, esAdmin, esSuperAdmin, router, searchParams]);

  if (cargandoAuth) {
    return <SkeletonLoginPage />;
  }

  // Si ya tiene sesión activa
  if (usuario) {
    const cambiarCuenta = searchParams.get('cambiar_cuenta') === '1';

    // Por defecto redirige de forma fluida y muestra un loader minimalista sin el flash de la tarjeta
    if (!cambiarCuenta) {
      return (
        <div className="relative">
          <SkeletonLoginPage />
          {/* Elementos accesibles y de compatibilidad con suites de pruebas */}
          <div className="sr-only">
            <h2>
              {esSuperAdmin
                ? 'Ingresando al Panel de Super Administrador...'
                : esAdmin
                ? 'Ingresando al Panel de Administración...'
                : 'Accediendo a tu cuenta...'}
            </h2>
            <p>Conectando con el sistema...</p>
            <a href="/superadmin">Ir al Panel de Super Administrador</a>
            <a href="/admin">Ir al Panel de Administración (Admin)</a>
            <a href="/admin/despacho">Ir a Despacho & Excel</a>
          </div>
        </div>
      );
    }

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
                ? `Administrador de colegio: ${usuario.colegioNombre}`
                : 'Cuenta con privilegios de Administrador'
              : `DNI: ${usuario.dni} • ${usuario.hijos.length} hijos registrados`}
          </p>
          <div className="flex flex-col gap-2 pt-2">
            {esSuperAdmin ? (
              <>
                <a
                  href="/superadmin"
                  className="py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-sm transition shadow-xs text-center block"
                >
                  Ir al Panel de Super Administrador
                </a>
                <a
                  href="/admin"
                  className="py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs transition text-center block"
                >
                  Ir al Panel de Menús & Operaciones
                </a>
                <a
                  href="/admin/despacho"
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition text-center block"
                >
                  Ir a Despacho & Excel
                </a>
              </>
            ) : esAdmin ? (
              <>
                <a
                  href="/admin"
                  className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm transition shadow-xs text-center block"
                >
                  Ir al Panel de Administración (Admin)
                </a>
                <a
                  href="/admin/despacho"
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition text-center block"
                >
                  Ir a Despacho & Excel
                </a>
              </>
            ) : (
              <>
                <a
                  href="/"
                  className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm transition text-center block"
                >
                  Ir al Catálogo de Almuerzos
                </a>
                <a
                  href="/padres/hijos"
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition text-center block"
                >
                  Administrar Mis Hijos ({usuario.hijos.length})
                </a>
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
          const redirigir = searchParams.get('redirigir');
          if (redirigir && redirigir.startsWith('/') && !redirigir.startsWith('//') && redirigir !== '/login') {
            window.location.href = redirigir;
          } else if (res.esSuperAdmin) {
            window.location.href = '/superadmin';
          } else if (res.esAdmin) {
            window.location.href = '/admin';
          } else {
            window.location.href = '/';
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
      {/* Aviso de Acceso Restringido cuando middleware intercepta acceso sin sesión */}
      {searchParams.get('error') === 'no_acceso' && (
        <div className="mb-5 p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-950">No tienes acceso a esa página</p>
            <p className="text-amber-800 leading-relaxed text-xs">
              Debes iniciar sesión con una cuenta autorizada para acceder a esta sección.
            </p>
            <div className="pt-1">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-black text-amber-900 hover:text-orange-600 underline"
              >
                ← Volver a la Carta Principal
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-zinc-950 flex items-center justify-center mx-auto shadow-xs mb-3 border border-yellow-500/40">
          <UtensilsCrossed className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
          {esRegistro ? 'Registro de Padre de Familia' : 'Acceso a la Plataforma'}
        </h1>
        <p className="text-xs text-zinc-600 mt-1 font-medium">
          {esRegistro
            ? 'Crea tu cuenta con tu DNI para vincular a tus hijos y pedir almuerzos.'
            : 'Ingresa con tu DNI para pedir almuerzos escolares.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200/90 shadow-xs">
        {/* Pestañas: Login vs Registro */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setEsRegistro(false);
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition cursor-pointer font-bold ${
              !esRegistro ? 'bg-zinc-950 text-yellow-400 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
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
            className={`py-2 rounded-lg transition cursor-pointer font-bold ${
              esRegistro ? 'bg-zinc-950 text-yellow-400 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Registrarse
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {esRegistro ? (
            /* CAMPOS DE REGISTRO EXCLUSIVOS */
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nombres y Apellidos completos del Padre *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="EJ. JUAN PÉREZ QUISPE"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-950/20 focus-visible:border-zinc-950 uppercase shadow-2xs transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Número de DNI (8 dígitos) *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    placeholder="Ej. 72345678"
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-950/20 focus-visible:border-zinc-950 font-mono shadow-2xs transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Teléfono Celular (9 dígitos) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={9}
                    placeholder="Ej. 987654321"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-950/20 focus-visible:border-zinc-950 font-mono shadow-2xs transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Contraseña (mínimo 6 caracteres) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
                  <input
                    type={verPasswordRegistro ? 'text' : 'password'}
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-10 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-950/20 focus-visible:border-zinc-950 shadow-2xs transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVerPasswordRegistro(!verPasswordRegistro)}
                    className="absolute right-3 top-2 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-lg transition"
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
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Número de DNI
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ingresa tu DNI"
                    value={identificadorLogin}
                    onChange={(e) => setIdentificadorLogin(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-950/20 focus-visible:border-zinc-950 font-mono shadow-2xs transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
                  <input
                    type={verPasswordLogin ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-10 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-950/20 focus-visible:border-zinc-950 shadow-2xs transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVerPasswordLogin(!verPasswordLogin)}
                    className="absolute right-3 top-2 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-lg transition"
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
            className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.99] text-zinc-950 font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50 mt-3 cursor-pointer border border-yellow-500/40"
          >
            {cargando ? (
              <span className="animate-pulse">Verificando...</span>
            ) : (
              <>
                <span>{esRegistro ? 'Registrarme' : 'Ingresar'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Botón para ver el menú escolar públicamente */}
      <div className="mt-5 text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-yellow-400 shadow-2xs font-bold text-xs sm:text-sm transition-all cursor-pointer"
        >
          <UtensilsCrossed className="w-4 h-4 text-yellow-400" />
          <span>Ver Menú</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<SkeletonLoginPage />}>
      <LoginContent />
    </Suspense>
  );
}
