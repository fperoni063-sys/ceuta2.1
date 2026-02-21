import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react';

async function getDashboardStats() {
    const supabase = await createClient();

    // Get course count
    const { count: cursosCount } = await supabase
        .from('cursos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true);

    // Get enrollees count
    const { count: inscriptosCount } = await supabase
        .from('inscriptos')
        .select('*', { count: 'exact', head: true });

    // Get pagos a verificar
    const { count: pagoAVerificarCount } = await supabase
        .from('inscriptos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pago_a_verificar');

    // Get verified enrollees
    const { count: verificadosCount } = await supabase
        .from('inscriptos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'verificado');

    return {
        cursos: cursosCount || 0,
        inscriptos: inscriptosCount || 0,
        pagoAVerificar: pagoAVerificarCount || 0,
        verificados: verificadosCount || 0,
    };
}

async function getRecentEnrollees() {
    const supabase = await createClient();

    const { data } = await supabase
        .from('inscriptos')
        .select(`
      id,
      nombre,
      email,
      estado,
      created_at,
      cursos (nombre)
    `)
        .order('created_at', { ascending: false })
        .limit(5);

    return data || [];
}

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();
    const recentEnrollees = await getRecentEnrollees();

    const statCards = [
        {
            label: 'Cursos Activos',
            value: stats.cursos,
            icon: BookOpen,
            color: 'bg-blue-500',
        },
        {
            label: 'Total Inscriptos',
            value: stats.inscriptos,
            icon: Users,
            color: 'bg-green-500',
        },
        {
            label: 'Pago a Verificar',
            value: stats.pagoAVerificar,
            icon: DollarSign,
            color: 'bg-yellow-500',
        },
        {
            label: 'Verificados',
            value: stats.verificados,
            icon: TrendingUp,
            color: 'bg-[var(--color-accent)]',
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-serif font-bold text-foreground">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent Enrollees */}
            <Card className="p-6">
                <h2 className="text-lg font-medium text-foreground mb-4">Inscripciones Recientes</h2>
                {recentEnrollees.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No hay inscripciones aún.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nombre</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Curso</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {recentEnrollees.map((enrollee: any) => (
                                    <tr key={enrollee.id} className="border-b last:border-0">
                                        <td className="py-3 px-4">{enrollee.nombre}</td>
                                        <td className="py-3 px-4 text-muted-foreground/80">{enrollee.email}</td>
                                        <td className="py-3 px-4 text-muted-foreground/80">
                                            {enrollee.cursos?.nombre || 'N/A'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${enrollee.estado === 'verificado'
                                                ? 'bg-green-100 text-green-700'
                                                : enrollee.estado === 'pago_a_verificar'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : enrollee.estado === 'primer_contacto'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : enrollee.estado === 'segundo_contacto'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : enrollee.estado === 'cancelado'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {enrollee.estado === 'pago_pendiente' ? 'Pago pendiente'
                                                    : enrollee.estado === 'pago_a_verificar' ? 'Pago a verificar'
                                                        : enrollee.estado === 'primer_contacto' ? 'Primer contacto'
                                                            : enrollee.estado === 'segundo_contacto' ? 'Segundo contacto'
                                                                : enrollee.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
