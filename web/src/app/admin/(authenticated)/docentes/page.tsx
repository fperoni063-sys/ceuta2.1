'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Pencil, User } from 'lucide-react';
import Image from 'next/image';

interface Docente {
    id: string;
    nombre: string;
    descripcion: string | null;
    foto_url: string | null;
}

export default function DocentesPage() {
    const [docentes, setDocentes] = useState<Docente[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/docentes')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setDocentes(data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-foreground">Docentes</h1>
                <Link href="/admin/docentes/nuevo">
                    <Button className="bg-[var(--color-green-700)] hover:bg-[var(--color-green-800)]">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Docente
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Cargando docentes...</div>
            ) : docentes.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">
                    No hay docentes registrados.
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {docentes.map((docente) => (
                        <Card key={docente.id} className="overflow-hidden flex flex-col">
                            <div className="relative h-48 bg-muted">
                                {docente.foto_url ? (
                                    <Image
                                        src={docente.foto_url}
                                        alt={docente.nombre}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <User className="w-16 h-16" />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg text-foreground mb-1">{docente.nombre}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                                    {docente.descripcion || 'Sin descripción'}
                                </p>
                                <Link href={`/admin/docentes/${docente.id}`} className="mt-auto">
                                    <Button variant="outline" className="w-full">
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Editar
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
