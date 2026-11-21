"use client";

import { useState } from "react";
import { Download, Share2, X } from "lucide-react";
import { FOTOS, SITE_GUIDE_URL, cld, type ResultadoGuia } from "@/data/jardin-mariposas-guia";

const W = 1080;
const H = 1920;

function familia(variable: string, respaldo: string): string {
  if (typeof window === "undefined") return respaldo;
  const v = getComputedStyle(document.body).getPropertyValue(variable).trim();
  return v ? `${v}, ${respaldo}` : respaldo;
}

function cargarImagen(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function lineas(ctx: CanvasRenderingContext2D, texto: string, ancho: number): string[] {
  const palabras = texto.split(" ");
  const out: string[] = [];
  let actual = "";
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width > ancho && actual) {
      out.push(actual);
      actual = p;
    } else actual = prueba;
  }
  if (actual) out.push(actual);
  return out;
}

async function dibujar(r: ResultadoGuia): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const serif = familia("--font-lora", "Georgia, serif");
  const sans = familia("--font-source-sans", "Arial, sans-serif");
  const mono = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
  try {
    await Promise.all([
      document.fonts.load(`700 80px ${serif}`),
      document.fonts.load(`italic 700 80px ${serif}`),
      document.fonts.load(`400 36px ${sans}`),
      document.fonts.load(`600 36px ${sans}`),
    ]);
  } catch {
    /* sigue con la letra de respaldo */
  }

  // Fondo de papel
  ctx.fillStyle = "#f4efe6";
  ctx.fillRect(0, 0, W, H);

  // Foto real arriba: el jardín de Candelaria
  const fotoH = 820;
  const img = await cargarImagen(cld(FOTOS.jardinCandelaria, 1080, 1080));
  if (img) {
    const escala = Math.max(W / img.width, fotoH / img.height);
    const w = img.width * escala;
    const h = img.height * escala;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, fotoH);
    ctx.clip();
    // La mariposa está en el tercio de arriba de la foto: se ancla arriba.
    ctx.drawImage(img, (W - w) / 2, Math.max(fotoH - h, -h * 0.12), w, h);
    ctx.restore();
  } else {
    ctx.fillStyle = "#1f3a2c";
    ctx.fillRect(0, 0, W, fotoH);
  }
  const g = ctx.createLinearGradient(0, fotoH - 260, 0, fotoH);
  g.addColorStop(0, "rgba(244,239,230,0)");
  g.addColorStop(1, "rgba(244,239,230,1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, fotoH - 260, W, 260);

  // Etiqueta sobre la foto
  ctx.font = `600 26px ${mono}`;
  const etiqueta = "CEUTA · GUÍA DE MARIPOSAS";
  const ew = ctx.measureText(etiqueta).width + 44;
  ctx.fillStyle = "rgba(20,18,14,0.62)";
  ctx.beginPath();
  ctx.roundRect(64, 64, ew, 58, 29);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(etiqueta, 86, 102);

  const x = 84;
  let y = fotoH + 46;
  ctx.fillStyle = "#b0502a";
  ctx.font = `600 28px ${mono}`;
  ctx.fillText("MI PLAN PARA ATRAER MARIPOSAS", x, y);

  y += 92;
  ctx.fillStyle = "#1e1b16";
  ctx.font = `700 76px ${serif}`;
  const lugar = r.espacio.tituloPlan.replace(/^tu /, "mi ");
  ctx.fillText(`En ${lugar}`, x, y);
  y += 88;
  ctx.font = `italic 700 76px ${serif}`;
  ctx.fillStyle = "#b0502a";
  ctx.fillText("pueden nacer:", x, y);

  y += 56;
  for (const m of r.mariposas) {
    y += 104;
    ctx.fillStyle = m.colores[0];
    ctx.beginPath();
    ctx.arc(x + 18, y - 18, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e1b16";
    ctx.font = `700 52px ${serif}`;
    ctx.fillText(m.nombre, x + 60, y);
    ctx.fillStyle = "#5f574b";
    ctx.font = `400 34px ${sans}`;
    ctx.fillText(`nace en: ${m.hospederas.map((h) => h.nombre.toLowerCase()).join(", ")}`, x + 60, y + 48);
  }

  y += 130;
  ctx.fillStyle = "#e7dfd0";
  ctx.beginPath();
  ctx.roundRect(x - 20, y - 56, W - 2 * x + 40, 124, 24);
  ctx.fill();
  ctx.fillStyle = "#1e1b16";
  ctx.font = `600 36px ${sans}`;
  const estrella = lineas(ctx, "La planta estrella de Candelaria: la mariposera blanca.", W - 2 * x);
  estrella.forEach((l, i) => ctx.fillText(l, x, y + i * 46));

  // Pie
  ctx.fillStyle = "#1f3a2c";
  ctx.fillRect(0, H - 250, W, 250);
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 50px ${serif}`;
  ctx.fillText("Hacé tu guía gratis", x, H - 162);
  ctx.font = `500 30px ${mono}`;
  ctx.fillStyle = "#e9d9a8";
  ctx.fillText(SITE_GUIDE_URL, x, H - 108);
  ctx.font = `400 28px ${sans}`;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("Con Candelaria Domínguez · CEUTA Uruguay", x, H - 62);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

export function TarjetaCompartir({
  resultado,
  onEvento,
}: {
  resultado: ResultadoGuia;
  onEvento?: (forma: string) => void;
}) {
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState<string | null>(null);

  const compartir = async () => {
    setCargando(true);
    try {
      const blob = await dibujar(resultado);
      if (!blob) return;
      const archivo = new File([blob], "mi-jardin-de-mariposas.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && nav.canShare?.({ files: [archivo] })) {
        try {
          await nav.share({
            files: [archivo],
            text: `Mi plan para atraer mariposas. Hacé el tuyo gratis: https://${SITE_GUIDE_URL}?origen=compartido`,
          });
          onEvento?.("archivo");
          return;
        } catch (e) {
          if ((e as Error)?.name === "AbortError") return;
        }
      }
      // Navegadores dentro de Instagram o Facebook: se muestra la imagen para guardarla apretándola.
      setVista(URL.createObjectURL(blob));
      onEvento?.("vista");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={compartir}
        disabled={cargando}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e1b16]/15 bg-white px-4 py-3.5 text-[15px] font-semibold text-[#1e1b16] transition hover:bg-[#fbf8f2] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        <Share2 className="h-4 w-4" />
        {cargando ? "Armando tu tarjeta…" : "Compartir mi plan en historias"}
      </button>

      {vista && (
        <div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Tu tarjeta para compartir"
        >
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(vista);
              setVista(null);
            }}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={vista} alt="Tu plan para atraer mariposas" className="max-h-[78vh] w-auto rounded-xl shadow-2xl" />
          <p className="mt-4 max-w-xs text-center text-sm text-white/85">
            Mantené apretada la imagen para guardarla y subila a tus historias.
          </p>
          <a
            href={vista}
            download="mi-jardin-de-mariposas.png"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1e1b16]"
          >
            <Download className="h-4 w-4" /> Descargar
          </a>
        </div>
      )}
    </>
  );
}
