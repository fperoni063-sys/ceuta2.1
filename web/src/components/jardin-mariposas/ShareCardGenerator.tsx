"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Share2, Sparkles } from "lucide-react";
import {
  SITE_GUIDE_URL,
  type MariposaEspecie,
  type ResultadoGuia,
} from "@/data/jardin-mariposas-guia";

interface ShareCardGeneratorProps {
  resultado: ResultadoGuia;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawButterflyEmblem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  paleta: [string, string, string]
) {
  const [primary, accent, highlight] = paleta;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Soft circular backing
  ctx.beginPath();
  ctx.arc(0, 0, 74, 0, Math.PI * 2);
  ctx.fillStyle = `${primary}20`;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = `${primary}55`;
  ctx.stroke();

  // Symmetric wings (left & right)
  for (const dir of [-1, 1]) {
    ctx.save();
    ctx.scale(dir, 1);

    // Upper wing
    ctx.beginPath();
    ctx.moveTo(4, -4);
    ctx.bezierCurveTo(22, -46, 58, -44, 54, -10);
    ctx.bezierCurveTo(50, 8, 22, 10, 4, 2);
    ctx.closePath();
    ctx.fillStyle = primary;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = accent;
    ctx.stroke();

    // Upper wing highlight spot
    ctx.beginPath();
    ctx.ellipse(32, -18, 10, 6.5, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = highlight;
    ctx.fill();

    // Lower wing
    ctx.beginPath();
    ctx.moveTo(4, 2);
    ctx.bezierCurveTo(32, 6, 46, 28, 30, 42);
    ctx.bezierCurveTo(16, 52, 6, 30, 3, 12);
    ctx.closePath();
    ctx.fillStyle = primary;
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = accent;
    ctx.stroke();

    // Lower wing highlight dot
    ctx.beginPath();
    ctx.arc(22, 24, 5, 0, Math.PI * 2);
    ctx.fillStyle = highlight;
    ctx.fill();

    ctx.restore();
  }

  // Body & antennae
  ctx.beginPath();
  ctx.ellipse(0, 4, 4.5, 22, 0, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-2, -16);
  ctx.quadraticCurveTo(-10, -34, -18, -36);
  ctx.moveTo(2, -16);
  ctx.quadraticCurveTo(10, -34, 18, -36);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = accent;
  ctx.stroke();

  ctx.restore();
}

function getHostLabelForCard(
  mariposa: MariposaEspecie,
  espacioId: ResultadoGuia["espacio"]["id"]
): string {
  if (espacioId === "balcon" && mariposa.id === "espejito") {
    return "Mburucuyá mini (Passiflora misera)";
  }
  return `${mariposa.hospederaPrincipal} (${mariposa.hospederaCientifico})`;
}

function renderStoryCard(
  canvas: HTMLCanvasElement,
  resultado: ResultadoGuia
) {
  const W = 1080;
  const H = 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Warm editorial cream background
  ctx.fillStyle = "#FAF6F1";
  ctx.fillRect(0, 0, W, H);

  // Subtle organic radial washes
  const gTop = ctx.createRadialGradient(W * 0.88, H * 0.08, 40, W * 0.88, H * 0.08, 560);
  gTop.addColorStop(0, "rgba(45, 106, 79, 0.14)");
  gTop.addColorStop(1, "rgba(45, 106, 79, 0)");
  ctx.fillStyle = gTop;
  ctx.fillRect(0, 0, W, H);

  const gBottom = ctx.createRadialGradient(W * 0.12, H * 0.78, 40, W * 0.12, H * 0.78, 540);
  gBottom.addColorStop(0, "rgba(199, 91, 57, 0.12)");
  gBottom.addColorStop(1, "rgba(199, 91, 57, 0)");
  ctx.fillStyle = gBottom;
  ctx.fillRect(0, 0, W, H);

  // Editorial framing border
  drawRoundedRect(ctx, 42, 42, W - 84, H - 84, 38);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(45, 106, 79, 0.28)";
  ctx.stroke();

  // 2. Top badge pill
  const pillW = 640;
  const pillH = 64;
  const pillX = (W - pillW) / 2;
  const pillY = 102;
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 32);
  ctx.fillStyle = "#2D6A4F";
  ctx.fill();

  ctx.fillStyle = "#FAF6F1";
  ctx.font = '700 24px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GUÍA DE MARIPOSAS · URUGUAY · CEUTA", W / 2, pillY + pillH / 2 + 1);

  // 3. Main headline
  ctx.fillStyle = "#3D2914";
  ctx.font = '700 56px Georgia, "Times New Roman", serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const headline = `En mi ${resultado.espacio.shortLabel} de ${resultado.zona.shortLabel} pueden nacer:`;
  const headlineLines = wrapText(ctx, headline, W - 180);
  let y = 216;
  for (const line of headlineLines) {
    ctx.fillText(line, W / 2, y);
    y += 72;
  }

  // Subtle decorative divider
  const divY = y + 18;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 90, divY);
  ctx.lineTo(W / 2 + 90, divY);
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#C75B39";
  ctx.stroke();

  // 4. Three butterfly cards
  const cardX = 88;
  const cardW = W - 176;
  const cardH = 290;
  const cardGap = 32;
  let cardY = divY + 56;

  resultado.mariposas.forEach((mariposa, index) => {
    // Card drop shadow
    ctx.save();
    ctx.shadowColor = "rgba(61, 41, 20, 0.08)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 30);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.restore();

    // Card hairline border
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 30);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(61, 41, 20, 0.1)";
    ctx.stroke();

    // Number tag top-right
    ctx.fillStyle = "rgba(45, 106, 79, 0.12)";
    drawRoundedRect(ctx, cardX + cardW - 86, cardY + 24, 58, 40, 14);
    ctx.fill();
    ctx.fillStyle = "#2D6A4F";
    ctx.font = '700 22px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`0${index + 1}`, cardX + cardW - 57, cardY + 45);

    // Butterfly emblem on left
    drawButterflyEmblem(
      ctx,
      cardX + 114,
      cardY + cardH / 2,
      0.95,
      mariposa.paletaAlas
    );

    // Species copy on right
    const textX = cardX + 220;
    const textMaxW = cardW - 310;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.fillStyle = "#3D2914";
    ctx.font = '700 42px Georgia, "Times New Roman", serif';
    ctx.fillText(mariposa.nombreComun, textX, cardY + 44, textMaxW);

    ctx.fillStyle = "#765F49";
    ctx.font = 'italic 26px Georgia, "Times New Roman", serif';
    ctx.fillText(mariposa.nombreCientifico, textX, cardY + 100, textMaxW);

    // Host plant pill
    const hostLabel = getHostLabelForCard(mariposa, resultado.espacio.id);
    const hostLines = wrapText(ctx, `Hospedera: ${hostLabel}`, textMaxW - 24);
    const pillBoxH = hostLines.length > 1 ? 82 : 52;
    drawRoundedRect(ctx, textX, cardY + 158, textMaxW + 40, pillBoxH, 16);
    ctx.fillStyle = "#EDF5F0";
    ctx.fill();

    ctx.fillStyle = "#1E523B";
    ctx.font = '600 23px "Segoe UI", Arial, sans-serif';
    let hy = cardY + 172;
    for (const hLine of hostLines.slice(0, 2)) {
      ctx.fillText(hLine, textX + 18, hy);
      hy += 30;
    }

    cardY += cardH + cardGap;
  });

  // 5. Ecological motto bar
  const mottoY = cardY + 16;
  drawRoundedRect(ctx, 88, mottoY, W - 176, 134, 26);
  ctx.fillStyle = "#F3E9DE";
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#3D2914";
  ctx.font = 'italic 29px Georgia, "Times New Roman", serif';
  ctx.fillText(
    "«Flores solas = comedor de paso.",
    W / 2,
    mottoY + 46
  );
  ctx.fillStyle = "#2D6A4F";
  ctx.font = '700 30px Georgia, "Times New Roman", serif';
  ctx.fillText(
    "Con plantas hospederas nativas, tu jardín es su casa.»",
    W / 2,
    mottoY + 92
  );

  // 6. Footer CTA panel
  const footerY = H - 270;
  drawRoundedRect(ctx, 88, footerY, W - 176, 184, 30);
  ctx.fillStyle = "#2D6A4F";
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#DCEEE5";
  ctx.font = '600 27px "Segoe UI", Arial, sans-serif';
  ctx.fillText("Descubrí las mariposas de tu casa gratis en:", W / 2, footerY + 54);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = '700 33px "Segoe UI", Arial, sans-serif';
  ctx.fillText(SITE_GUIDE_URL, W / 2, footerY + 104);

  ctx.fillStyle = "#C3DFD0";
  ctx.font = '500 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText(
    "CEUTA Uruguay · Guía basada en la charla de Candelaria Domínguez",
    W / 2,
    footerY + 148
  );
}

