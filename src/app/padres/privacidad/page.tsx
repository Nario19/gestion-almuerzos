import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, HeartHandshake, Award } from 'lucide-react';
import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Protección de Datos | Placeres Culinarios',
  description:
    'Conoce nuestras políticas de privacidad, tratamiento de datos de escolares y medidas de seguridad bajo la Ley N° 29733 de Perú.',
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-28">
      {/* Botón de retorno */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la Carta Principal
        </Link>
      </div>

      {/* Cabecera Principal */}
      <Card className="p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <Badge variant="outline" className="text-[10px] font-semibold text-zinc-700 bg-zinc-100 border-zinc-200 mb-1">
              Cumplimiento Legal • Ley N° 29733 (Perú)
            </Badge>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
              Política de Privacidad y Protección de Datos
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
          En <strong>Placeres Culinarios</strong>, la seguridad y confidencialidad de la información de los estudiantes
          menores de edad y sus apoderados es nuestra máxima prioridad. La presente Política de Privacidad describe
          cómo recopilamos, utilizamos, almacenamos y protegemos sus datos personales conforme a la{' '}
          <strong>Ley N° 29733 — Ley de Protección de Datos Personales de la República del Perú</strong> y su reglamento.
        </p>
      </Card>

      {/* Secciones de la Política */}
      <div className="space-y-6 text-xs sm:text-sm text-zinc-700">
        {/* 1. Responsable del Tratamiento */}
        <Card className="p-6">
          <h2 className="text-sm sm:text-base font-bold text-zinc-950 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-zinc-700" />
            1. Identidad y Domicilio del Responsable
          </h2>
          <p className="leading-relaxed text-zinc-600">
            El servicio de gestión y preparación de almuerzos escolares es operado por <strong>Placeres Culinarios</strong>,
            con sede en Lima, Perú. Ante cualquier consulta, solicitud o ejercicio de derechos de privacidad, puede
            comunicarse directamente a través de los canales oficiales de administración escolar de su institución.
          </p>
        </Card>

        {/* 2. Datos Personales Recopilados */}
        <Card className="p-6">
          <h2 className="text-sm sm:text-base font-bold text-zinc-950 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-700" />
            2. Datos Personales Recopilados
          </h2>
          <div className="space-y-3 leading-relaxed text-zinc-600">
            <p>Para la correcta prestación del servicio de alimentación escolar, recopilamos únicamente los datos necesarios:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Datos del Padre o Tutor Legal:</strong> Nombres y apellidos completos, documento nacional de identidad (DNI), número telefónico celular (WhatsApp) y capturas de comprobantes de pago.
              </li>
              <li>
                <strong>Datos de los Estudiantes (Menores de Edad):</strong> Nombres y apellidos completos, institución educativa (colegio), grado y sección escolar.
              </li>
              <li>
                <strong>Datos Sensibles de Salud y Nutrición:</strong> Alergias alimentarias, intolerancias (lactosa, gluten, mariscos, etc.), notas médicas y preferencias dietéticas especiales.
              </li>
            </ul>
          </div>
        </Card>

        {/* 3. Tratamiento Especial de Datos Sensibles de Menores */}
        <Card className="p-6 bg-zinc-50/50">
          <h2 className="text-sm sm:text-base font-bold text-zinc-950 mb-3 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-zinc-700" />
            3. Tratamiento Especial de Alergias y Datos de Menores
          </h2>
          <p className="leading-relaxed text-zinc-700 mb-3">
            Las notas de alergias y requerimientos alimentarios de los estudiantes reciben el tratamiento de datos sensibles bajo estándares de protección reforzada:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-700">
            <li>Son visibles única y estrictamente por el personal autorizado de cocina y despacho para garantizar que los alimentos no contengan ingredientes perjudiciales para la salud del estudiante.</li>
            <li>Jamás se comparten con otros padres de familia ni con terceros ajenos al servicio.</li>
            <li>No pueden ser sobrescritas ni alteradas por operaciones automáticas del sistema.</li>
          </ul>
        </Card>

        {/* 4. Finalidades del Tratamiento */}
        <Card className="p-6">
          <h2 className="text-sm sm:text-base font-bold text-zinc-950 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-zinc-700" />
            4. Finalidades del Tratamiento de Datos
          </h2>
          <div className="space-y-2 leading-relaxed text-zinc-600">
            <p>La información recopilada se destina exclusivamente a:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Planificar las porciones y preparar los menús escolares diarios de forma higiénica.</li>
              <li>Rotular y entregar los almuerzos en el horario correspondiente al recreo o almuerzo del colegio.</li>
              <li>Validar las transferencias bancarias y comprobantes de pago de Yape y Plin.</li>
              <li>Mantener el estado de cuenta y coordinación de cobranza bajo la modalidad de fiados autorizados.</li>
              <li>Contactar al apoderado de forma inmediata ante cualquier eventualidad de entrega o dieta médica.</li>
            </ol>
          </div>
        </Card>

        {/* 5. Confidencialidad y Seguridad */}
        <Card className="p-6">
          <h2 className="text-sm sm:text-base font-bold text-zinc-950 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-zinc-700" />
            5. Seguridad y Aislamiento por Colegio (Multitenant)
          </h2>
          <p className="leading-relaxed text-zinc-600">
            El sistema implementa arquitectura de <strong>aislamiento estricto por institución educativa</strong>. Los administradores
            de un colegio no pueden acceder, visualizar ni exportar datos pertenecientes a estudiantes o apoderados de otro colegio.
            Todas las comunicaciones se transmiten a través de canales seguros cifrados con protocolo TLS/HTTPS de última generación.
          </p>
        </Card>

        {/* 6. Derechos ARCO */}
        <Card className="p-6">
          <h2 className="text-sm sm:text-base font-bold text-zinc-950 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-700" />
            6. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
          </h2>
          <p className="leading-relaxed text-zinc-600">
            Todo apoderado tiene derecho a acceder a los datos registrados de sus hijos, solicitar la rectificación
            de información inexacta (a través de la sección <em>Mi Perfil</em> o <em>Mis Hijos</em>), cancelar su registro o revocar
            su consentimiento conforme al marco normativo de la Ley N° 29733.
          </p>
        </Card>
      </div>

      {/* Pie de página con enlace de retorno */}
      <div className="mt-8 text-center border-t border-zinc-200 pt-6">
        <p className="text-[11px] text-zinc-400 mb-3">
          Última actualización: Octubre de 2026 • Placeres Culinarios Perú
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition"
        >
          Entendido y Volver
        </Link>
      </div>
    </div>
  );
}
