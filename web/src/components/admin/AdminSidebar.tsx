import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    Users,
    Receipt,
    Settings,
    Building2,
    LogOut,
    Mail,
    HelpCircle,
    FileImage,
    X,
    BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

const navItems = [
    {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Analítica',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        label: 'Cursos',
        href: '/admin/cursos',
        icon: BookOpen,
    },
    {
        label: 'Docentes',
        href: '/admin/docentes',
        icon: GraduationCap,
    },
    {
        label: 'Inscriptos',
        href: '/admin/inscriptos',
        icon: Users,
    },
    {
        label: 'Pagos',
        href: '/admin/pagos',
        icon: Receipt,
    },
    {
        label: 'Comprobantes',
        href: '/admin/comprobantes',
        icon: FileImage,
    },
    {
        label: 'Contenido',
        href: '/admin/contenido',
        icon: Building2,
    },
    {
        label: 'Configuración',
        href: '/admin/configuracion',
        icon: Settings,
    },
    {
        label: 'Email Templates',
        href: '/admin/email-templates',
        icon: Mail,
    },
    {
        label: 'FAQs Globales',
        href: '/admin/faqs',
        icon: HelpCircle,
    },
];

interface AdminSidebarProps {
    mobile?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ mobile, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <aside className={cn(
            "flex flex-col h-full",
            // Light mode: Earth-900 (Dark Brown), Dark mode: Neutral-900/Card (Dark Grey/Black)
            // We avoid using var(--color-earth-900) directly in dark mode because it flips to light.
            // Instead we use a specific dark color for dark mode background.
            "bg-[var(--color-earth-900)] dark:bg-card border-r dark:border-border",
            mobile ? "w-full" : "w-64"
        )}>
            {/* Logo */}
            <div className="p-6 border-b border-[var(--color-earth-900)]/20 dark:border-white/10 flex items-center justify-between">
                <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={onClose}>
                    <Image
                        src="/ceuta-logo.png"
                        alt="CEUTA Logo"
                        width={40}
                        height={40}
                        className="rounded-lg"
                    />
                    <div>
                        <h1 className="text-white dark:text-foreground font-serif font-bold">CEUTA</h1>
                        <p className="text-xs text-white/60 dark:text-muted-foreground">Panel Admin</p>
                    </div>
                </Link>
                {mobile && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white dark:text-foreground">
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-[var(--color-accent)] text-white dark:bg-primary dark:text-primary-foreground"
                                    : "text-white/70 hover:bg-white/10 hover:text-white dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 dark:border-border">
                <Button
                    variant="ghost"
                    onClick={() => {
                        handleSignOut();
                        if (onClose) onClose();
                    }}
                    className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 dark:text-muted-foreground dark:hover:bg-destructive/10 dark:hover:text-destructive"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Cerrar sesión
                </Button>
            </div>
        </aside>
    );
}
