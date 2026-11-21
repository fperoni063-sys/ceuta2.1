"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import type { MomentoCharla } from "@/data/jardin-mariposas-momentos";

// Un solo video sonando a la vez en toda la página.
let videoActivo: HTMLVideoElement | null = null;

function mmss(seg: number): string {
  const s = Math.max(0, Math.round(seg));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function MomentoPlayer({
  momento,
  compacto = false,
  etiqueta,
  onEvento,
}: {
  momento: MomentoCharla;
  compacto?: boolean;
  etiqueta?: string;
  onEvento?: (nombre: "play" | "fin", momentoId: string) => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [empezo, setEmpezo] = useState(false);
  const [sonando, setSonando] = useState(false);
  const [texto, setTexto] = useState<string | null>(null);
  const yaContoPlay = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => {
      const t = v.currentTime;
      const cue = momento.subtitulos.find((c) => t >= c.s && t < c.e + 0.4);
      setTexto(cue ? cue.t : null);
    };
    const onPlay = () => {
      if (videoActivo && videoActivo !== v) videoActivo.pause();
      videoActivo = v;
      setEmpezo(true);
      setSonando(true);
      if (!yaContoPlay.current) {
        yaContoPlay.current = true;
        onEvento?.("play", momento.id);
      }
    };
    const onPause = () => setSonando(false);
    const onEnded = () => {
      setSonando(false);
      onEvento?.("fin", momento.id);
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
  }, [momento, onEvento]);

  const reproducir = () => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {
      /* el navegador puede bloquearlo: queda el botón */
    });
  };

  return (
    <figure className="rounded-2xl overflow-hidden bg-[#1e1b16] text-white shadow-[0_10px_30px_-12px_rgba(30,27,22,0.45)]">
      <div className="relative aspect-video bg-black">
        <video
          ref={ref}
          src={momento.video}
          poster={momento.poster}
          preload="none"
          playsInline
          controls={empezo}
          className="absolute inset-0 h-full w-full object-contain"
          aria-label={`${momento.titulo}. Fragmento de la charla de Candelaria Domínguez`}
        />
        {!empezo && (
          <button
            type="button"
            onClick={reproducir}
            className="absolute inset-0 flex items-end justify-start p-3 sm:p-4 bg-gradient-to-t from-black/70 via-black/10 to-transparent text-left cursor-pointer group"
            aria-label={`Reproducir: ${momento.titulo}`}
          >
            <span className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#1e1b16] shadow-lg transition group-hover:scale-105 group-active:scale-95">
              <Play className="h-7 w-7 translate-x-[2px]" fill="currentColor" />
            </span>
            <span className="relative font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/85 bg-black/40 rounded px-2 py-1">
              {etiqueta ?? "Charla del 18/11"} · {mmss(momento.duracion)}
            </span>
          </button>
        )}
      </div>
      <figcaption className="px-4 pt-3 pb-4 sm:px-5">
        <div
          className={`min-h-[3.4em] font-serif leading-snug transition-colors ${
            compacto ? "text-[15px]" : "text-[16.5px] sm:text-lg"
          } ${texto ? "text-white" : "text-white/80"}`}
          aria-live="polite"
        >
          {sonando || texto ? (texto ?? "…") : momento.titulo}
        </div>
        <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/50">
          Candelaria Domínguez · minuto {momento.minuto} de la grabación
        </p>
      </figcaption>
    </figure>
  );
}
