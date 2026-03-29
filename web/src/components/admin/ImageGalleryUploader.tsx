'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Loader2, ImageIcon, Plus } from 'lucide-react';

interface ImageGalleryUploaderProps {
    value: string[];
    onChange: (urls: string[]) => void;
    folder: 'cursos/galeria';
    label: string;
    helpText?: string;
}

export function ImageGalleryUploader({
    value = [],
    onChange,
    folder,
    label,
    helpText,
}: ImageGalleryUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const safeValue = Array.isArray(value) ? value : [];

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten archivos de imagen');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen no puede superar 5MB');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = 'Error al subir imagen';
                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    errorMessage = data.error || errorMessage;
                } else {
                    const text = await response.text();
                    if (response.status === 413 || text.includes('Request Entity Too Large')) {
                        errorMessage = 'La imagen es demasiado grande.';
                    } else {
                        errorMessage = text || errorMessage;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            // Append the new URL to the existing array
            onChange([...safeValue, data.url]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al subir imagen');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = (indexToRemove: number) => {
        const newArray = safeValue.filter((_, i) => i !== indexToRemove);
        onChange(newArray);
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            {helpText && (
                <p className="text-xs text-gray-500">{helpText}</p>
            )}

            <div className="flex flex-wrap gap-4">
                {/* Existing Images */}
                {safeValue.map((url, index) => (
                    <div key={index} className="relative aspect-[4/3] w-40 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 group">
                        <Image
                            src={url}
                            alt={`Galería ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                            title="Eliminar imagen"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {/* Upload Button */}
                <label className="relative aspect-[4/3] w-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer">
                    {uploading ? (
                        <>
                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                            <span className="mt-2 text-xs text-gray-500">Subiendo...</span>
                        </>
                    ) : (
                        <>
                            <Plus className="w-8 h-8 text-gray-400" />
                            <span className="mt-2 text-xs text-gray-500 font-medium">Agregar Imagen</span>
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />
                </label>
            </div>

            {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
        </div>
    );
}
