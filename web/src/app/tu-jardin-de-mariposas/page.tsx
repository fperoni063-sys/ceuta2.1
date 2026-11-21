import type { Metadata } from "next";
import { GuiaMariposasClient } from "@/components/jardin-mariposas/GuiaMariposasClient";
import { SITE_GUIDE_URL } from "@/data/jardin-mariposas-guia";

const PAGE_URL = `https://${SITE_GUIDE_URL}`;
const TITULO = "¿Qué mariposas pueden nacer en tu casa? Guía gratis";
const DESCRIPCION =
  "Tres preguntas y te armamos tu plan: qué mariposas de Uruguay pueden nacer en tu balcón, patio o jardín, qué plantas nativas poner y dónde conseguirlas. Con lo que explicó Candelaria Domínguez en su charla.";
// Foto real de Candelaria en su jardín (una cuatro ojos en la mariposera), recortada para compartir.
const OG_IMAGEN =
  "https://res.cloudinary.com/dgey83xqy/image/upload/c_fill,g_auto,w_1200,h_630,q_auto,f_jpg/v1795270170/ceuta/tu-jardin-mariposas/charla/jardin-candelaria-cuatro-ojos.jpg";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "¿Qué mariposas pueden nacer en tu casa?",
    description: "Guía gratis de 30 segundos, con lo que explicó Candelaria Domínguez en su charla.",
    url: PAGE_URL,
    siteName: "CEUTA Uruguay",
    locale: "es_UY",
    type: "website",
    images: [{ url: OG_IMAGEN, width: 1200, height: 630, alt: "Una mariposa cuatro ojos sobre la mariposera" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Qué mariposas pueden nacer en tu casa?",
    description: "Guía gratis de 30 segundos, con lo que explicó Candelaria Domínguez en su charla.",
    images: [OG_IMAGEN],
  },
};

export default function TuJardinDeMariposasPage() {
  const datos = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "¿Qué mariposas pueden nacer en tu casa?",
    description: DESCRIPCION,
    url: PAGE_URL,
    inLanguage: "es-UY",
    publisher: { "@type": "Organization", name: "CEUTA Uruguay", url: "https://ceuta.org.uy" },
    about: {
      "@type": "Course",
      name: "Jardines biodiversos: tu jardín de mariposas",
      provider: { "@type": "Organization", name: "CEUTA Uruguay" },
      instructor: { "@type": "Person", name: "Candelaria Domínguez", jobTitle: "Licenciada en Diseño de Paisaje (UdelaR)" },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }} />
      <GuiaMariposasClient />
    </>
  );
}
