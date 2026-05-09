'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

function PagoExitosoContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Trigger confetti animation
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
            <div className="max-w-md w-full text-center space-y-8 py-12">
                {/* Success Icon */}
                <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/30 animate-in zoom-in duration-500">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    {showConfetti && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl animate-bounce">🎉</span>
                        </div>
                    )}
                </div>

                {/* Message */}
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <h1 className="font-heading text-3xl font-bold text-earth-900 dark:text-white">
                        ¡Pago Exitoso!
                    </h1>
                    <p className="text-lg text-earth-900/70 dark:text-gray-300">
                        Tu pago fue procesado correctamente. Tu inscripción está <strong className="text-green-600 dark:text-green-400">confirmada</strong>.
                    </p>
                </div>

                {/* Order Info */}
                {orderId && (
                    <div className="animate-in fade-in duration-700 delay-500 bg-white/60 dark:bg-white/5 backdrop-blur border border-green-200 dark:border-green-500/20 rounded-xl p-4">
                        <p className="text-xs text-muted-foreground mb-1">Referencia de pago</p>
                        <p className="font-mono text-sm text-earth-900 dark:text-white">{orderId}</p>
                    </div>
                )}

                {/* Info Box */}
                <div className="animate-in fade-in duration-700 delay-700 bg-green-50/80 dark:bg-green-950/30 border border-green-200 dark:border-green-500/20 rounded-xl p-5 text-left space-y-2">
                    <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ Recibirás un email de confirmación en los próximos minutos.
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                        📧 Revisá tu bandeja de entrada (y spam) por los detalles del curso.
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                        💬 Si tenés alguna consulta, contactanos por WhatsApp.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="animate-in fade-in duration-700 delay-1000 flex flex-col gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/30"
                    >
                        <Home className="w-4 h-4" />
                        Volver al Inicio
                    </Link>
                    <Link
                        href="/cursos"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/15 text-earth-900 dark:text-white rounded-xl font-medium transition-all border border-gray-200 dark:border-white/10"
                    >
                        Ver más cursos
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-xs text-muted-foreground pt-4">
                    CEUTA Capacitaciones — Educación profesional
                </p>
            </div>
        </div>
    );
}

export default function PagoExitosoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-lg">Cargando...</div>
            </div>
        }>
            <PagoExitosoContent />
        </Suspense>
    );
}
