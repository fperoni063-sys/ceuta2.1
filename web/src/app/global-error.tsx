'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to Sentry or console
        console.error('Global Error caught:', error);
    }, [error]);

    return (
        <html>
            <body className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4 font-sans text-center">
                <div className="max-w-md space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">¡Ups!</h1>
                        <h2 className="text-xl text-neutral-600 font-medium">Algo salió mal en el servidor.</h2>
                    </div>

                    <p className="text-neutral-500">
                        No te preocupes, no es tu culpa. Hemos sido notificados y estamos trabajando para solucionarlo.
                    </p>

                    <div className="bg-white p-4 rounded-lg border border-neutral-200 text-left text-xs font-mono text-neutral-400 overflow-auto max-h-32 shadow-sm">
                        {error.message || 'Error desconocido'}
                        {error.digest && <div className="mt-1 pt-1 border-t border-neutral-100">Digest: {error.digest}</div>}
                    </div>

                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90 h-10 px-8 py-2 w-full sm:w-auto"
                    >
                        Intentar de nuevo
                    </button>

                    <div className="pt-8">
                        <a href="/" className="text-sm text-blue-600 hover:underline">
                            Volver al inicio
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
