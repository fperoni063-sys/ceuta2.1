import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";

import { COMPANY_INFO } from "@/lib/constants";

export function CtaSection() {
    const whatsappUrl = `https://wa.me/${COMPANY_INFO.whatsapp.contacto}?text=Hola, me interesa recibir información sobre los cursos de CEUTA`;

    return (
        <section className="py-20 bg-gradient-to-br from-green-700 to-green-800">
            <div className="container mx-auto px-4 text-center">
                <h2 className="font-heading text-3xl md:text-4xl text-white mb-4">
                    ¿Querés transformar tu entorno?
                </h2>
                <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
                    Aprendé capacidades para la vida y construí un futuro mejor hoy.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/cursos">
                        <Button
                            size="lg"
                            className="bg-white text-green-700 hover:bg-cream text-lg px-8 py-6 group"
                        >
                            Explorar cursos
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </Button>
                    </Link>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white hover:text-green-700 text-lg px-8 py-6"
                        >
                            <MessageCircle className="mr-2" size={20} />
                            Consultar por WhatsApp
                        </Button>
                    </a>
                </div>
            </div>
        </section>
    );
}
