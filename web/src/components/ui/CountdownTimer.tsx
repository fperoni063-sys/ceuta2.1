'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CountdownTimerProps {
    targetDate: string | null | undefined; // Robust typing
    className?: string;
    showIcon?: boolean;
    variant?: 'subtle' | 'urgent' | 'minimal';
    expirationMessage?: string;
    label?: string;
}

export function CountdownTimer({
    targetDate,
    className,
    showIcon = true,
    variant = 'subtle',
    expirationMessage = "Oferta finalizada",
    label = "El descuento finaliza en:"
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isExpired: boolean;
        isValid: boolean;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false, isValid: false });

    useEffect(() => {
        if (!targetDate) {
            setTimeLeft(prev => ({ ...prev, isValid: false }));
            return;
        }

        const calculateTimeLeft = () => {
            const endDate = new Date(targetDate);
            // Validar fecha
            if (isNaN(endDate.getTime())) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false, isValid: false };
            }

            // Ajustar al final del día (23:59:59) si la fecha viene sin hora (estándar en este proyecto)
            // Si la fecha ya tiene hora específica, esto podría sobrescribirla, pero asumimos fechas de "día de vencimiento"
            // Verificamos si es medianoche exacta (local) lo cual suele indicar "solo fecha"
            if (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {
                endDate.setHours(23, 59, 59, 999);
            }

            const difference = endDate.getTime() - new Date().getTime();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                    isExpired: false,
                    isValid: true
                };
            } else {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isValid: true };
            }
        };

        // Initial calc
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    // No renderizar si no es válido, si ya expiró (opcional: mostrar mensaje), 
    // o si faltan más de 7 días (para mantener la "frescura" solicitada y no fatigar)
    if (!timeLeft.isValid) return null;
    if (timeLeft.isExpired) return null;

    // Lógica de "Frescura": Si faltan más de 7 días, no mostramos el contador para no generar ansiedad innecesaria 
    // ni parecer "spammy". Solo mostramos cuando la urgencia es REAL.
    if (timeLeft.days > 7) return null;

    // Colores sutiles y amigables (evitando rojos puros)
    const variantStyles = {
        subtle: "bg-amber-50/80 border-amber-100 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-100",
        urgent: "bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-900/20 dark:border-orange-800/30 dark:text-orange-100",
        minimal: "bg-transparent border-transparent text-gray-600 dark:text-gray-400 p-0"
    };

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all animate-in fade-in duration-700 select-none",
            variantStyles[variant],
            className
        )}>
            {/* Header: Icon + Label */}
            <div className="flex items-center gap-2 mb-1.5 opacity-90">
                {showIcon && <Clock className={cn("w-3.5 h-3.5", variant === 'urgent' && "animate-pulse text-orange-600")} />}
                <span className="text-xs font-bold uppercase tracking-wider text-center">
                    {label}
                </span>
            </div>

            {/* Timer Digits */}
            <div className="flex items-end gap-3 font-mono text-xl font-bold tabular-nums leading-none">
                {/* Días */}
                {timeLeft.days > 0 && (
                    <div className="flex flex-col items-center">
                        <span className="bg-white/60 px-2 py-1.5 rounded-lg min-w-[2.8rem] text-center shadow-sm backdrop-blur-[2px] border border-white/50">
                            {String(timeLeft.days).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] font-medium opacity-60 mt-1 uppercase tracking-wider">días</span>
                    </div>
                )}

                {timeLeft.days > 0 && <span className="opacity-30 pb-6 text-base font-light">:</span>}

                {/* Horas */}
                <div className="flex flex-col items-center">
                    <span className="bg-white/60 px-2 py-1.5 rounded-lg min-w-[2.8rem] text-center shadow-sm backdrop-blur-[2px] border border-white/50">
                        {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-medium opacity-60 mt-1 uppercase tracking-wider">hs</span>
                </div>

                <span className="opacity-30 pb-6 text-base font-light">:</span>

                {/* Minutos */}
                <div className="flex flex-col items-center">
                    <span className="bg-white/60 px-2 py-1.5 rounded-lg min-w-[2.8rem] text-center shadow-sm backdrop-blur-[2px] border border-white/50">
                        {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-medium opacity-60 mt-1 uppercase tracking-wider">min</span>
                </div>

                {/* Segundos - Solo si quedan menos de 24hs o si es variante urgente */}
                {(timeLeft.days === 0 || variant === 'urgent') && (
                    <>
                        <span className="opacity-30 pb-6 text-base font-light">:</span>
                        <div className="flex flex-col items-center">
                            <span className="bg-white/60 px-2 py-1.5 rounded-lg min-w-[2.8rem] text-center shadow-sm backdrop-blur-[2px] border border-white/50">
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] font-medium opacity-60 mt-1 uppercase tracking-wider">seg</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
