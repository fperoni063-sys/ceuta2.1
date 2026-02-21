import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react';

async function getCourses() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('cursos')
        .select('id, nombre, slug, precio, categoria, modalidad, activo, fecha_inicio, orden')
        .order('activo', { ascending: false }) // Activos primero
        .order('orden', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching courses:', error);
        return [];
    }

    return data || [];
}

export default async function AdminCursosPage() {
    const courses = await getCourses();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-foreground">Gestión de Cursos</h1>
                <Link href="/admin/cursos/nuevo">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Curso
                    </Button>
                </Link>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Orden</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nombre</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoría</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Modalidad</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Precio</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No hay cursos registrados. Crea el primero haciendo clic en &quot;Nuevo Curso&quot;.
                                    </td>
                                </tr>
                            ) : (
                                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                courses.map((course: any) => (
                                    <tr
                                        key={course.id}
                                        className={`border-b last:border-0 transition-colors ${course.activo
                                            ? 'hover:bg-muted'
                                            : 'bg-muted/60 opacity-70 hover:bg-muted hover:opacity-90'
                                            }`}
                                    >
                                        <td className="py-3 px-4 text-muted-foreground">{course.orden || '-'}</td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium text-foreground">{course.nombre}</p>
                                                <p className="text-xs text-muted-foreground">/cursos/{course.slug}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={course.activo ? "secondary" : "outline"} className={!course.activo ? "bg-background/50" : ""}>
                                                {course.categoria || 'Sin categoría'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">{course.modalidad || '-'}</td>
                                        <td className="py-3 px-4 text-foreground font-medium">
                                            ${course.precio?.toLocaleString('es-UY') || '0'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {course.activo ? (
                                                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                    <Eye className="w-4 h-4" /> Visible
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-muted-foreground text-sm font-medium">
                                                    <EyeOff className="w-4 h-4" /> Archivado
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link href={`/admin/cursos/${course.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Pencil className="w-4 h-4 mr-1" />
                                                    Editar
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
