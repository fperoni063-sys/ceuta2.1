'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { AdminSidebar, AdminHeader } from '@/components/admin';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

// Actually, I'll stick to a custom implementation or use what's available.
// The user doesn't have a Sheet component in the file list I saw earlier (only dialog.tsx, etc).
// I will implement a custom mobile sidebar using Dialog or just CSS state if preferred, but a simple state-based toggle is best.
// Wait, I can pass strict state from here to the Header and Sidebar.

export default function AdminLayoutClient({
    children,
    user
}: {
    children: React.ReactNode;
    user: User;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Mobile Sidebar Overlay/Drawer handled via CSS classes or conditional rendering? 
                Better to keep Sidebar distinct. 
                Let's use the AdminSidebar component which will now have a 'mobile' prop or simply handle its own responsiveness?
                Actually, simpler: AdminSidebar stays as is for desktop. 
                For mobile, we wrap it in a pseudo-modal.
            */}

            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden md:flex">
                <AdminSidebar />
            </div>

            {/* Mobile Sidebar - Visible when toggled 
                I will add a mobile specific prop to AdminSidebar or just reuse it 
                inside a localized overlay container in this client component.
            */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                    {/* Sidebar Content */}
                    <div className="fixed inset-y-0 left-0 w-64 bg-background shadow-xl animate-in slide-in-from-left">
                        <AdminSidebar mobile onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader
                    user={user}
                    onMenuClick={() => setSidebarOpen(true)}
                />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    {children}
                </main>
            </div>
        </div>
    );
}
