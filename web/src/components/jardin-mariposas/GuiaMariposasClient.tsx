"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Flower,
  Flower2,
  Globe,
  Grid2x2,
  Instagram,
  Leaf,
  MapPin,
  Phone,
  RotateCcw,
  Sprout,
  Tractor,
  TreePine,
  Waves,
  Sun,
} from "lucide-react";
import { trackEvent } from "@/app/actions/analytics";
import { MomentoPlayer } from "@/components/jardin-mariposas/MomentoPlayer";
import { TarjetaCompartir } from "@/components/jardin-mariposas/TarjetaCompartir";
import {
  CURSO,
  ESPACIOS,
  ESTADOS,
  FOTOS,
  TESTIMONIOS,
  ZONAS,
  armarResultado,
  buildWhatsAppLink,
  cld,
  enlaceCurso,
  faseInscripcion,
  limpiarOrigen,
  mensajeDeADos,
  mensajeGeneral,
  mensajeResultado,
  type EspacioId,
  type EstadoActualId,
  type FaseInscripcion,
  type MariposaEspecie,
  type ResultadoGuia,
  type ZonaId,
} from "@/data/jardin-mariposas-guia";
import { GRABACION_CHARLA_URL, MOMENTOS, type MomentoId } from "@/data/jardin-mariposas-momentos";
import { GRUPOS_VIVEROS, VIVEROS_URUGUAY, type GrupoVivero, type ViveroUruguay } from "@/data/jardin-mariposas-viveros";

/* ------------------------------------------------------------------ medición */

function asegurarSesion() {
  if (typeof document === "undefined") return;
  if (document.cookie.split("; ").some((c) => c.startsWith("ceuta_analytics_sid="))) return;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const vence = new Date(Date.now() + 30 * 864e5).toUTCString();
  document.cookie = `ceuta_analytics_sid=${id}; expires=${vence}; path=/; SameSite=Lax`;
}

function registrar(nombre: string, origen: string | null, metadata: Record<string, unknown> = {}) {
  try {
    asegurarSesion();
    void trackEvent(nombre, {
      category: "guia_mariposas",
      pagePath: "/tu-jardin-de-mariposas",
      metadata: { origen, ...metadata },
      utm: { source: origen, medium: "guia", campaign: "jardines-nov-2026" },
    }).catch(() => undefined);
  } catch {
    /* la medición nunca rompe la página */
  }
}

function pixel(evento: string, params: Record<string, unknown> = {}, propio = false) {
  try {
    const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
    if (typeof fbq === "function") fbq(propio ? "trackCustom" : "track", evento, params);
  } catch {
    /* nada */
  }
}

/* ------------------------------------------------------------------ piezas */

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.272-.57-.421m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function Etiqueta({ children, clara = false }: { children: React.ReactNode; clara?: boolean }) {
  return (
    <p
      className={`font-mono text-[11px] uppercase tracking-[0.16em] ${clara ? "text-[#e9d9a8]" : "text-[#b0502a]"}`}
    >
      {children}
    </p>
  );
}

const ICONO_ZONA: Record<ZonaId, React.ReactNode> = {
  montevideo: <Building2 className="h-5 w-5" />,
  "canelones-costa": <Waves className="h-5 w-5" />,
  "maldonado-este": <Sun className="h-5 w-5" />,
  interior: <MapPin className="h-5 w-5" />,
};
const ICONO_ESPACIO: Record<EspacioId, React.ReactNode> = {
  balcon: <Flower2 className="h-5 w-5" />,
  "patio-chico": <Sprout className="h-5 w-5" />,
  "jardin-grande": <TreePine className="h-5 w-5" />,
  "chacra-escuela": <Tractor className="h-5 w-5" />,
};
const ICONO_ESTADO: Record<EstadoActualId, React.ReactNode> = {
  "pasto-baldosa": <Grid2x2 className="h-5 w-5" />,
  "flores-vivero": <Flower className="h-5 w-5" />,
  "muchas-plantas": <Leaf className="h-5 w-5" />,
};

function Opcion({
  label,
  detalle,
  icono,
  elegida,
  onClick,
}: {
  label: string;
  detalle: string;
  icono: React.ReactNode;
  elegida: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={elegida}
      className={`group flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition active:scale-[0.99] cursor-pointer ${
        elegida
          ? "border-[#1f3a2c] bg-[#1f3a2c] text-white"
          : "border-[#ddd3c3] bg-white text-[#1e1b16] hover:border-[#1f3a2c]/50 hover:bg-[#fbf8f2]"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          elegida ? "bg-white/15 text-white" : "bg-[#f1eadc] text-[#1f3a2c]"
        }`}
      >
        {elegida ? <Check className="h-5 w-5" /> : icono}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16.5px] font-semibold leading-tight">{label}</span>
        <span className={`mt-0.5 block text-[13.5px] leading-snug ${elegida ? "text-white/75" : "text-[#6b6357]"}`}>
          {detalle}
        </span>
      </span>
      <ChevronRight className={`h-5 w-5 shrink-0 ${elegida ? "text-white/70" : "text-[#b9ad99]"}`} />
    </button>
  );
}

