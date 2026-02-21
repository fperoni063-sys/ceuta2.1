import { HelpCircle } from 'lucide-react';
import { FAQ } from '@/types/db';

interface FAQSectionProps {
    faqs: FAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
    if (faqs.length === 0) return null;

    return (
        <section className="mt-12" id="preguntas-frecuentes">
            <h2 className="font-heading text-2xl font-bold text-earth-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-green-700" />
                Preguntas Frecuentes
            </h2>

            <div className="space-y-4">
                {faqs.map((faq) => (
                    <div
                        key={faq.id}
                        className="border border-earth-900/10 rounded-lg overflow-hidden bg-background shadow-sm"
                    >
                        {/* Pregunta */}
                        <div className="p-4 bg-cream/20">
                            <h3 className="font-medium text-earth-900">
                                {faq.pregunta}
                            </h3>
                        </div>

                        {/* Respuesta (siempre visible) */}
                        <div className="px-4 pb-4 pt-3 text-foreground/80 leading-relaxed border-t border-earth-900/5">
                            <div className="whitespace-pre-wrap">
                                {faq.respuesta}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Schema.org FAQ markup for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: faqs.map((faq) => ({
                            "@type": "Question",
                            name: faq.pregunta,
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: faq.respuesta,
                            },
                        })),
                    }),
                }}
            />
        </section>
    );
}
