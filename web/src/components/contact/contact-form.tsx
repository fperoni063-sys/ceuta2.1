"use client";

import { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export function ContactForm() {
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const { track } = useAnalytics();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFormStatus('submitting');
        setErrorMessage('');

        const formData = new FormData(e.currentTarget);
        const data = {
            nombre: formData.get('nombre'),
            email: formData.get('email'),
            asunto: formData.get('asunto'),
            mensaje: formData.get('mensaje'),
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Error al enviar el mensaje');
            }

            setFormStatus('success');
            track('contact_form_submit', { category: 'engagement' });
            // Optional: reset form after delay or immediately if re-rendering entirely
        } catch (error) {
            setFormStatus('error');
            setErrorMessage('Hubo un problema al enviar tu mensaje. Por favor, intentá nuevamente.');
        }
    }

    if (formStatus === 'success') {
        return (
            <div className="bg-background dark:bg-card p-8 rounded-3xl shadow-sm border border-earth-900/5 dark:border-white/10 h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 mx-auto">
                    <CheckCircle2 size={32} />
                </div>
                <div>
                    <h3 className="text-2xl font-heading text-earth-900 dark:text-foreground mb-2">¡Mensaje Enviado!</h3>
                    <p className="text-gray-600 dark:text-muted-foreground">
                        Gracias por contactarte con CEUTA.<br />
                        Hemos recibido tu consulta y te responderemos a la brevedad.
                    </p>
                </div>
                <button
                    onClick={() => setFormStatus('idle')}
                    className="mt-4 text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium hover:underline"
                >
                    Enviar otro mensaje
                </button>
            </div>
        );
    }

    return (
        <div className="bg-background dark:bg-card p-8 rounded-3xl shadow-sm border border-earth-900/5 dark:border-white/10">
            <h2 className="font-heading text-2xl text-earth-900 dark:text-foreground mb-6">
                Envianos un mensaje
            </h2>

            {formStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <p className="text-sm">{errorMessage}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="nombre" className="text-sm font-medium text-earth-900 dark:text-foreground">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            id="nombre"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent dark:bg-white/5 focus:border-green-700 dark:focus:border-green-500 focus:ring-2 focus:ring-green-700/20 dark:focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-earth-900 dark:text-foreground">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent dark:bg-white/5 focus:border-green-700 dark:focus:border-green-500 focus:ring-2 focus:ring-green-700/20 dark:focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="asunto" className="text-sm font-medium text-earth-900 dark:text-foreground">Asunto</label>
                    <select
                        name="asunto"
                        id="asunto"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-background dark:bg-card focus:border-green-700 dark:focus:border-green-500 focus:ring-2 focus:ring-green-700/20 dark:focus:ring-green-500/20 outline-none transition-all"
                        defaultValue=""
                    >
                        <option value="" disabled>Seleccioná un motivo</option>
                        <option value="curso">Consultas sobre Clases/Cursos</option>
                        <option value="inscripcion">Problemas con Inscripción</option>
                        <option value="institucional">Consulta Institucional</option>
                        <option value="otro">Otro motivo</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="mensaje" className="text-sm font-medium text-earth-900 dark:text-foreground">Mensaje</label>
                    <textarea
                        name="mensaje"
                        id="mensaje"
                        rows={5}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent dark:bg-white/5 focus:border-green-700 dark:focus:border-green-500 focus:ring-2 focus:ring-green-700/20 dark:focus:ring-green-500/20 outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="¿En qué podemos ayudarte?"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-full py-4 bg-earth-900 text-white dark:text-earth-900 dark:bg-primary font-bold rounded-xl hover:bg-earth-800 dark:hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
                >
                    {formStatus === 'submitting' ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Enviando...</span>
                        </>
                    ) : (
                        'Enviar Mensaje'
                    )}
                </button>
            </form>
        </div>
    );
}
