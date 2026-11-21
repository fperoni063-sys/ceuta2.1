import type { Metadata } from "next";
import { GuiaMariposasClient } from "@/components/jardin-mariposas/GuiaMariposasClient";
import { FOTOS_REALES, SITE_GUIDE_URL } from "@/data/jardin-mariposas-guia";

const PAGE_URL = `https://${SITE_GUIDE_URL}`;
const PAGE_TITLE =
  "Descubrí qué mariposas de Uruguay pueden nacer en tu casa | Guía gratuita";
const PAGE_DESCRIPTION =
  "Respondé 3 preguntas en 20 segundos y descubrí qué 3 mariposas de Uruguay, qué plantas nativas hospederas y qué viveros verificados sirven para tu balcón, patio o jardín. Con Candelaria Domínguez (CEUTA).";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "mariposas de uruguay",
    "jardin de mariposas uruguay",
    "plantas nativas uruguay",
    "plantas hospederas mariposas",
    "viveros plantas nativas uruguay",
    "mariposa monarca uruguay",
    "espejito mburucuya",
    "bandera argentina coronilla",
    "candelaria dominguez",
    "ceuta uruguay",
  ].join(", "),
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Descubrí qué mariposas de Uruguay pueden nacer en tu casa",
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: "CEUTA Uruguay",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: FOTOS_REALES.ogMariposasVuelo,
        width: 1200,
        height: 630,
        alt: "Mariposas de Uruguay volando sobre flores — Guía interactiva gratuita de CEUTA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Descubrí qué mariposas de Uruguay pueden nacer en tu casa",
    description: PAGE_DESCRIPTION,
    images: [FOTOS_REALES.ogMariposasVuelo],
  },
};

export default function TuJardinDeMariposasPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Descubrí qué mariposas de Uruguay pueden nacer en tu casa",
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    inLanguage: "es-UY",
    publisher: {
      "@type": "Organization",
      name: "CEUTA Uruguay",
      url: "https://ceuta.org.uy",
    },
    about: {
      "@type": "Course",
      name: "Jardines biodiversos: tu jardín de mariposas",
      provider: {
        "@type": "Organization",
        name: "CEUTA Uruguay",
      },
      instructor: {
        "@type": "Person",
        name: "Candelaria Domínguez",
        jobTitle: "Licenciada en Diseño de Paisaje (UdelaR)",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GuiaMariposasClient />
    </>
  );
}
