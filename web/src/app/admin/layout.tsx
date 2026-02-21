export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin | CEUTA Uruguay',
    description: 'Panel de administración CEUTA',
    robots: 'noindex, nofollow',
    icons: {
        icon: '/ceuta-logo.png',
        shortcut: '/ceuta-logo.png',
        apple: '/ceuta-logo.png',
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
