"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  ExternalLink,
  Flower,
  Flower2,
  Globe,
  Grid2x2,
  Instagram,
  Leaf,
  Map as MapIcon,
  MapPin,
  Phone,
  Play,
  Quote,
  RotateCcw,
  School,
  Sparkles,
  Sprout,
  Sun,
  TreePine,
  Users,
  Video,
  Waves,
} from "lucide-react";
import { Container } from "@/components/layout";
import { ShareCardGenerator } from "@/components/jardin-mariposas/ShareCardGenerator";
import {
  ALERTA_MONARCA,
  CURSO_INFO,
  DEPARTAMENTOS_FILTRO,
  ESPACIOS,
  ESTADOS_ACTUALES,
  FOTOS_REALES,
  REGLAS_DE_ORO,
  TESTIMONIOS_REALES,
  VIDEOS_CANDELARIA,
  VIVEROS_URUGUAY,
  ZONAS,
  buildResultadoPersonalizado,
  buildWhatsAppLink,
  type DepartamentoFiltro,
  type EspacioId,
  type EstadoActualId,
  type MariposaEspecie,
  type VideoKey,
  type ZonaId,
} from "@/data/jardin-mariposas-guia";

const VIDEO_TABS_EDUCATIVOS: VideoKey[] = [
  "balconYMacetas",
  "comedorDePaso",
  "plantaDeLaMonarca",
];

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.272-.57-.421" />
    </svg>
  );
}

