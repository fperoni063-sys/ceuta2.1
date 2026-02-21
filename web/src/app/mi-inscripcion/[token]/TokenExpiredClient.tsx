'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

interface Props {
    emailHint?: string;
    cursoId?: number;
    cursoNombre?: string;
}

export function TokenExpiredClient({ emailHint, cursoId, cursoNombre }: Props) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/inscripcion/recuperar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    curso_id: cursoId,
                }),
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                setError('Error al enviar. Intentá nuevamente.');
            }
        } catch {
            setError('Error de conexión. Intentá nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-cream-50 to-white py-12 px-4">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 text-center">
                        <div className="text-5xl mb-4">✉️</div>
                        <h1 className="text-2xl font-serif text-walnut-800 mb-3">
                            ¡Revisá tu email!
                        </h1>
                        <p className="text-walnut-600 mb-4">
                            Si existe una inscripción con ese email, te enviamos un nuevo enlace
                            para que puedas continuar.
                        </p>
                        <p className="text-sm text-walnut-500 mb-6">
                            Revisá también tu carpeta de spam.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-cream-50 to-white py-12 px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-6">

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="text-5xl mb-4">⏰</div>
                        <h1 className="text-2xl font-serif text-walnut-800 mb-2">
                            Este enlace expiró
                        </h1>
                        <p className="text-walnut-600">
                            Por seguridad, los enlaces de inscripción tienen una validez limitada.
                        </p>
                        {cursoNombre && (
                            <p className="text-sm text-walnut-500 mt-2">
                                Tu inscripción a <strong>{cursoNombre}</strong> sigue activa.
                            </p>
                        )}
                    </div>

                    {/* Opción principal: Pedir nuevo link */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                        <h2 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Recibí un nuevo enlace por email
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={emailHint ? `Tu email (${emailHint})` : 'Tu email'}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar nuevo enlace'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Separador */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400">o también</span>
                        </div>
                    </div>

                    {/* Opción secundaria: Volver a inscribirse */}
                    <div className="text-center">
                        <Link
                            href={cursoId ? `/cursos` : '/cursos'}
                            className="text-sm text-walnut-500 hover:text-walnut-700 underline"
                        >
                            Volver a inscribirme desde el curso
                        </Link>
                        <p className="text-xs text-walnut-400 mt-1">
                            Si ya pusiste tus datos antes, se actualizarán automáticamente.
                        </p>
                    </div>

                    {/* Link volver */}
                    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center text-walnut-500 hover:text-walnut-700 text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
