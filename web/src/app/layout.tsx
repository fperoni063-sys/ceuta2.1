import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { InscripcionBanner } from "@/components/InscripcionBanner";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CEUTA Uruguay",
    template: "%s | CEUTA Uruguay",
  },
  description: "Centro Uruguayo de Tecnologías Apropiadas. Cursos de permacultura, agroecología, bioconstrucción y huerta orgánica en Uruguay.",
  keywords: "cursos permacultura uruguay, curso agroecologia montevideo, bioconstruccion uruguay, huerta organica curso, ceuta uruguay",
  icons: {
    icon: "/ceuta-logo.png",
    shortcut: "/ceuta-logo.png",
    apple: "/ceuta-logo.png",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ceuta.org.uy"), // Fallback to production domain if env var not set
  openGraph: {
    type: "website",
    locale: "es_UY",
    url: "https://ceuta.org.uy",
    siteName: "CEUTA Uruguay",
    images: [
      {
        url: "/images/og-image.png", // Needs to be created or we use a default
        width: 1200,
        height: 630,
        alt: "CEUTA Uruguay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ceutauruguay", // If exists
    creator: "@ceutauruguay",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${lora.variable} ${sourceSans.variable} antialiased font-sans flex flex-col min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "CEUTA Uruguay",
              url: "https://ceuta.org.uy",
              logo: "https://ceuta.org.uy/images/og-image.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+598 91 431 577",
                contactType: "customer service",
                areaServed: "UY",
                availableLanguage: "es",
              },
              sameAs: [
                "https://www.facebook.com/cursosceuta/",
                "https://www.instagram.com/ceuta.uy/",
              ],
            }),
          }}
        />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <WhatsAppButton />
        <InscripcionBanner />
        <Footer />
      </body>
    </html>
  );
}
