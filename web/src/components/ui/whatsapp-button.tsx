'use client';

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface WhatsAppButtonProps {
    /** Custom message to pre-load. If not provided, uses a default greeting. */
    message?: string;
    /** Custom phone number. Defaults to NEXT_PUBLIC_WHATSAPP_BOT env var. */
    phoneNumber?: string;
}

export function WhatsAppButton({ message, phoneNumber }: WhatsAppButtonProps = {}) {
    const phone = phoneNumber || process.env.NEXT_PUBLIC_WHATSAPP_BOT || "59899123456";
    // Remove non-numeric characters for the link
    const cleanNumber = phone.replace(/\D/g, "");

    // Default pre-loaded message for general inquiries
    const defaultMessage = "Hola! Estoy visitando la web de CEUTA y me gustaría recibir información sobre los cursos.";
    const preloadedMessage = encodeURIComponent(message || defaultMessage);

    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${preloadedMessage}`;

    return (
        <div className="fixed bottom-6 right-6 z-50 group">
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-earth-900 text-white text-sm px-4 py-2 rounded-lg shadow-xl whitespace-nowrap font-medium">
                    ¿Tenés dudas? ¡Escribinos!
                    <div className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-earth-900"></div>
                </div>
            </div>

            {/* Pulse Effect */}
            <div className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-pulse group-hover:opacity-50 transition-opacity"></div>

            {/* Button */}
            <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "relative flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#22bf5b] hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30",
                    "animate-in fade-in zoom-in duration-500"
                )}
                aria-label="Contactar por WhatsApp"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 md:w-9 md:h-9"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.272-.57-.421" />
                </svg>
            </Link>
        </div>
    );
}
