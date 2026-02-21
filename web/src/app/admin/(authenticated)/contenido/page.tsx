import { Card } from '@/components/ui/card';
import { FileText, Users, Image, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const contentSections = [
    {
        title: 'Equipo',
        description: 'Gestionar miembros del equipo de CEUTA',
        href: '/admin/contenido/equipo',
        icon: Users,
    },
    {
        title: 'Publicaciones',
        description: 'Artículos y recursos publicados',
        href: '/admin/contenido/publicaciones',
        icon: FileText,
    },
    {
        title: 'Galería',
        description: 'Fotos y videos institucionales',
        href: '/admin/contenido/galeria',
        icon: Image,
    },
    {
        title: 'Testimonios',
        description: 'Testimonios de alumnos para el slider',
        href: '/admin/contenido/testimonios',
        icon: MessageSquare,
    },
];

export default function AdminContenidoPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-serif font-bold text-foreground">Gestión de Contenido</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contentSections.map((section) => (
                    <Link key={section.href} href={section.href}>
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                    <section.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-medium text-foreground">{section.title}</h2>
                                    <p className="text-muted-foreground text-sm">{section.description}</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/50">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Nota sobre el contenido</h3>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    El contenido institucional (Nosotros, Programas, Publicaciones) está actualmente definido de forma estática en el código.
                    Para editarlo, contacte al desarrollador o modifique directamente los archivos en <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">src/app/</code>.
                </p>
            </Card>
        </div>
    );
}
