'use client';

import React, { useState } from 'react';

interface CourseVideoProps {
    videoUrl: string;
    className?: string;
}

function parseVideoUrl(url: string) {
    if (!url) return null;

    // YouTube (handles youtu.be, youtube.com/watch, youtube.com/embed)
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
        return { type: 'youtube', id: ytMatch[1], embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
    }

    // Vimeo (handles vimeo.com/ID and player.vimeo.com/video/ID)
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
        return { type: 'vimeo', id: vimeoMatch[1], embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
    }

    // Native Video (Cloudinary, mp4, etc.)
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('cloudinary.com/video')) {
        return { type: 'native', url };
    }

    // Link no soportado
    return null;
}

/**
 * Cuadro de inicio para un video de Cloudinary: el segundo 1 como imagen.
 * Sin esto, en el celular el reproductor queda negro hasta que se toca.
 */
function posterDeCloudinary(url: string): string | undefined {
    if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return undefined;
    return url.replace('/video/upload/', '/video/upload/so_1/').replace(/\.(mp4|webm|mov)(\?.*)?$/i, '.jpg');
}

export function CourseVideo({ videoUrl, className = '' }: CourseVideoProps) {
    const videoData = parseVideoUrl(videoUrl);

    // Los videos grabados con el celular son verticales. En un cuadro de 16:9
    // quedaban como una franja finita en el medio, con dos bandas negras.
    // Si el nombre dice "vertical" arranca así; si no, se ajusta al cargar.
    const [vertical, setVertical] = useState(() => /vertical/i.test(videoUrl));

    if (!videoData) return null;

    if (videoData.type === 'native' && videoData.url) {
        return (
            <div className={`w-full ${vertical ? 'max-w-[min(100%,calc(70vh*9/16))]' : 'max-w-4xl'} mx-auto ${className}`}>
                <div
                    className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-100"
                    style={{ aspectRatio: vertical ? '9/16' : '16/9' }}
                >
                    <video
                        controls
                        className="absolute inset-0 w-full h-full object-contain"
                        src={videoData.url}
                        poster={posterDeCloudinary(videoData.url)}
                        controlsList="nodownload"
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                            const v = e.currentTarget;
                            if (v.videoWidth && v.videoHeight) setVertical(v.videoHeight > v.videoWidth);
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full max-w-4xl mx-auto ${className}`}>
            <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-100" style={{ aspectRatio: '16/9' }}>
                <iframe
                    src={videoData.embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="Video promocional del curso"
                    style={{ border: 0 }}
                />
            </div>
        </div>
    );
}