function FichaMariposa({ m, n }: { m: MariposaEspecie; n: number }) {
  return (
    <article className="flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#ddd3c3] bg-white sm:w-auto">
      {m.foto ? (
        <div className="relative aspect-[4/3] bg-[#e7dfd0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cld(m.foto.url, 640, 480)}
            alt={m.foto.alt}
            loading="lazy"
            decoding="async"
            width={640}
            height={480}
            className="h-full w-full object-cover"
          />
          {m.foto.credito && (
            <span className="absolute bottom-2 left-2 rounded bg-black/55 px-2 py-0.5 text-[11px] text-white">
              {m.foto.credito}
            </span>
          )}
        </div>
      ) : (
        <div
          className="relative flex aspect-[4/3] flex-col justify-end p-4"
          style={{ background: `linear-gradient(140deg, ${m.colores[2]} 0%, #f6f1e7 70%)` }}
        >
          <span className="font-serif text-[22px] italic leading-tight" style={{ color: m.colores[1] }}>
            {m.cientifico}
          </span>
          <span className="mt-3 flex items-center gap-1.5" aria-hidden="true">
            {m.colores.map((c) => (
              <span key={c} className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: c }} />
            ))}
            <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b6357]">colores de sus alas</span>
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#b0502a]">Mariposa {n}</p>
        <h4 className="mt-1 font-serif text-[21px] font-bold leading-tight text-[#1e1b16]">{m.nombre}</h4>
        {m.foto && <p className="font-serif text-[14px] italic text-[#6b6357]">{m.cientifico}</p>}
        <dl className="mt-3 space-y-2 text-[14.5px] leading-snug">
          <div>
            <dt className="font-semibold text-[#1f3a2c]">Nace en</dt>
            <dd className="text-[#3d372f]">{m.hospederas.map((h) => h.nombre).join(", ")}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1f3a2c]">Come de</dt>
            <dd className="text-[#3d372f]">{m.nectar.join(", ")}</dd>
          </div>
        </dl>
        <blockquote className="mt-3 border-l-2 border-[#b0502a]/50 pl-3 font-serif text-[14.5px] italic leading-snug text-[#3d372f]">
          «{m.cita.texto}»
          <span className="mt-1 block not-italic font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8174]">
            Candelaria · minuto {m.cita.minuto}
          </span>
        </blockquote>
      </div>
    </article>
  );
}

