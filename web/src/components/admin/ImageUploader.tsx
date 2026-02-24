'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
    value: string | null;
    onChange: (url: string | null) => void;
    folder: 'cursos/portadas' | 'cursos/heroes' | 'docentes' | 'testimonios';
    label: string;
    helpText?: string;
    aspectRatio?: '4:3' | '21:9' | '1:1';
    size?: 'sm' | 'md';
}

export function ImageUploader({
    value,
    onChange,
    folder,
    label,
    helpText,
    aspectRatio = '4:3',
    size = 'md'
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const aspectClasses = {
        '4:3': 'aspect-[4/3]',
        '21:9': 'aspect-[21/9]',
        '1:1': 'aspect-square',
    };

    const sizeClasses = {
        'sm': 'max-w-[180px]',
        'md': 'max-w-md',
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten archivos de imagen');
            return;
        }

        // Validate file size (max 5MB)
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
                        errorMessage = 'La imagen es demasiado grande. El límite real del servidor es ~4.5MB.';
                    } else {
                        errorMessage = text || errorMessage;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            onChange(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al subir imagen');
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        onChange(null);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            {helpText && (
                <p className="text-xs text-gray-500">{helpText}</p>
            )}

            <div className={`relative ${aspectClasses[aspectRatio]} w-full ${sizeClasses[size]} border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors`}>
                {value ? (
                    <>
                        <Image
                            src={value}
                            alt={label}
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Eliminar imagen"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                        {uploading ? (
                            <>
                                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                                <span className="mt-2 text-sm text-gray-500">Subiendo...</span>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-10 h-10 text-gray-400" />
                                <span className="mt-2 text-sm text-gray-500">Click para subir imagen</span>
                                <span className="text-xs text-gray-400">PNG, JPG hasta 5MB</span>
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
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
