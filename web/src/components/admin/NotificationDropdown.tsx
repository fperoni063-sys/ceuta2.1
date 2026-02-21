'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, FileText, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

import { NotificationItem } from '@/types/admin';

interface NotificationDropdownProps {
    onItemClick?: (item: NotificationItem) => void;
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-UY');
}

function isPdfFile(url: string): boolean {
    return url.toLowerCase().endsWith('.pdf');
}

export function NotificationDropdown({ onItemClick }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/admin/notificaciones');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setPendingCount(data.pendingCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Fetch on mount and periodically
    useEffect(() => {
        fetchNotifications();

        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetchNotifications().finally(() => setLoading(false));
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleItemClick = (item: NotificationItem) => {
        setIsOpen(false);
        if (onItemClick) {
            onItemClick(item);
        }
    };

    const handleViewAll = () => {
        setIsOpen(false);
        router.push('/admin/comprobantes?estado=pago_a_verificar');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-accent transition-colors"
                aria-label="Notificaciones"
            >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {pendingCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                        {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className={cn(
                    "absolute right-0 mt-2 w-80 bg-white dark:bg-card rounded-xl shadow-xl",
                    "border border-gray-200 dark:border-border",
                    "z-50 overflow-hidden",
                    "animate-in fade-in slide-in-from-top-2 duration-200"
                )}>
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-border bg-gray-50 dark:bg-muted/50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">Notificaciones</h3>
                            {pendingCount > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-[320px] overflow-y-auto">
                        {loading ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-sm mt-2">Cargando...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <Bell className="w-10 h-10 mx-auto text-muted-foreground/30" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    No hay comprobantes pendientes
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-border">
                                {notifications.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleItemClick(item)}
                                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors text-left"
                                    >
                                        {/* Icon */}
                                        <div className="shrink-0 w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                                            {isPdfFile(item.comprobante_url) ? (
                                                <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-foreground truncate">
                                                {item.nombre}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {item.cursos?.nombre || 'Comprobante nuevo'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                ${item.cursos?.precio || item.monto_pagado || 0} • {formatTimeAgo(item.updated_at)}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-border">
                            <button
                                onClick={handleViewAll}
                                className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors"
                            >
                                Ver todos los comprobantes
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