function TarjetaVivero({ v }: { v: ViveroUruguay }) {
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.nombre} ${v.zona} ${v.departamento} Uruguay`)}`;
  const tel = v.telefono ? `tel:${v.telefono.replace(/[^\d+]/g, "").replace(/^(\d{8})$/, "+598$1")}` : null;
  return (
    <li className="rounded-2xl border border-[#ddd3c3] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-semibold leading-tight text-[#1e1b16]">{v.nombre}</h4>
          <p className="mt-0.5 text-[13px] text-[#6b6357]">
            {v.zona} · {v.departamento}
          </p>
        </div>
        {v.nativas && (
          <span className="shrink-0 rounded-full bg-[#e3ecdf] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#1f3a2c]">
            Nativas
          </span>
        )}
      </div>
      <p className="mt-2 text-[13.5px] leading-snug text-[#3d372f]">{v.especialidad}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
        {v.instagram && (
          <a
            href={`https://instagram.com/${v.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-[#ddd3c3] px-2.5 py-1 text-[#1e1b16] hover:bg-[#fbf8f2]"
          >
            <Instagram className="h-3.5 w-3.5" /> {v.instagram}
          </a>
        )}
        {v.web && (
          <a
            href={v.web}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-[#ddd3c3] px-2.5 py-1 text-[#1e1b16] hover:bg-[#fbf8f2]"
          >
            <Globe className="h-3.5 w-3.5" /> Web
          </a>
        )}
        {tel && (
          <a
            href={tel}
            className="inline-flex items-center gap-1 rounded-full border border-[#ddd3c3] px-2.5 py-1 text-[#1e1b16] hover:bg-[#fbf8f2]"
          >
            <Phone className="h-3.5 w-3.5" /> {v.telefono}
          </a>
        )}
        <a
          href={mapa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-[#ddd3c3] px-2.5 py-1 text-[#1e1b16] hover:bg-[#fbf8f2]"
        >
          <MapPin className="h-3.5 w-3.5" /> Cómo llegar
        </a>
      </div>
    </li>
  );
}

function precio(n: number) {
  return `$ ${n.toLocaleString("es-UY")}`;
}

const TEXTO_FASE: Record<FaseInscripcion, { linea: string; boton: string }> = {
  abierta: { linea: "Inscripciones abiertas hasta el lunes 23. Arranca el miércoles 25 a las 19:00.", boton: "Quiero anotarme" },
  "por-arrancar": { linea: "Arranca este miércoles 25 a las 19:00, por Zoom.", boton: "Quiero anotarme" },
  reenganche: {
    linea: "Ya arrancó: todavía podés sumarte hasta el miércoles 2/12, porque la primera clase quedó grabada.",
    boton: "Quiero sumarme",
  },
  cerrada: { linea: "Esta edición ya está en marcha. Escribinos y te avisamos de la próxima.", boton: "Ver el curso" },
};

/* ------------------------------------------------------------------ página */

export function GuiaMariposasClient() {
  const [origen, setOrigen] = useState<string | null>(null);
  const [zonaId, setZonaId] = useState<ZonaId | null>(null);
  const [espacioId, setEspacioId] = useState<EspacioId | null>(null);
  const [estadoId, setEstadoId] = useState<EstadoActualId | null>(null);
  const [paso, setPaso] = useState<0 | 1 | 2>(0);
  const [fase, setFase] = useState<FaseInscripcion>("abierta");
  const [flotante, setFlotante] = useState(false);
  const [grupo, setGrupo] = useState<GrupoVivero | "Todos">("Todos");
  const [verTodosViveros, setVerTodosViveros] = useState(false);
  const resultadoRef = useRef<HTMLDivElement | null>(null);
  const quizRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const o = limpiarOrigen(p.get("origen") ?? p.get("utm_source"));
    setOrigen(o);
    setFase(faseInscripcion());
    const z = p.get("zona") as ZonaId | null;
    const e = p.get("espacio") as EspacioId | null;
    const h = p.get("estado") as EstadoActualId | null;
    if (z && e && h && ZONAS.some((x) => x.id === z) && ESPACIOS.some((x) => x.id === e) && ESTADOS.some((x) => x.id === h)) {
      setZonaId(z);
      setEspacioId(e);
      setEstadoId(h);
      const g = ZONAS.find((x) => x.id === z)?.grupoViveros;
      if (g) setGrupo(g);
    }
    registrar("guia_vista", o, { referrer: document.referrer.slice(0, 120) });
    const onScroll = () => setFlotante(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resultado: ResultadoGuia | null = useMemo(
    () => (zonaId && espacioId && estadoId ? armarResultado(zonaId, espacioId, estadoId) : null),
    [zonaId, espacioId, estadoId]
  );

  // El flotante se esconde mientras se ve un botón grande de WhatsApp o del curso.
  const [ctaVisible, setCtaVisible] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visibles = new Set<Element>();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target)));
        setCtaVisible(visibles.size > 0);
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll("[data-cta]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [resultado]);

  const elegirZona = (id: ZonaId) => {
    setZonaId(id);
    const g = ZONAS.find((x) => x.id === id)?.grupoViveros;
    setGrupo(g ?? "Todos");
    registrar("guia_respuesta", origen, { paso: 1, zona: id });
    window.setTimeout(() => setPaso(1), 160);
  };
  const elegirEspacio = (id: EspacioId) => {
    setEspacioId(id);
    registrar("guia_respuesta", origen, { paso: 2, espacio: id });
    window.setTimeout(() => setPaso(2), 160);
  };
  const elegirEstado = (id: EstadoActualId) => {
    setEstadoId(id);
    if (!zonaId || !espacioId) return;
    registrar("guia_resultado", origen, { zona: zonaId, espacio: espacioId, estado: id });
    pixel("GuiaResultado", { zona: zonaId, espacio: espacioId, estado: id }, true);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("zona", zonaId);
      u.searchParams.set("espacio", espacioId);
      u.searchParams.set("estado", id);
      window.history.replaceState(null, "", u.toString());
    } catch {
      /* nada */
    }
    window.setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };
  const reiniciar = () => {
    setZonaId(null);
    setEspacioId(null);
    setEstadoId(null);
    setPaso(0);
    try {
      const u = new URL(window.location.href);
      ["zona", "espacio", "estado"].forEach((k) => u.searchParams.delete(k));
      window.history.replaceState(null, "", u.toString());
    } catch {
      /* nada */
    }
    window.setTimeout(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const onVideo = useCallback(
    (nombre: "play" | "fin", id: string) => registrar(nombre === "play" ? "guia_video_play" : "guia_video_fin", origen, { momento: id }),
    [origen]
  );

  const clickWhatsApp = (lugar: string) => {
    registrar("guia_click_whatsapp", origen, {
      lugar,
      zona: zonaId,
      espacio: espacioId,
      estado: estadoId,
    });
    pixel("Contact", { content_name: "guia_mariposas", lugar });
  };
  const clickCurso = (lugar: string) => {
    registrar("guia_click_curso", origen, { lugar, zona: zonaId, espacio: espacioId, estado: estadoId });
    pixel("ViewContent", { content_name: "curso_jardin_de_mariposas", lugar });
  };

  const waResultado = buildWhatsAppLink(resultado ? mensajeResultado(resultado, origen) : mensajeGeneral(origen));
  const waDeADos = buildWhatsAppLink(mensajeDeADos(origen));
  const soloVirtualSugerido = resultado?.zona.id === "interior";
  const textoFase = TEXTO_FASE[fase];

  const momentosVistos = new Set<MomentoId>(
    resultado ? [resultado.momentoPrincipal.id, resultado.momentoSegundo.id, "planta-de-la-monarca", "el-curso"] : ["el-curso"]
  );
  const otrosMomentos = (Object.keys(MOMENTOS) as MomentoId[]).filter((id) => !momentosVistos.has(id));

  const viverosFiltrados = VIVEROS_URUGUAY.filter((v) => grupo === "Todos" || v.grupoFiltro === grupo);
  const viverosVisibles = verTodosViveros ? viverosFiltrados : viverosFiltrados.slice(0, 4);

  const preguntas = [
    { titulo: "¿Dónde está tu lugar?", hint: "Para recomendarte viveros cerca y decirte si la práctica te queda a mano." },
    { titulo: "¿Qué espacio tenés?", hint: "Sirve cualquier tamaño, hasta unas macetas." },
    { titulo: "¿Cómo está hoy?", hint: "Así sabemos por dónde arrancar." },
  ];

  return (
    <div className="bg-[#f4efe6] text-[#1e1b16]">
      {/* ======================== ENTRADA Y PREGUNTAS ======================== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-7 sm:px-6 sm:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-16 lg:pt-14">
          <div>
            <Etiqueta>Guía gratis · 30 segundos</Etiqueta>
            <h1 className="mt-3 font-serif text-[34px] font-bold leading-[1.08] tracking-[-0.01em] sm:text-5xl">
              ¿Qué mariposas pueden <em className="font-serif italic text-[#b0502a]">nacer</em> en tu casa?
            </h1>
            <p className="mt-3 max-w-xl text-[16.5px] leading-relaxed text-[#4a443a] sm:text-lg">
              Tres preguntas y te armamos tu plan con lo que explicó{" "}
              <strong className="font-semibold text-[#1e1b16]">Candelaria Domínguez</strong> en su charla: qué mariposas,
              qué plantas y dónde conseguirlas.
            </p>

            {/* Preguntas o resumen */}
            <div ref={quizRef} className="mt-6 scroll-mt-24">
              {!resultado ? (
                <div className="rounded-3xl border border-[#ddd3c3] bg-[#fbf8f2] p-4 shadow-[0_16px_40px_-24px_rgba(30,27,22,0.35)] sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6b6357]">
                      Pregunta {paso + 1} de 3
                    </span>
                    {paso > 0 && (
                      <button
                        type="button"
                        onClick={() => setPaso((p) => (p > 0 ? ((p - 1) as 0 | 1) : p))}
                        className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1f3a2c] cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" /> Volver
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1.5" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={`h-1.5 rounded-full ${i <= paso ? "bg-[#1f3a2c]" : "bg-[#e2d9c9]"}`} />
                    ))}
                  </div>
                  <h2 className="mt-4 font-serif text-[24px] font-bold leading-tight sm:text-[28px]">{preguntas[paso].titulo}</h2>
                  <p className="mt-1 text-[14px] text-[#6b6357]">{preguntas[paso].hint}</p>
                  <div className="mt-4 grid gap-2.5" key={paso}>
                    {paso === 0 &&
                      ZONAS.map((z) => (
                        <Opcion
                          key={z.id}
                          label={z.label}
                          detalle={z.detalle}
                          icono={ICONO_ZONA[z.id]}
                          elegida={zonaId === z.id}
                          onClick={() => elegirZona(z.id)}
                        />
                      ))}
                    {paso === 1 &&
                      ESPACIOS.map((e) => (
                        <Opcion
                          key={e.id}
                          label={e.label}
                          detalle={e.detalle}
                          icono={ICONO_ESPACIO[e.id]}
                          elegida={espacioId === e.id}
                          onClick={() => elegirEspacio(e.id)}
                        />
                      ))}
                    {paso === 2 &&
                      ESTADOS.map((s) => (
                        <Opcion
                          key={s.id}
                          label={s.label}
                          detalle={s.detalle}
                          icono={ICONO_ESTADO[s.id]}
                          elegida={estadoId === s.id}
                          onClick={() => elegirEstado(s.id)}
                        />
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#ddd3c3] bg-[#fbf8f2] p-3">
                  {[resultado.zona.label, resultado.espacio.label, resultado.estado.label].map((t) => (
                    <span key={t} className="rounded-full bg-[#1f3a2c] px-3 py-1 text-[13px] font-medium text-white">
                      {t}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={reiniciar}
                    className="ml-auto inline-flex items-center gap-1 text-[13px] font-medium text-[#1f3a2c] cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Cambiar
                  </button>
                </div>
              )}
            </div>
            <p className="mt-4 text-[13.5px] text-[#6b6357]">
              Más de cien personas escucharon a Candelaria en vivo el miércoles 18. Esto es lo que contó.
            </p>
            {!resultado && (
              <figure className="mt-6 lg:hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cld(FOTOS.jardinCandelaria, 750, 560)}
                  alt="Una mariposa cuatro ojos sobre la mariposera, en el jardín de Candelaria"
                  width={750}
                  height={560}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full rounded-2xl object-cover"
                />
                <figcaption className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6b6357]">
                  Una cuatro ojos en la mariposera · foto de Candelaria en su jardín
                </figcaption>
              </figure>
            )}
          </div>

          {/* Foto real: el jardín de Candelaria */}
          <figure className="relative hidden lg:block">
            <div className="overflow-hidden rounded-[28px] shadow-[0_30px_60px_-30px_rgba(30,27,22,0.55)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cld(FOTOS.jardinCandelaria, 832)}
                alt="Una mariposa cuatro ojos sobre la mariposera, en el jardín de Candelaria"
                width={832}
                height={900}
                className="h-auto w-full object-cover"
                fetchPriority="high"
              />
            </div>
            <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#6b6357]">
              Una cuatro ojos en la mariposera · foto de Candelaria en su jardín
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ======================== RESULTADO ======================== */}
      {resultado && (
        <section ref={resultadoRef} className="scroll-mt-20 border-t border-[#ddd3c3] bg-[#fbf8f2]">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
            <Etiqueta>Tu plan para {resultado.espacio.tituloPlan}</Etiqueta>
            <h2 className="mt-2 font-serif text-[30px] font-bold leading-[1.1] sm:text-4xl">{resultado.estado.diagnostico}</h2>
            <p className="mt-3 text-[16.5px] leading-relaxed text-[#3d372f]">{resultado.estado.explicacion}</p>
            <blockquote className="mt-5 rounded-2xl bg-[#f1eadc] px-5 py-4 font-serif text-[18px] italic leading-snug text-[#1e1b16]">
              «{resultado.estado.cita.texto}»
              <span className="mt-2 block not-italic font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#8a8174]">
                Candelaria Domínguez · minuto {resultado.estado.cita.minuto} de la charla
              </span>
            </blockquote>

            <div className="mt-6">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#6b6357]">Escuchala explicarlo</p>
              <MomentoPlayer momento={resultado.momentoPrincipal} onEvento={onVideo} />
            </div>

            {/* Mariposas */}
            <div className="mt-12">
              <Etiqueta>Tus tres mariposas</Etiqueta>
              <h3 className="mt-2 font-serif text-[26px] font-bold leading-tight">
                Las que pueden nacer en {resultado.espacio.tituloPlan}
              </h3>
              <p className="mt-2 text-[15px] text-[#4a443a]">
                Cada una necesita su planta hospedera: es la única que comen sus orugas. Deslizá para verlas.
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-5xl">
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {resultado.mariposas.map((m, i) => (
                <FichaMariposa key={m.id} m={m} n={i + 1} />
              ))}
            </div>
          </div>

          <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
            {/* Lista de plantas */}
            <div className="mt-10">
              <Etiqueta>Tu lista de plantas</Etiqueta>
              <h3 className="mt-2 font-serif text-[26px] font-bold leading-tight">Lo que tenés que conseguir</h3>
              <ol className="mt-4 divide-y divide-[#e5dccd] overflow-hidden rounded-2xl border border-[#ddd3c3] bg-white">
                {resultado.plantas.map((p, i) => (
                  <li key={p.nombre} className="flex gap-3 p-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1f3a2c] font-mono text-[12px] text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">
                        {p.nombre}{" "}
                        <span className="font-serif text-[14px] font-normal italic text-[#6b6357]">{p.cientifico}</span>
                      </p>
                      <p className="mt-1 text-[14px] text-[#3d372f]">
                        <span
                          className={`mr-1.5 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
                            p.tipo === "nectar"
                              ? "bg-[#f6e6c9] text-[#7a5212]"
                              : p.tipo === "las-dos"
                                ? "bg-[#efdcd3] text-[#8a3a1c]"
                                : "bg-[#e3ecdf] text-[#1f3a2c]"
                          }`}
                        >
                          {p.tipo === "nectar" ? "Néctar" : p.tipo === "las-dos" ? "Casa y néctar" : "Hospedera"}
                        </span>
                        para {p.para}
                      </p>
                      {p.nota && <p className="mt-1 text-[13.5px] text-[#6b6357]">{p.nota}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Primer paso */}
            <div className="mt-6 rounded-2xl bg-[#1f3a2c] p-5 text-white">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#e9d9a8]">Tu primer paso</p>
              <p className="mt-2 font-serif text-[19px] leading-snug">{resultado.estado.primerPaso}</p>
              <p className="mt-3 text-[14px] text-white/75">{resultado.zona.notaLugar}</p>
            </div>

            {/* Guardar por WhatsApp */}
            <div data-cta className="mt-8 rounded-3xl border border-[#cfe3d3] bg-[#eef6ef] p-5 sm:p-6">
              <h3 className="font-serif text-[23px] font-bold leading-tight">Guardá tu plan en tu WhatsApp</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#3d372f]">
                Te queda escrito en el chat con tus mariposas y tus plantas, y te contamos cómo es el curso con Candelaria.
              </p>
              <a
                href={waResultado}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => clickWhatsApp("resultado")}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d9f52] px-4 py-4 text-[16.5px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(29,159,82,0.9)] transition hover:bg-[#188a46] active:scale-[0.99]"
              >
                <WhatsAppIcon /> Mandarme el plan por WhatsApp
              </a>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <TarjetaCompartir
                  resultado={resultado}
                  onEvento={(forma) => registrar("guia_compartir", origen, { forma })}
                />
                <a
                  href={enlaceCurso(origen, soloVirtualSugerido)}
                  onClick={() => clickCurso("resultado")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e1b16]/15 bg-white px-4 py-3.5 text-[15px] font-semibold text-[#1e1b16] transition hover:bg-[#fbf8f2]"
                >
                  Ver el curso <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Antes de comprar */}
            <div className="mt-10">
              <div className="flex items-start gap-3 rounded-2xl border border-[#e8c9b8] bg-[#fbefe8] p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#b0502a]" />
                <div>
                  <p className="font-semibold text-[#7c3518]">Antes de ir al vivero</p>
                  <p className="mt-1 text-[14.5px] leading-snug text-[#3d372f]">
                    La asclepia roja y naranja que se vende «para la monarca» es exótica y la puede enfermar. Pedí la yerba de
                    la víbora, la nativa de flor blanca. Y la Lantana camara también es exótica.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <MomentoPlayer momento={MOMENTOS["planta-de-la-monarca"]} compacto onEvento={onVideo} />
              </div>
            </div>

            {/* Segundo momento, para su espacio */}
            <div className="mt-10">
              <Etiqueta>Para {resultado.espacio.tituloPlan}</Etiqueta>
              <h3 className="mt-2 font-serif text-[24px] font-bold leading-tight">{resultado.momentoSegundo.titulo}</h3>
              <p className="mt-1 text-[15px] text-[#4a443a]">{resultado.momentoSegundo.bajada}</p>
              <div className="mt-4">
                <MomentoPlayer momento={resultado.momentoSegundo} compacto onEvento={onVideo} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================== EL CURSO ======================== */}
      <section id="curso" className="scroll-mt-20 bg-[#1f3a2c] text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <Etiqueta clara>El curso · {CURSO.nombre}</Etiqueta>
          <h2 className="mt-3 max-w-2xl font-serif text-[30px] font-bold leading-[1.1] sm:text-[40px]">
            Armá tu jardín de mariposas <em className="italic text-[#f0c987]">con ella</em>, en tres clases
          </h2>
          <p className="mt-3 max-w-2xl rounded-xl bg-white/10 px-4 py-3 text-[15.5px] text-white/90">{textoFase.linea}</p>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cld(FOTOS.candelaria, 160, 160)}
                  alt="Candelaria Domínguez"
                  width={80}
                  height={80}
                  loading="lazy"
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-white/20"
                />
                <div>
                  <p className="font-serif text-xl font-bold">{CURSO.docente}</p>
                  <p className="text-[14px] leading-snug text-white/75">{CURSO.credencial}</p>
                </div>
              </div>
              <div className="mt-5">
                <MomentoPlayer momento={MOMENTOS["el-curso"]} compacto etiqueta="Ella cuenta el curso" onEvento={onVideo} />
              </div>
            </div>

            <div>
              <ol className="space-y-3">
                {CURSO.clases.map((c, i) => (
                  <li key={c.fecha} className="rounded-2xl bg-white/[0.07] p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#e9d9a8]">
                      Clase {i + 1} · {c.fecha}
                    </p>
                    <p className="mt-1 text-[15.5px] leading-snug">{c.tema}</p>
                  </li>
                ))}
                <li className="rounded-2xl border border-[#f0c987]/40 bg-[#f0c987]/10 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#f0c987]">Práctica opcional</p>
                  <p className="mt-1 text-[15.5px] leading-snug">{CURSO.practica}</p>
                </li>
              </ol>
              <p className="mt-3 text-[14px] text-white/75">
                {CURSO.horario} {CURSO.grupo}
              </p>
            </div>
          </div>

          {/* Precios */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              {
                id: "completo",
                titulo: "Completo",
                monto: CURSO.precios.completo,
                detalle: "Las 3 clases por Zoom, grabadas, y la práctica del 12/12 en Maldonado.",
                deADos: CURSO.precios.deADosCompleto,
                destacado: !soloVirtualSugerido,
                virtual: false,
              },
              {
                id: "virtual",
                titulo: "Solo virtual",
                monto: CURSO.precios.soloVirtual,
                detalle: "Las mismas 3 clases por Zoom, grabadas. Completo por sí solo, sin la práctica.",
                deADos: CURSO.precios.deADosVirtual,
                destacado: soloVirtualSugerido,
                virtual: true,
              },
            ].map((p) => (
              <a
                key={p.id}
                href={enlaceCurso(origen, p.virtual)}
                onClick={() => clickCurso(`precio-${p.id}`)}
                className={`block rounded-2xl p-5 transition ${
                  p.destacado ? "bg-white text-[#1e1b16]" : "border border-white/25 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                }`}
              >
                <p
                  className={`font-mono text-[11px] uppercase tracking-[0.14em] ${p.destacado ? "text-[#b0502a]" : "text-[#e9d9a8]"}`}
                >
                  {p.titulo}
                  {p.destacado && resultado ? " · el que te sugerimos" : ""}
                </p>
                <p className="mt-1 font-serif text-[34px] font-bold">{precio(p.monto)}</p>
                <p className={`mt-1 text-[14.5px] leading-snug ${p.destacado ? "text-[#3d372f]" : "text-white/80"}`}>{p.detalle}</p>
                <p className={`mt-2 text-[13px] ${p.destacado ? "text-[#6b6357]" : "text-white/60"}`}>
                  De a dos: {precio(p.deADos)} cada uno.
                </p>
              </a>
            ))}
          </div>

          <div data-cta className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={enlaceCurso(origen, soloVirtualSugerido)}
              onClick={() => clickCurso("boton-curso")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f0c987] px-5 py-4 text-[16.5px] font-semibold text-[#1e1b16] transition hover:bg-[#f5d59e]"
            >
              {textoFase.boton} <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href={waResultado}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => clickWhatsApp("curso")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-5 py-4 text-[16px] font-semibold text-white transition hover:bg-white/10"
            >
              <WhatsAppIcon /> Preguntar por WhatsApp
            </a>
          </div>
          <p className="mt-4 text-center text-[14px] text-white/70">
            ¿Se anotan de a dos? Tienen 10% menos cada uno.{" "}
            <a
              href={waDeADos}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => clickWhatsApp("de-a-dos")}
              className="font-semibold text-[#f0c987] underline underline-offset-4"
            >
              Escribinos
            </a>
          </p>

          {/* Lo que dijeron */}
          <div className="mt-12">
            <Etiqueta clara>Así nos escribieron después de la charla</Etiqueta>
            <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TESTIMONIOS.map((t) => (
                <blockquote
                  key={t}
                  className="w-[80%] shrink-0 snap-start rounded-2xl bg-white/[0.07] p-4 font-serif text-[16px] italic leading-snug text-white/90 sm:w-auto"
                >
                  «{t}»
                  <span className="mt-2 block not-italic font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                    Mensaje de una persona que fue a la charla
                  </span>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================== MÁS MOMENTOS ======================== */}
      <section className="border-b border-[#ddd3c3]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <Etiqueta>Lo mejor de la charla</Etiqueta>
          <h2 className="mt-2 font-serif text-[28px] font-bold leading-tight sm:text-[34px]">Candelaria, en menos de un minuto</h2>
          <p className="mt-2 max-w-2xl text-[15.5px] text-[#4a443a]">
            Fragmentos tal cual de la charla del miércoles 18, con subtítulos. Sin cortes en el medio.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {otrosMomentos.map((id) => (
              <div key={id}>
                <h3 className="font-serif text-[19px] font-bold leading-tight">{MOMENTOS[id].titulo}</h3>
                <p className="mb-3 mt-1 text-[14px] text-[#6b6357]">{MOMENTOS[id].bajada}</p>
                <MomentoPlayer momento={MOMENTOS[id]} compacto onEvento={onVideo} />
              </div>
            ))}
          </div>
          <p className="mt-8 text-[14.5px] text-[#4a443a]">
            ¿Querés verla entera? La grabación dura casi dos horas:{" "}
            <a
              href={GRABACION_CHARLA_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registrar("guia_click_grabacion", origen)}
              className="font-semibold text-[#1f3a2c] underline underline-offset-4"
            >
              abrir la grabación
            </a>
            .
          </p>
        </div>
      </section>

      {/* ======================== VIVEROS ======================== */}
      <section id="viveros" className="scroll-mt-20">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <Etiqueta>Dónde conseguirlas</Etiqueta>
          <h2 className="mt-2 font-serif text-[28px] font-bold leading-tight sm:text-[34px]">Viveros con plantas nativas</h2>
          <p className="mt-2 max-w-2xl text-[15.5px] text-[#4a443a]">
            {VIVEROS_URUGUAY.length} viveros revisados uno por uno. Los marcados «Nativas» se dedican a la flora nativa; en el
            resto, preguntá antes. Y nunca saques plantas del monte.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(["Todos", ...GRUPOS_VIVEROS] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGrupo(g);
                  setVerTodosViveros(false);
                }}
                className={`rounded-full px-3.5 py-1.5 text-[14px] font-medium transition cursor-pointer ${
                  grupo === g ? "bg-[#1f3a2c] text-white" : "border border-[#ddd3c3] bg-white text-[#1e1b16] hover:bg-[#fbf8f2]"
                }`}
              >
                {g}
                <span className="ml-1.5 opacity-60">
                  {g === "Todos" ? VIVEROS_URUGUAY.length : VIVEROS_URUGUAY.filter((v) => v.grupoFiltro === g).length}
                </span>
              </button>
            ))}
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {viverosVisibles.map((v) => (
              <TarjetaVivero key={v.nombre} v={v} />
            ))}
          </ul>
          {viverosFiltrados.length > viverosVisibles.length && (
            <button
              type="button"
              onClick={() => setVerTodosViveros(true)}
              className="mt-4 w-full rounded-xl border border-[#ddd3c3] bg-white px-4 py-3 text-[15px] font-semibold text-[#1e1b16] hover:bg-[#fbf8f2] cursor-pointer"
            >
              Ver los {viverosFiltrados.length} viveros
            </button>
          )}
        </div>
      </section>

      {/* ======================== CIERRE ======================== */}
      <section className="bg-[#ebe4d6]">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
          <h2 className="font-serif text-[26px] font-bold leading-tight sm:text-[32px]">
            {resultado ? "¿Lo armamos juntos?" : "¿Qué mariposas pueden nacer en tu casa?"}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[15.5px] text-[#4a443a]">
            {resultado
              ? "En el curso, Candelaria te acompaña a armar tu jardín, desde el suelo hasta que vuelvan las mariposas."
              : "Contestá las tres preguntas y te armamos tu plan gratis."}
          </p>
          <div data-cta className="mx-auto mt-5 grid max-w-md gap-2.5">
            {resultado ? (
              <a
                href={waResultado}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => clickWhatsApp("cierre")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d9f52] px-4 py-4 text-[16.5px] font-semibold text-white hover:bg-[#188a46]"
              >
                <WhatsAppIcon /> Mandarme el plan por WhatsApp
              </a>
            ) : (
              <button
                type="button"
                onClick={() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f3a2c] px-4 py-4 text-[16.5px] font-semibold text-white cursor-pointer"
              >
                Hacer la guía <ArrowRight className="h-5 w-5" />
              </button>
            )}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Mirá esta guía: en treinta segundos te dice qué mariposas pueden nacer en tu casa y qué plantar. https://ceuta-cursos.vercel.app/tu-jardin-de-mariposas?origen=compartido`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registrar("guia_compartir", origen, { forma: "whatsapp-amigo" })}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1e1b16]/15 bg-white px-4 py-3.5 text-[15px] font-semibold text-[#1e1b16] hover:bg-[#fbf8f2]"
            >
              Mandarle la guía a alguien
            </a>
          </div>
        </div>
      </section>

      {/* Botón flotante de WhatsApp, con el mensaje de esta guía */}
      <a
        href={waResultado}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => clickWhatsApp("flotante")}
        aria-label="Escribir a Ceuta por WhatsApp"
        className={`fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-[#1d9f52] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_12px_28px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 ${
          flotante && !ctaVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <WhatsAppIcon /> {resultado ? "Mi plan por WhatsApp" : "WhatsApp"}
      </a>
    </div>
  );
}
