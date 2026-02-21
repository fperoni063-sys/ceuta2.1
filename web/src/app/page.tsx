import { HeroSection, CoursesCarousel, WhyCeuta, TestimonialsSlider, CtaSection } from "@/components/home";
import { HomeTracker } from "@/components/analytics/HomeTracker";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "CEUTA Uruguay - Centro Uruguayo de Tecnologías Apropiadas",
  description: "Cursos de Agroecología, Energías Renovables y más. Más de 30 años de experiencia aprendiendo haciendo.",
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <CoursesCarousel />
      <WhyCeuta />
      <TestimonialsSlider />
      <CtaSection />
      <Suspense fallback={null}>
        <HomeTracker />
      </Suspense>
    </>
  );
}
