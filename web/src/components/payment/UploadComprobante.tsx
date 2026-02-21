'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileImage, FileText, Loader2, CheckCircle, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface UploadComprobanteProps {
    token: string;
    onSuccess: (url: string) => void;
    onError?: (message: string) => void;
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

export function UploadComprobante({ token, onSuccess, onError }: UploadComprobanteProps) {
    const [state, setState] = useState<UploadState>('idle');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Tipo de archivo no permitido. Solo JPG, PNG, WEBP, GIF o PDF.';
        }
        if (file.size > MAX_SIZE) {
            return 'Archivo muy grande. Máximo 10MB.';
        }
        return null;
    };

    const handleFile = useCallback((selectedFile: File) => {
        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            setState('error');
            onError?.(validationError);
            return;
        }

        setFile(selectedFile);
        setError(null);
        setState('idle');

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null); // PDF - no preview
        }
    }, [onError]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setState('idle');

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFile(droppedFile);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setState('dragging');
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setState('idle');
    }, []);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFile(selectedFile);
        }
    };

    const uploadFile = async () => {
        if (!file) return;

        setState('uploading');
        setProgress(0);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('token', token);

            // Simulate progress (actual progress would need XHR)
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            const response = await fetch('/api/inscripcion/comprobante', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al subir comprobante');
            }

            setProgress(100);
            setState('success');
            onSuccess(result.url);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al subir comprobante';
            setError(errorMessage);
            setState('error');
            onError?.(errorMessage);
        }
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        setState('idle');
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Success state
    if (state === 'success') {
        return (
            <div className="rounded-xl border-2 border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <p className="font-semibold text-green-800 dark:text-green-300">¡Comprobante enviado!</p>
                <p className="text-sm text-green-700 dark:text-green-400/80 mt-1">
                    Tu pago está siendo verificado. Te notificaremos cuando esté confirmado.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    "relative rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all",
                    state === 'dragging' && "border-green-500 bg-green-50 dark:bg-green-900/20",
                    state === 'error' && "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800",
                    state === 'idle' && file && "border-green-400 bg-green-50/50 dark:bg-green-900/10 dark:border-green-700",
                    state === 'idle' && !file && "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50",
                    state === 'uploading' && "border-blue-400 bg-blue-50 dark:bg-blue-900/20 pointer-events-none"
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                    onChange={handleInputChange}
                    className="hidden"
                />

                {state === 'uploading' ? (
                    <div className="text-center py-4">
                        <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3 animate-spin" />
                        <p className="font-medium text-blue-800 dark:text-blue-300">Subiendo comprobante...</p>
                        <div className="mt-3 w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
                            <div
                                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">{progress}%</p>
                    </div>
                ) : file ? (
                    <div className="flex items-center gap-4">
                        {/* Preview */}
                        <div className="flex-shrink-0">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-20 h-20 object-cover rounded-lg border"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-red-600" />
                                </div>
                            )}
                        </div>
                        {/* File info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        {/* Remove button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                reset();
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        {state === 'dragging' ? (
                            <FileImage className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
                        ) : (
                            <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        )}
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                            {state === 'dragging' ? 'Soltá el archivo aquí' : 'Arrastrá tu comprobante aquí'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            o hacé click para seleccionar
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            JPG, PNG, PDF (máx 10MB)
                        </p>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Upload button */}
            {file && state !== 'uploading' && (
                <button
                    onClick={uploadFile}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Upload className="w-5 h-5" />
                    Enviar comprobante
                </button>
            )}
        </div>
    );
}