export function ShareCardGenerator({ resultado }: ShareCardGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderStoryCard(canvas, resultado);
    try {
      setPreviewUrl(canvas.toDataURL("image/png"));
    } catch {
      setPreviewUrl("");
    }
  }, [resultado]);

  const shareText = `En mi ${resultado.espacio.shortLabel} de ${resultado.zona.shortLabel} pueden nacer ${resultado.mariposas[0].nombreComun}, ${resultado.mariposas[1].nombreComun} y ${resultado.mariposas[2].nombreComun}. Descubrí qué mariposas de Uruguay pueden nacer en tu casa: https://${SITE_GUIDE_URL}`;

  const getPngBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });

  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mariposas-${resultado.espacio.id}-${resultado.zona.id}-ceuta.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  };

  const handleShare = async () => {
    setSharing(true);
    setStatusMessage("");
    try {
      const blob = await getPngBlob();
      if (!blob) {
        setStatusMessage("No pudimos generar la imagen en este navegador.");
        return;
      }

      const file = new File(
        [blob],
        `mi-jardin-de-mariposas-ceuta.png`,
        { type: "image/png" }
      );

      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
      ) {
        const shareData: ShareData = {
          title: "Mi jardín de mariposas de Uruguay · CEUTA",
          text: shareText,
          url: `https://${SITE_GUIDE_URL}`,
        };

        if (
          typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({ ...shareData, files: [file] });
          setStatusMessage("¡Resultado compartido!");
          return;
        }

        // Si el navegador admite share de enlace pero no de archivo, descargamos el PNG también
        triggerDownload(blob);
        await navigator.share(shareData);
        setStatusMessage("¡Listo! También guardamos la imagen 9:16 para tus historias.");
        return;
      }

      // Desktop fallback: descarga directa de la tarjeta 9:16
      triggerDownload(blob);
      setStatusMessage(
        "¡Tarjeta descargada en formato Historia (9:16)! Ya podés subirla a Instagram o WhatsApp."
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setStatusMessage("");
      } else {
        const blob = await getPngBlob();
        if (blob) {
          triggerDownload(blob);
          setStatusMessage("¡Tarjeta PNG guardada en tu dispositivo!");
        }
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadOnly = async () => {
    const blob = await getPngBlob();
    if (!blob) return;
    triggerDownload(blob);
    setStatusMessage(
      "¡Imagen 9:16 descargada! Ideal para compartir en historias de Instagram o estados de WhatsApp."
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${SITE_GUIDE_URL}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      setStatusMessage(`Copiá este enlace: https://${SITE_GUIDE_URL}`);
    }
  };

  return (
    <div className="rounded-2xl border border-earth-900/12 dark:border-white/10 bg-white dark:bg-stone-900 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-700 mb-2">
        <Sparkles className="w-4 h-4" aria-hidden="true" />
        Tarjeta lista para historias (9:16)
      </div>
      <h3 className="font-heading text-xl font-bold text-earth-900 dark:text-stone-100 mb-2">
        Compartí tu resultado
      </h3>
      <p className="text-sm text-foreground/75 mb-5 leading-relaxed">
        Contagiá a tus vecinos y amigas: cuantas más casas sumen nativas en tu barrio, más fuerte es el corredor biológico.
      </p>

      {/* Canvas oculto a resolución real 1080x1920 */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Vista previa vertical 9:16 */}
        <div className="w-[155px] sm:w-[170px] shrink-0 rounded-2xl overflow-hidden border border-earth-900/15 dark:border-white/15 shadow-md bg-[#faf6f1] aspect-[9/16]">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={`Tarjeta compartible: en mi ${resultado.espacio.shortLabel} de ${resultado.zona.shortLabel} pueden nacer ${resultado.mariposas.map((m) => m.nombreComun).join(", ")}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-earth-900/60">
              Generando tarjeta…
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing || !previewUrl}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-earth-900 dark:bg-stone-100 text-white dark:text-stone-950 font-semibold text-sm sm:text-base px-4 py-3.5 shadow-sm hover:opacity-90 transition cursor-pointer disabled:opacity-50"
          >
            <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            {sharing ? "Preparando tarjeta…" : "Compartir mi resultado"}
          </button>

          <button
            type="button"
            onClick={handleDownloadOnly}
            disabled={!previewUrl}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-earth-900/20 dark:border-white/15 bg-cream/70 dark:bg-stone-800 text-earth-900 dark:text-stone-100 font-medium text-sm px-4 py-2.5 hover:bg-cream dark:hover:bg-stone-700 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
            Descargar imagen PNG
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-transparent text-green-700 dark:text-emerald-400 font-medium text-sm px-4 py-2 hover:bg-green-700/8 transition cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                ¡Enlace copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                Copiar enlace de la guía
              </>
            )}
          </button>

          {statusMessage && (
            <p
              role="status"
              className="text-xs text-green-800 dark:text-emerald-300 bg-green-700/10 rounded-lg px-3 py-2 leading-snug"
            >
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