function ButterflyWingCrest({
  paleta,
  nombreComun,
}: {
  paleta: [string, string, string];
  nombreComun: string;
}) {
  const [primary, accent, highlight] = paleta;
  return (
    <div
      className="relative h-48 w-full flex flex-col items-center justify-center overflow-hidden border-b border-earth-900/10 dark:border-white/10"
      style={{
        background: `radial-gradient(circle at 50% 42%, ${primary}28 0%, ${highlight}45 55%, #faf6f1 100%)`,
      }}
      aria-label={`Paleta natural de alas de ${nombreComun}`}
    >
      <svg
        viewBox="0 0 180 120"
        className="w-28 h-20 drop-shadow-sm"
        aria-hidden="true"
      >
        <g transform="translate(90 62)">
          {[-1, 1].map((dir) => (
            <g key={dir} transform={`scale(${dir} 1)`}>
              <path
                d="M4 -4 C24 -48 64 -46 58 -10 C54 9 24 11 4 2 Z"
                fill={primary}
                stroke={accent}
                strokeWidth="3"
              />
              <ellipse
                cx="34"
                cy="-18"
                rx="10"
                ry="6"
                transform="rotate(-18 34 -18)"
                fill={highlight}
              />
              <path
                d="M4 2 C34 6 48 29 31 44 C17 54 6 31 3 12 Z"
                fill={primary}
                stroke={accent}
                strokeWidth="2.6"
              />
              <circle cx="23" cy="25" r="5" fill={highlight} />
            </g>
          ))}
          <ellipse cx="0" cy="4" rx="4.5" ry="22" fill={accent} />
          <path
            d="M-2 -16 Q-10 -34 -18 -36 M2 -16 Q10 -34 18 -36"
            fill="none"
            stroke={accent}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <div className="mt-2 flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-[#3d2914] shadow-xs">
        <span
          className="h-2.5 w-2.5 rounded-full border border-black/15"
          style={{ backgroundColor: primary }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full border border-black/15"
          style={{ backgroundColor: accent }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full border border-black/15"
          style={{ backgroundColor: highlight }}
        />
        <span className="ml-1">Especie nativa de Uruguay</span>
      </div>
    </div>
  );
}

function ZonaIcon({ id }: { id: ZonaId }) {
  switch (id) {
    case "montevideo":
      return <Building2 className="w-5 h-5" aria-hidden="true" />;
    case "canelones-costa":
      return <Waves className="w-5 h-5" aria-hidden="true" />;
    case "maldonado-este":
      return <Compass className="w-5 h-5" aria-hidden="true" />;
    case "interior":
      return <MapIcon className="w-5 h-5" aria-hidden="true" />;
  }
}

function EspacioIcon({ id }: { id: EspacioId }) {
  switch (id) {
    case "balcon":
      return <Flower2 className="w-5 h-5" aria-hidden="true" />;
    case "patio-chico":
      return <Sprout className="w-5 h-5" aria-hidden="true" />;
    case "jardin-grande":
      return <TreePine className="w-5 h-5" aria-hidden="true" />;
    case "chacra-escuela":
      return <School className="w-5 h-5" aria-hidden="true" />;
  }
}

function EstadoIcon({ id }: { id: EstadoActualId }) {
  switch (id) {
    case "pasto-baldosa":
      return <Grid2x2 className="w-5 h-5" aria-hidden="true" />;
    case "flores-vivero":
      return <Flower className="w-5 h-5" aria-hidden="true" />;
    case "muchas-plantas":
      return <Leaf className="w-5 h-5" aria-hidden="true" />;
  }
}

function ButterflyCard({
  mariposa,
  index,
  espacioId,
}: {
  mariposa: MariposaEspecie;
  index: number;
  espacioId: EspacioId;
}) {
  const esMburucuyaMini = espacioId === "balcon" && mariposa.id === "espejito";
  const hospederaNombre = esMburucuyaMini
    ? "Mburucuyá mini"
    : mariposa.hospederaPrincipal;
  const hospederaCientifico = esMburucuyaMini
    ? "Passiflora misera"
    : mariposa.hospederaCientifico;

  return (
    <article className="flex flex-col rounded-2xl overflow-hidden border border-earth-900/12 dark:border-white/10 bg-white dark:bg-stone-900 shadow-sm hover:shadow-md transition-shadow">
      {mariposa.fotoRealUrl ? (
        <div className="relative h-48 w-full overflow-hidden bg-stone-100">
          <Image
            src={mariposa.fotoRealUrl}
            alt={mariposa.fotoRealAlt || mariposa.nombreComun}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          <span className="absolute top-3 left-3 rounded-full bg-black/65 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1">
            0{index + 1} · Foto real
          </span>
        </div>
      ) : (
        <div className="relative">
          <ButterflyWingCrest
            paleta={mariposa.paletaAlas}
            nombreComun={mariposa.nombreComun}
          />
          <span className="absolute top-3 left-3 rounded-full bg-earth-900/80 text-white text-xs font-semibold px-2.5 py-1">
            0{index + 1}
          </span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="font-heading text-xl font-bold text-earth-900 dark:text-stone-100 leading-snug">
            {mariposa.nombreComun}
          </h3>
          <p className="text-sm italic text-muted-foreground">
            {mariposa.nombreCientifico}
          </p>
          <p className="text-sm font-medium text-green-700 dark:text-emerald-400 mt-1">
            {mariposa.tagline}
          </p>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed mb-4">
          {mariposa.descripcion}
        </p>

        {/* Planta hospedera clave */}
        <div className="rounded-xl bg-green-700/8 dark:bg-emerald-950/40 border border-green-700/20 p-3.5 mb-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-green-700 dark:text-emerald-400 mb-1">
            Planta hospedera clave (donde nacen)
          </p>
          <p className="text-sm font-semibold text-earth-900 dark:text-stone-100">
            {hospederaNombre}{" "}
            <span className="font-normal italic text-muted-foreground">
              ({hospederaCientifico})
            </span>
          </p>
          {!esMburucuyaMini && mariposa.hospederaAlternativa && (
            <p className="text-xs text-foreground/75 mt-1 leading-snug">
              También: {mariposa.hospederaAlternativa}
            </p>
          )}
        </div>

        {/* Nectaríferas */}
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Néctar para los adultos
          </p>
          <ul className="space-y-1">
            {mariposa.nectariferas.map((n) => (
              <li
                key={n}
                className="text-xs text-foreground/80 flex items-start gap-1.5"
              >
                <span className="text-[#c75b39] mt-0.5">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tip real de Candelaria */}
        <div className="mt-auto pt-3 border-t border-earth-900/10 dark:border-white/10">
          <p className="text-xs text-foreground/75 leading-relaxed">
            <span className="font-semibold text-earth-900 dark:text-stone-200">
              Nota de Candelaria:{" "}
            </span>
            {mariposa.datoCandelaria}
          </p>
        </div>
      </div>
    </article>
  );
}

export function GuiaMariposasClient() {
  const [zonaId, setZonaId] = useState<ZonaId | null>(null);
  const [espacioId, setEspacioId] = useState<EspacioId | null>(null);
  const [estadoId, setEstadoId] = useState<EstadoActualId | null>(null);
  const [pasoActivo, setPasoActivo] = useState<1 | 2 | 3>(1);

  const [videoOverride, setVideoOverride] = useState<VideoKey | null>(null);
  const [mostrarVideoCurso, setMostrarVideoCurso] = useState(false);

  const [filtroDepto, setFiltroDepto] = useState<DepartamentoFiltro>("Todos");
  const [filtroManual, setFiltroManual] = useState(false);

  const resultadoRef = useRef<HTMLDivElement | null>(null);
  const wizardRef = useRef<HTMLDivElement | null>(null);

  const resultado = useMemo(() => {
    if (!zonaId || !espacioId || !estadoId) return null;
    return buildResultadoPersonalizado(zonaId, espacioId, estadoId);
  }, [zonaId, espacioId, estadoId]);

  const videoActivo = useMemo(() => {
    if (videoOverride) return VIDEOS_CANDELARIA[videoOverride];
    if (resultado) return resultado.videoPrincipal;
    return VIDEOS_CANDELARIA.comedorDePaso;
  }, [videoOverride, resultado]);

  const viverosFiltrados = useMemo(() => {
    if (filtroDepto === "Todos") return VIVEROS_URUGUAY;
    return VIVEROS_URUGUAY.filter((v) => v.grupoFiltro === filtroDepto);
  }, [filtroDepto]);

  const conteosPorFiltro = useMemo(() => {
    const counts: Record<DepartamentoFiltro, number> = {
      Todos: VIVEROS_URUGUAY.length,
      Maldonado: 0,
      Canelones: 0,
      Montevideo: 0,
      "Rocha y Colonia": 0,
    };
    for (const v of VIVEROS_URUGUAY) {
      counts[v.grupoFiltro] += 1;
    }
    return counts;
  }, []);

  const handleSelectZona = (id: ZonaId) => {
    setZonaId(id);
    if (!filtroManual) {
      const z = ZONAS.find((item) => item.id === id);
      if (z) setFiltroDepto(z.departamentoSugerido);
    }
    if (!espacioId) {
      setPasoActivo(2);
    } else if (!estadoId) {
      setPasoActivo(3);
    }
  };

  const handleSelectEspacio = (id: EspacioId) => {
    setEspacioId(id);
    setVideoOverride(null);
    if (!estadoId) {
      setPasoActivo(3);
    }
  };

  const handleSelectEstado = (id: EstadoActualId) => {
    setEstadoId(id);
    if (zonaId && espacioId) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          resultadoRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 80);
      });
    }
  };

  const handleReiniciar = () => {
    setZonaId(null);
    setEspacioId(null);
    setEstadoId(null);
    setPasoActivo(1);
    setVideoOverride(null);
    setFiltroManual(false);
    setFiltroDepto("Todos");
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const completados = [zonaId, espacioId, estadoId].filter(Boolean).length;
  const zonaActual = ZONAS.find((z) => z.id === zonaId) ?? null;
  const espacioActual = ESPACIOS.find((e) => e.id === espacioId) ?? null;
  const estadoActual = ESTADOS_ACTUALES.find((s) => s.id === estadoId) ?? null;

  const esInterior = zonaId === "interior";
  const cursoHrefGlobal = resultado
    ? resultado.cursoHref
    : esInterior
      ? "/cursos/jardin-de-mariposas?origen=mapa-mariposas&opcion=online"
      : "/cursos/jardin-de-mariposas?origen=mapa-mariposas";

  const whatsappGrupalUrl = buildWhatsAppLink(
    "Hola! Hice la guía de mariposas en la web y quiero consultar por el 10% de descuento grupal para anotarnos de a dos al curso de Jardín de Mariposas con Candelaria."
  );

  return (
    <div className="bg-background text-foreground pb-20">
      {/* ================================================================
          HERO EDITORIAL + ENTRADA MAGNÉTICA (20 SEGUNDOS, 3 CLICS)
         ================================================================ */}
      <section className="relative overflow-hidden bg-[#1e3528] text-white">
        <div className="absolute inset-0">
          <Image
            src={FOTOS_REALES.mariposasVuelo}
            alt="Mariposas volando entre flores amarillas"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-35"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#172a1f]/85 via-[#1f3a2c]/80 to-[#faf6f1] dark:to-[#0c0a09]"
            aria-hidden="true"
          />
        </div>

        <Container className="relative pt-8 pb-16 sm:pt-12 sm:pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#f4efe8] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#f6d58e]" aria-hidden="true" />
              Guía interactiva gratuita · 20 segundos · CEUTA Uruguay
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.14] drop-shadow-sm">
              Descubrí qué mariposas de Uruguay pueden nacer en tu casa
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[#eef4f0] max-w-2xl mx-auto leading-relaxed">
              Elegí tu zona y tu espacio en 3 clics: te mostramos 3 mariposas
              nativas reales, sus plantas hospederas según la charla de{" "}
              <strong className="font-semibold text-white">
                Candelaria Domínguez
              </strong>{" "}
              y los viveros verificados cerca tuyo.
            </p>
          </div>

          {/* TARJETA INTERACTIVA DE 3 PASOS */}
          <div
            ref={wizardRef}
            className="mt-8 sm:mt-10 max-w-3xl mx-auto rounded-3xl bg-white dark:bg-stone-900 text-foreground shadow-xl border border-earth-900/12 dark:border-white/10 p-5 sm:p-8"
          >
            {/* Progreso y navegación entre pasos */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {([1, 2, 3] as const).map((step) => {
                  const isCurrent = pasoActivo === step;
                  const isDone =
                    (step === 1 && !!zonaId) ||
                    (step === 2 && !!espacioId) ||
                    (step === 3 && !!estadoId);
                  const stepLabel =
                    step === 1
                      ? zonaActual?.shortLabel || "1. Zona"
                      : step === 2
                        ? espacioActual?.label || "2. Espacio"
                        : estadoActual?.label || "3. Hoy";

                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setPasoActivo(step)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                        isCurrent
                          ? "bg-green-700 text-white shadow-xs"
                          : isDone
                            ? "bg-green-700/12 text-green-800 dark:text-emerald-300 hover:bg-green-700/20"
                            : "bg-stone-100 dark:bg-stone-800 text-muted-foreground hover:bg-stone-200 dark:hover:bg-stone-700"
                      }`}
                    >
                      {isDone && !isCurrent && (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      )}
                      <span className="truncate max-w-[130px] sm:max-w-[180px]">
                        {stepLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-semibold text-muted-foreground">
                {completados}/3 respondidas
              </span>
            </div>

            {/* Barra de progreso visual */}
            <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden mb-6">
              <div
                className="h-full rounded-full bg-green-700 transition-all duration-300"
                style={{ width: `${Math.max(12, (completados / 3) * 100)}%` }}
              />
            </div>

            {/* PASO 1: ZONA */}
            {pasoActivo === 1 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-emerald-400 mb-1">
                  Paso 1 de 3
                </p>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-earth-900 dark:text-stone-100 mb-4">
                  ¿En qué zona de Uruguay está tu espacio?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ZONAS.map((z) => {
                    const selected = zonaId === z.id;
                    return (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => handleSelectZona(z.id)}
                        aria-pressed={selected}
                        className={`group flex items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
                          selected
                            ? "border-green-700 bg-green-700/8 dark:bg-emerald-950/40 shadow-xs"
                            : "border-earth-900/12 dark:border-white/10 hover:border-green-700/60 hover:bg-cream/60 dark:hover:bg-stone-800/70"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            selected
                              ? "bg-green-700 text-white"
                              : "bg-cream dark:bg-stone-800 text-green-700 dark:text-emerald-400 group-hover:bg-green-700 group-hover:text-white"
                          }`}
                        >
                          <ZonaIcon id={z.id} />
                        </span>
                        <div>
                          <span className="block font-semibold text-base text-earth-900 dark:text-stone-100">
                            {z.label}
                          </span>
                          <span className="block text-xs sm:text-sm text-muted-foreground mt-0.5 leading-snug">
                            {z.sublabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 2: ESPACIO */}
            {pasoActivo === 2 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-emerald-400 mb-1">
                  Paso 2 de 3
                </p>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-earth-900 dark:text-stone-100 mb-4">
                  ¿Qué tipo de espacio tenés?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ESPACIOS.map((e) => {
                    const selected = espacioId === e.id;
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => handleSelectEspacio(e.id)}
                        aria-pressed={selected}
                        className={`group flex items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
                          selected
                            ? "border-green-700 bg-green-700/8 dark:bg-emerald-950/40 shadow-xs"
                            : "border-earth-900/12 dark:border-white/10 hover:border-green-700/60 hover:bg-cream/60 dark:hover:bg-stone-800/70"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            selected
                              ? "bg-green-700 text-white"
                              : "bg-cream dark:bg-stone-800 text-green-700 dark:text-emerald-400 group-hover:bg-green-700 group-hover:text-white"
                          }`}
                        >
                          <EspacioIcon id={e.id} />
                        </span>
                        <div>
                          <span className="block font-semibold text-base text-earth-900 dark:text-stone-100">
                            {e.label}
                          </span>
                          <span className="block text-xs sm:text-sm text-muted-foreground mt-0.5 leading-snug">
                            {e.sublabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 3: QUÉ TENÉS HOY */}
            {pasoActivo === 3 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-emerald-400 mb-1">
                  Paso 3 de 3 · Último clic
                </p>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-earth-900 dark:text-stone-100 mb-4">
                  ¿Qué tenés hoy en ese lugar?
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {ESTADOS_ACTUALES.map((s) => {
                    const selected = estadoId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectEstado(s.id)}
                        aria-pressed={selected}
                        className={`group flex items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
                          selected
                            ? "border-green-700 bg-green-700/8 dark:bg-emerald-950/40 shadow-xs"
                            : "border-earth-900/12 dark:border-white/10 hover:border-green-700/60 hover:bg-cream/60 dark:hover:bg-stone-800/70"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            selected
                              ? "bg-green-700 text-white"
                              : "bg-cream dark:bg-stone-800 text-green-700 dark:text-emerald-400 group-hover:bg-green-700 group-hover:text-white"
                          }`}
                        >
                          <EstadoIcon id={s.id} />
                        </span>
                        <div className="flex-1">
                          <span className="block font-semibold text-base text-earth-900 dark:text-stone-100">
                            {s.label}
                          </span>
                          <span className="block text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {s.sublabel}
                          </span>
                        </div>
                        <ArrowRight
                          className="w-4 h-4 text-muted-foreground group-hover:text-green-700 group-hover:translate-x-0.5 transition-all shrink-0"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Atajo si ya tiene resultado */}
            {resultado && (
              <div className="mt-5 pt-4 border-t border-earth-900/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    resultadoRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Ver mi resultado personalizado abajo
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleReiniciar}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-earth-900 dark:hover:text-stone-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Empezar de nuevo
                </button>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ================================================================
          RESULTADO PERSONALIZADO DE ALTO VALOR (100% CANDELARIA)
         ================================================================ */}
      {resultado && (
        <div ref={resultadoRef} id="resultado-guia" className="scroll-mt-24">
          {/* 1. ENCABEZADO DEL RESULTADO + 3 MARIPOSAS */}
          <section className="py-10 sm:py-14 bg-[#faf6f1] dark:bg-stone-950/60 border-b border-earth-900/10 dark:border-white/10">
            <Container>
              {/* Resumen de perfil elegido */}
              <div className="rounded-2xl bg-white dark:bg-stone-900 border border-earth-900/10 dark:border-white/10 p-5 sm:p-6 mb-8 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  <div className="relative h-32 md:h-28 md:w-44 shrink-0 rounded-xl overflow-hidden bg-stone-100">
                    <Image
                      src={resultado.espacio.fotoAmbiente}
                      alt={resultado.espacio.fotoAmbienteAlt}
                      fill
                      sizes="(min-width: 768px) 176px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-700/12 text-green-800 dark:text-emerald-300 px-3 py-1 text-xs font-semibold">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        {resultado.zona.label}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#c75b39]/12 text-[#9b3f22] dark:text-[#ff9c7d] px-3 py-1 text-xs font-semibold">
                        <Sprout className="w-3.5 h-3.5" aria-hidden="true" />
                        {resultado.espacio.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          wizardRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          })
                        }
                        className="text-xs font-medium text-muted-foreground underline hover:text-earth-900 dark:hover:text-stone-200 ml-auto cursor-pointer"
                      >
                        Editar respuestas
                      </button>
                    </div>
                    <p className="text-sm sm:text-base text-earth-900 dark:text-stone-100 font-medium italic leading-relaxed">
                      {resultado.espacio.fraseCandelaria}
                    </p>
                    <p className="text-sm text-foreground/75 mt-1.5 leading-relaxed">
                      {resultado.zona.contextoEcologico}
                    </p>
                  </div>
                </div>
              </div>

              {/* Título de las 3 mariposas */}
              <div className="text-center max-w-2xl mx-auto mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-emerald-400 mb-2">
                  Tu mapa de biodiversidad
                </p>
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-earth-900 dark:text-stone-100 leading-tight">
                  3 mariposas de Uruguay que pueden nacer en tu{" "}
                  <span className="text-green-700 dark:text-emerald-400">
                    {resultado.espacio.shortLabel}
                  </span>
                </h2>
                <p className="mt-2.5 text-base text-foreground/75">
                  Cada una necesita su planta hospedera nativa exacta para poner
                  huevos y alimentar a sus orugas.
                </p>
              </div>

              {/* Grid de 3 mariposas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {resultado.mariposas.map((m, idx) => (
                  <ButterflyCard
                    key={m.id}
                    mariposa={m}
                    index={idx}
                    espacioId={resultado.espacio.id}
                  />
                ))}
              </div>

              {/* Lista práctica de plantas nativas + consejos para este espacio */}
              <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-stone-900 border border-earth-900/12 dark:border-white/10 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 text-green-700 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
                    <Leaf className="w-4 h-4" aria-hidden="true" />
                    Tu lista base para llevar al vivero
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-earth-900 dark:text-stone-100 mb-4">
                    Plantas nativas clave para tu {resultado.espacio.shortLabel}
                  </h3>

                  <div className="space-y-3">
                    {resultado.plantasClave.map((planta) => (
                      <div
                        key={`${planta.nombreComun}-${planta.nombreCientifico}`}
                        className="rounded-xl border border-earth-900/10 dark:border-white/10 bg-[#faf6f1]/60 dark:bg-stone-800/50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-base text-earth-900 dark:text-stone-100">
                            {planta.nombreComun}{" "}
                            <span className="font-normal italic text-sm text-muted-foreground">
                              ({planta.nombreCientifico})
                            </span>
                          </h4>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                              planta.rol === "hospedera"
                                ? "bg-green-700 text-white"
                                : planta.rol === "doble"
                                  ? "bg-earth-900 text-white dark:bg-emerald-700"
                                  : "bg-[#c75b39] text-white"
                            }`}
                          >
                            {planta.rol === "hospedera"
                              ? "Hospedera"
                              : planta.rol === "doble"
                                ? "Hospedera + Néctar"
                                : "Néctar"}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-green-800 dark:text-emerald-300 mb-1">
                          Para: {planta.paraQueMariposa}
                        </p>
                        <p className="text-sm text-foreground/80 leading-snug">
                          {planta.tipCultivo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-stone-900 border border-earth-900/12 dark:border-white/10 p-5 sm:p-6 shadow-xs flex flex-col">
                  <div className="flex items-center gap-2 text-[#c75b39] font-semibold text-xs uppercase tracking-wider mb-1">
                    <Sun className="w-4 h-4" aria-hidden="true" />
                    Cómo ubicarlas para que funcione
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-earth-900 dark:text-stone-100 mb-4">
                    Consejos para tu {resultado.espacio.shortLabel} en{" "}
                    {resultado.zona.shortLabel}
                  </h3>

                  <ul className="space-y-3.5 flex-1">
                    {resultado.consejosEspacio.map((tip, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm sm:text-base text-foreground/85 leading-relaxed"
                      >
                        <CheckCircle2
                          className="w-5 h-5 text-green-700 dark:text-emerald-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-4 border-t border-earth-900/10 dark:border-white/10">
                    <a
                      href={resultado.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#169c46] hover:bg-[#12843b] text-white font-semibold text-sm sm:text-base px-4 py-3.5 shadow-sm transition"
                    >
                      <WhatsAppIcon className="w-5 h-5 shrink-0" />
                      Recibir gratis mi lista por WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* 2. DIAGNÓSTICO HONESTO + ALERTA REAL DE LA MONARCA */}
          <section className="py-10 sm:py-14">
            <Container>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Diagnóstico: Comedor de paso vs. Casa */}
                <div className="rounded-2xl overflow-hidden border border-earth-900/12 dark:border-white/10 bg-white dark:bg-stone-900 shadow-sm flex flex-col">
                  <div className="relative h-52 w-full bg-stone-100">
                    <Image
                      src={FOTOS_REALES.poneHuevos}
                      alt="Mariposa depositando huevos en el envés de una hoja tierna"
                      fill
                      sizes="(min-width: 1024px) 560px, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4">
                      <p className="text-xs text-white/95 leading-snug">
                        Hembra poniendo huevos en el envés de una hoja tierna:
                        solo ocurre cuando reconoce químicamente su hospedera
                        nativa.
                      </p>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-emerald-400 mb-1">
                      Diagnóstico honesto de tu espacio
                    </p>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-earth-900 dark:text-stone-100">
                      {resultado.estado.tituloDiagnostico}
                    </h3>
                    <p className="text-sm font-medium text-[#c75b39] mt-1 mb-3">
                      {resultado.estado.subtituloDiagnostico}
                    </p>
                    <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-4">
                      {resultado.estado.explicacion}
                    </p>
                    <div className="mt-auto rounded-xl bg-[#faf6f1] dark:bg-stone-800 border border-earth-900/10 dark:border-white/10 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-earth-900 dark:text-stone-200 mb-1">
                        Tu primer paso hoy
                      </p>
                      <p className="text-sm text-foreground/85 leading-relaxed">
                        {resultado.estado.primerPaso}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alerta ecológica real: Asclepias curassavica */}
                <div className="rounded-2xl overflow-hidden border-2 border-[#c75b39]/35 bg-[#fffaf6] dark:bg-stone-900 shadow-sm flex flex-col">
                  <div className="relative h-52 w-full bg-stone-100">
                    <Image
                      src={FOTOS_REALES.orugaMonarca}
                      alt="Oruga de mariposa Monarca con rayas negras, amarillas y blancas"
                      fill
                      sizes="(min-width: 1024px) 560px, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#b84624] text-white text-xs font-bold px-3 py-1.5 shadow-sm">
                      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                      Alerta ecológica real en Uruguay
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-earth-900 dark:text-stone-100 mb-2">
                      {ALERTA_MONARCA.titulo}
                    </h3>
                    <p className="text-sm font-semibold text-[#b84624] dark:text-[#ff9c7d] mb-2">
                      Evitá: {ALERTA_MONARCA.plantaEvitar}
                    </p>
                    <p className="text-sm sm:text-base text-foreground/85 leading-relaxed mb-4">
                      {ALERTA_MONARCA.porqueEvitar}
                    </p>

                    <div className="rounded-xl bg-white dark:bg-stone-800/80 border border-green-700/20 p-4 mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-emerald-400 mb-2">
                        Sus alternativas nativas reales en Uruguay
                      </p>
                      <ul className="space-y-2">
                        {ALERTA_MONARCA.alternativasNativas.map((alt) => (
                          <li
                            key={alt.cientifico}
                            className="text-sm text-foreground/85 leading-snug"
                          >
                            <strong className="text-earth-900 dark:text-stone-100">
                              {alt.nombre}
                            </strong>{" "}
                            <span className="italic text-muted-foreground">
                              ({alt.cientifico})
                            </span>{" "}
                            — {alt.detalle}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="mt-auto text-xs text-foreground/75 leading-relaxed">
                      {ALERTA_MONARCA.bonusLantana}
                    </p>
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* 3. VIDEO EMBEBIDO DE CANDELARIA (CLOUDINARY LIVIANO, LAZY) */}
          <section className="py-10 sm:py-14 bg-[#faf6f1] dark:bg-stone-950/60 border-y border-earth-900/10 dark:border-white/10">
            <Container>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Reproductor vertical 9:16 */}
                  <div className="md:col-span-5 flex justify-center">
                    <div className="w-full max-w-[300px] sm:max-w-[320px] rounded-3xl overflow-hidden bg-black shadow-xl border-4 border-white dark:border-stone-800">
                      <div className="relative aspect-[9/16] w-full">
                        <video
                          key={videoActivo.url}
                          controls
                          playsInline
                          preload="none"
                          poster={videoActivo.posterUrl}
                          src={videoActivo.url}
                          controlsList="nodownload"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Explicación + selector de clips */}
                  <div className="md:col-span-7">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-green-700/12 text-green-800 dark:text-emerald-300 px-3 py-1 text-xs font-semibold mb-3">
                      <Video className="w-3.5 h-3.5" aria-hidden="true" />
                      Clip real de la charla · {videoActivo.duracion} ·{" "}
                      {videoActivo.mb} MB
                    </div>

                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-earth-900 dark:text-stone-100 leading-tight mb-3">
                      {videoActivo.titulo}
                    </h2>

                    <p className="text-base text-foreground/80 leading-relaxed mb-6">
                      {videoActivo.descripcion}
                    </p>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                        Elegí qué fragmento de Candelaria ver:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {VIDEO_TABS_EDUCATIVOS.map((vKey) => {
                          const clip = VIDEOS_CANDELARIA[vKey];
                          const active = videoActivo.key === vKey;
                          const esSugerido =
                            resultado.videoPrincipal.key === vKey;
                          return (
                            <button
                              key={vKey}
                              type="button"
                              onClick={() => setVideoOverride(vKey)}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                                active
                                  ? "bg-green-700 text-white shadow-xs"
                                  : "bg-white dark:bg-stone-900 text-earth-900 dark:text-stone-200 border border-earth-900/15 dark:border-white/15 hover:border-green-700"
                              }`}
                            >
                              <Play className="w-3.5 h-3.5" aria-hidden="true" />
                              {clip.etiquetaCorta}
                              {esSugerido && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    active
                                      ? "bg-white/20 text-white"
                                      : "bg-green-700/12 text-green-800 dark:text-emerald-300"
                                  }`}
                                >
                                  Tu espacio
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* 4. EL DOBLE PUENTE: CONVERSIÓN WHATSAPP + TARJETA COMPARTIBLE */}
          <section className="py-10 sm:py-14">
            <Container>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Puente 1: Botón principal verde de WhatsApp */}
                <div className="rounded-2xl border-2 border-[#169c46]/35 bg-gradient-to-br from-[#f2fbf5] via-white to-[#eef9f1] dark:from-emerald-950/40 dark:via-stone-900 dark:to-stone-900 p-6 sm:p-8 shadow-sm">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#169c46]/15 text-[#127a37] dark:text-emerald-300 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    Te la mandamos lista al celular
                  </div>

                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-earth-900 dark:text-stone-100 leading-tight mb-3">
                    Guardá tu lista de plantas nativas en WhatsApp
                  </h2>

                  <p className="text-base text-foreground/80 leading-relaxed mb-5">
                    Te enviamos gratis el resumen para tu{" "}
                    <strong>{resultado.espacio.shortLabel}</strong> en{" "}
                    <strong>{resultado.zona.shortLabel}</strong> para tenerlo a
                    mano cuando vayas al vivero, y te contamos cómo es el curso
                    con Candelaria sin compromiso.
                  </p>

                  {/* Vista previa del mensaje pre-escrito */}
                  <div className="rounded-xl bg-white dark:bg-stone-800/80 border border-earth-900/10 dark:border-white/10 p-3.5 mb-5 text-xs sm:text-sm text-foreground/75 italic leading-relaxed">
                    «{resultado.whatsappMensaje}»
                  </div>

                  <a
                    href={resultado.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-[#169c46] hover:bg-[#12843b] text-white font-bold text-base sm:text-lg px-6 py-4 shadow-md hover:shadow-lg transition-all"
                  >
                    <WhatsAppIcon className="w-6 h-6 shrink-0" />
                    Recibir gratis mi lista de plantas por WhatsApp
                  </a>

                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Atención directa de CEUTA Uruguay · Respuesta personalizada
                  </p>
                </div>

                {/* Puente 2: Tarjeta compartible Canvas 9:16 */}
                <ShareCardGenerator resultado={resultado} />
              </div>

              {/* 4 Reglas de oro de gestión regenerativa */}
              <div className="mt-10 rounded-2xl border border-earth-900/10 dark:border-white/10 bg-[#faf6f1]/70 dark:bg-stone-900/70 p-6 sm:p-8">
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-emerald-400 mb-1">
                    Para que el ciclo se complete todo el año
                  </p>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-earth-900 dark:text-stone-100">
                    Las 4 reglas de oro de Candelaria
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {REGLAS_DE_ORO.map((regla) => (
                    <div
                      key={regla.numero}
                      className="rounded-xl bg-white dark:bg-stone-900 border border-earth-900/10 dark:border-white/10 p-4"
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-700/12 text-green-800 dark:text-emerald-300 text-xs font-bold">
                          {regla.numero}
                        </span>
                        <h4 className="font-heading font-bold text-base text-earth-900 dark:text-stone-100">
                          {regla.titulo}
                        </h4>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {regla.detalle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Container>
          </section>
        </div>
      )}

      {/* ================================================================
          PRUEBA SOCIAL REAL Y ANÓNIMA (CHARLA GRATUITA 18–20/11)
         ================================================================ */}
      <section className="py-10 sm:py-14 bg-[#faf6f1] dark:bg-stone-950/60 border-t border-earth-900/10 dark:border-white/10">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-emerald-400 mb-1.5">
              Más de 100 personas en vivo en la charla gratuita
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-earth-900 dark:text-stone-100">
              Lo que dijeron quienes escucharon a Candelaria
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
            {TESTIMONIOS_REALES.map((item) => (
              <blockquote
                key={item.id}
                className="rounded-2xl bg-white dark:bg-stone-900 border border-earth-900/10 dark:border-white/10 p-5 sm:p-6 shadow-xs flex flex-col"
              >
                <Quote
                  className="w-5 h-5 text-green-700/50 mb-2.5 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-sm sm:text-base italic text-foreground/85 leading-relaxed flex-1">
                  «{item.texto}»
                </p>
                <footer className="mt-3 pt-3 border-t border-earth-900/8 dark:border-white/8 text-xs font-medium text-muted-foreground">
                  {item.etiqueta}
                </footer>
              </blockquote>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================
          SECCIÓN DEL CURSO CON CANDELARIA DOMÍNGUEZ
         ================================================================ */}
      <section id="curso-jardin-mariposas" className="py-12 sm:py-16 scroll-mt-24">
        <Container>
          <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-earth-900/15 dark:border-white/12 bg-white dark:bg-stone-900 shadow-lg">
            {/* Encabezado docente + título */}
            <div className="bg-gradient-to-r from-[#224e3a] to-[#2d6a4f] text-white p-6 sm:p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl overflow-hidden border-2 border-white/40 shadow-md">
                  <Image
                    src={CURSO_INFO.docente.fotoUrl}
                    alt="Candelaria Domínguez entre flores nativas"
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-[#eef7f2] mb-2.5">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    Arranca el {CURSO_INFO.fechas.inicio} · Cupos limitados en práctica
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold leading-tight">
                    ¿Querés armar tu jardín paso a paso con{" "}
                    {CURSO_INFO.docente.nombre}?
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-[#e3f1e9] leading-relaxed">
                    {CURSO_INFO.docente.credenciales}
                  </p>
                </div>
              </div>
            </div>

            {/* Cuerpo: cronograma + precios + beneficio grupal */}
            <div className="p-6 sm:p-8 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Columna izquierda: cómo es el curso */}
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-earth-900 dark:text-stone-100 mb-3">
                      {CURSO_INFO.nombre}
                    </h3>
                    <div className="space-y-2 text-sm sm:text-base text-foreground/85">
                      <p className="flex items-start gap-2.5">
                        <Calendar
                          className="w-5 h-5 text-green-700 dark:text-emerald-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{CURSO_INFO.fechas.clasesZoom}</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="w-5 h-5 text-green-700 dark:text-emerald-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{CURSO_INFO.fechas.reenganche}</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <MapPin
                          className="w-5 h-5 text-green-700 dark:text-emerald-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{CURSO_INFO.fechas.practica}</span>
                      </p>
                      <p className="flex items-start gap-2.5">
                        <Award
                          className="w-5 h-5 text-green-700 dark:text-emerald-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{CURSO_INFO.certificacion}</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#faf6f1] dark:bg-stone-800/60 border border-earth-900/10 dark:border-white/10 p-4 sm:p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-earth-900 dark:text-stone-200 mb-3">
                      Qué vas a ver clase a clase
                    </p>
                    <ul className="space-y-2.5">
                      {CURSO_INFO.modulos.map((mod) => (
                        <li
                          key={mod}
                          className="text-sm text-foreground/85 flex items-start gap-2 leading-snug"
                        >
                          <Sprout
                            className="w-4 h-4 text-green-700 dark:text-emerald-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Video opcional de invitación al curso */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setMostrarVideoCurso((prev) => !prev)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <Play className="w-4 h-4" aria-hidden="true" />
                      {mostrarVideoCurso
                        ? "Ocultar video de invitación"
                        : `Escuchar a Candelaria explicar el curso (${VIDEOS_CANDELARIA.invitacionCurso.duracion})`}
                    </button>

                    {mostrarVideoCurso && (
                      <div className="mt-4 max-w-[280px] rounded-2xl overflow-hidden bg-black shadow-md border border-earth-900/15">
                        <div className="relative aspect-[9/16] w-full">
                          <video
                            controls
                            playsInline
                            preload="none"
                            poster={VIDEOS_CANDELARIA.invitacionCurso.posterUrl}
                            src={VIDEOS_CANDELARIA.invitacionCurso.url}
                            controlsList="nodownload"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna derecha: precios, beneficio grupal 10% y CTAs */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`rounded-2xl border-2 p-4 ${
                        !esInterior
                          ? "border-green-700 bg-green-700/6 dark:bg-emerald-950/35"
                          : "border-earth-900/12 dark:border-white/12"
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Completo
                      </p>
                      <p className="font-heading text-2xl sm:text-3xl font-bold text-earth-900 dark:text-stone-100 mt-1">
                        $4.000
                      </p>
                      <p className="text-xs text-foreground/75 mt-1 leading-snug">
                        3 Zoom grabadas + práctica 12/12 en Maldonado
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl border-2 p-4 relative ${
                        esInterior
                          ? "border-green-700 bg-green-700/6 dark:bg-emerald-950/35"
                          : "border-earth-900/12 dark:border-white/12"
                      }`}
                    >
                      {esInterior && (
                        <span className="absolute -top-2.5 right-3 rounded-full bg-green-700 text-white text-[10px] font-bold px-2 py-0.5">
                          Ideal Interior
                        </span>
                      )}
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Solo virtual
                      </p>
                      <p className="font-heading text-2xl sm:text-3xl font-bold text-earth-900 dark:text-stone-100 mt-1">
                        $3.500
                      </p>
                      <p className="text-xs text-foreground/75 mt-1 leading-snug">
                        Las mismas 3 clases en vivo por Zoom + grabaciones
                      </p>
                    </div>
                  </div>

                  {/* Beneficio grupal 10% OFF autorizado por Franco */}
                  <div className="rounded-2xl border-2 border-[#c75b39]/35 bg-[#fff7f2] dark:bg-stone-800/90 p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-[#b84624] dark:text-[#ff9c7d] text-xs font-bold uppercase tracking-wider mb-1.5">
                      <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                      Beneficio grupal · 10% de descuento
                    </div>
                    <p className="text-sm sm:text-base font-medium text-earth-900 dark:text-stone-100 leading-snug">
                      {CURSO_INFO.precios.grupalTexto}
                    </p>
                  </div>

                  {/* CTA principal hacia /cursos/jardin-de-mariposas */}
                  <Link
                    href={cursoHrefGlobal}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 hover:bg-[#23543e] text-white font-bold text-base px-6 py-4 shadow-md transition"
                  >
                    {resultado
                      ? resultado.cursoBotonLabel
                      : "Ver el curso completo e inscribirme"}
                    <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                  </Link>

                  <a
                    href={whatsappGrupalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-earth-900/20 dark:border-white/15 bg-white dark:bg-stone-800 hover:bg-cream dark:hover:bg-stone-700 text-earth-900 dark:text-stone-100 font-semibold text-sm px-4 py-3 transition"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#169c46] shrink-0" />
                    Consultar descuento grupal (2×10%) por WhatsApp
                  </a>

                  <p className="text-xs text-muted-foreground text-center leading-snug">
                    Un solo pago por transferencia, Mercado Pago, Abitab o
                    RedPagos. Podés cancelar antes del inicio con devolución
                    total.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================
          DIRECTORIO ABIERTO: DÓNDE CONSEGUIR PLANTAS NATIVAS EN URUGUAY
         ================================================================ */}
      <section
        id="viveros-uruguay"
        className="py-12 sm:py-16 bg-[#faf6f1] dark:bg-stone-950/60 border-t border-earth-900/10 dark:border-white/10 scroll-mt-24"
      >
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-700/12 text-green-800 dark:text-emerald-300 px-3 py-1 text-xs font-semibold mb-3">
              <Sprout className="w-3.5 h-3.5" aria-hidden="true" />
              Directorio abierto y verificado · {VIVEROS_URUGUAY.length} viveros
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-earth-900 dark:text-stone-100">
              Dónde conseguir plantas nativas en Uruguay
            </h2>
            <p className="mt-3 text-sm sm:text-base text-foreground/80 leading-relaxed">
              Como pide Candelaria, elegí siempre{" "}
              <strong className="font-semibold text-earth-900 dark:text-stone-100">
                adquisición ética en viveros que propagan flora localmente
              </strong>{" "}
              y nunca arranques ejemplares del monte silvestre (dañan el
              ecosistema y casi nunca sobreviven al trasplante en flor).
            </p>
          </div>

          {/* Filtros por departamento */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 mb-8"
            role="tablist"
            aria-label="Filtrar viveros por departamento"
          >
            {DEPARTAMENTOS_FILTRO.map((depto) => {
              const active = filtroDepto === depto;
              return (
                <button
                  key={depto}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setFiltroManual(true);
                    setFiltroDepto(depto);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    active
                      ? "bg-green-700 text-white shadow-xs"
                      : "bg-white dark:bg-stone-900 text-earth-900 dark:text-stone-200 border border-earth-900/15 dark:border-white/15 hover:border-green-700"
                  }`}
                >
                  <span>{depto}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-muted-foreground"
                    }`}
                  >
                    {conteosPorFiltro[depto]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tarjetas de viveros verificados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {viverosFiltrados.map((vivero) => {
              const igHandle = vivero.instagram
                ? vivero.instagram.replace(/^@/, "")
                : null;
              const telHref = vivero.telefono
                ? `tel:${vivero.telefono.replace(/[^\d+]/g, "")}`
                : null;

              return (
                <article
                  key={`${vivero.departamento}-${vivero.nombre}`}
                  className="rounded-2xl bg-white dark:bg-stone-900 border border-earth-900/12 dark:border-white/10 p-5 shadow-xs flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-heading text-lg font-bold text-earth-900 dark:text-stone-100 leading-snug">
                      {vivero.nombre}
                    </h3>
                    <span className="shrink-0 rounded-full bg-green-700/10 text-green-800 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5">
                      {vivero.departamento}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-muted-foreground flex items-start gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-700 dark:text-emerald-400" aria-hidden="true" />
                    <span>{vivero.zona}</span>
                  </p>

                  <p className="text-sm text-foreground/80 leading-relaxed mb-4 flex-1">
                    {vivero.especialidad}
                  </p>

                  <div className="pt-3 border-t border-earth-900/8 dark:border-white/8 flex flex-wrap gap-2">
                    {igHandle && (
                      <a
                        href={`https://www.instagram.com/${igHandle}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#faf6f1] dark:bg-stone-800 hover:bg-green-700/10 px-2.5 py-1.5 text-xs font-semibold text-earth-900 dark:text-stone-100 transition"
                      >
                        <Instagram className="w-3.5 h-3.5 text-[#c75b39]" aria-hidden="true" />
                        {vivero.instagram}
                      </a>
                    )}
                    {vivero.web && (
                      <a
                        href={vivero.web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#faf6f1] dark:bg-stone-800 hover:bg-green-700/10 px-2.5 py-1.5 text-xs font-semibold text-earth-900 dark:text-stone-100 transition"
                      >
                        <Globe className="w-3.5 h-3.5 text-green-700 dark:text-emerald-400" aria-hidden="true" />
                        Web
                        <ExternalLink className="w-3 h-3 opacity-60" aria-hidden="true" />
                      </a>
                    )}
                    {telHref && vivero.telefono && (
                      <a
                        href={telHref}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#faf6f1] dark:bg-stone-800 hover:bg-green-700/10 px-2.5 py-1.5 text-xs font-semibold text-earth-900 dark:text-stone-100 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-green-700 dark:text-emerald-400" aria-hidden="true" />
                        {vivero.telefono}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Respaldo científico mencionado en la charla: investigaciones sobre
            lepidópteros del Uruguay de la Dra. Gabriela Bentancur-Viglione
            (Facultad de Ciencias, UdelaR). Consultá siempre disponibilidad de
            especies nativas por temporada antes de visitar cada vivero.
          </p>
        </Container>
      </section>
    </div>
  );
}
