'use client';

import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PagoErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
            <div className="max-w-md w-full text-center space-y-8 py-12">
                {/* Error Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-red-500/20 animate-in zoom-in duration-500">
                    <AlertTriangle className="w-12 h-12 text-white" />
                </div>

                {/* Message */}
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <h1 className="font-heading text-3xl font-bold text-earth-900 dark:text-white">
                        Pago no completado
                    </h1>
                    <p className="text-lg text-earth-900/70 dark:text-gray-300">
                        El pago no pudo ser procesado o fue cancelado. No se realizó ningún cargo.
                    </p>
                </div>

                {/* Help Box */}
                <div className="animate-in fade-in duration-700 delay-500 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 rounded-xl p-5 text-left space-y-2">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        💡 Podés intentar de nuevo o elegir otro método de pago.
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        💬 Si el problema persiste, contactanos por WhatsApp.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="animate-in fade-in duration-700 delay-700 flex flex-col gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-earth-900 dark:bg-white hover:bg-earth-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium transition-all shadow-lg"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Intentar de nuevo
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/15 text-earth-900 dark:text-white rounded-xl font-medium transition-all border border-gray-200 dark:border-white/10"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Inicio
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
