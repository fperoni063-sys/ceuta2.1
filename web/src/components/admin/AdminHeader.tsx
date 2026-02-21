'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Menu } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { ReviewPaymentModal } from './ReviewPaymentModal';

interface AdminHeaderProps {
    user: User;
    onMenuClick?: () => void;
}

import { NotificationItem } from '@/types/admin';

export function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
    const [reviewItem, setReviewItem] = useState<NotificationItem | null>(null);

    const handleNotificationClick = (item: NotificationItem) => {
        setReviewItem(item);
    };

    return (
        <>
            <header className="h-16 bg-white dark:bg-card border-b border-gray-200 dark:border-border flex items-center justify-between px-6 transition-colors">
                <div className="flex items-center gap-4">
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-accent text-gray-600 dark:text-gray-300"
                        onClick={onMenuClick}
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-medium text-gray-800 dark:text-foreground">
                        Bienvenido, {user.email?.split('@')[0] || 'Admin'}
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationDropdown onItemClick={handleNotificationClick} />
                    <div className="w-8 h-8 bg-[var(--color-green-700)] dark:bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white nav-text text-sm font-medium">
                            {user.email?.[0]?.toUpperCase() || 'A'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Review Modal - triggered from notification dropdown */}
            <ReviewPaymentModal
                inscripto={reviewItem}
                isOpen={!!reviewItem}
                onClose={() => setReviewItem(null)}
                onUpdate={() => {
                    setReviewItem(null);
                    // Force refetch notifications by triggering a re-render
                    // The notification dropdown will fetch on its own
                }}
            />
        </>
    );
}
