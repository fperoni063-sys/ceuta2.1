import React from 'react';

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

export function CourseVideo({ videoUrl, className = '' }: CourseVideoProps) {
    const videoData = parseVideoUrl(videoUrl);

    if (!videoData) return null;

    return (
        <div className={`w-full max-w-4xl mx-auto ${className}`}>
            <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-100" style={{ aspectRatio: '16/9' }}>
                {videoData.type === 'youtube' || videoData.type === 'vimeo' ? (
                    <iframe
                        src={videoData.embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title="Video promocional del curso"
                        style={{ border: 0 }}
                    />
                ) : (
                    <video 
                        controls 
                        className="absolute inset-0 w-full h-full object-contain"
                        src={videoData.url}
                        controlsList="nodownload"
                        playsInline
                    />
                )}
            </div>
            {videoData.type === 'native' && (
                <p className="text-xs text-center text-gray-400 mt-2">
                    Si el video no se reproduce correctamente, prueba usar un navegador diferente o avisa a la administración.
                </p>
            )}
        </div>
    );
}
