import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { BookOpen, Users, DollarSign, TrendingUp, Eye, MousePointerClick, Globe } from 'lucide-react';
import { getFunnelStats } from '@/app/actions/analytics';

async function getAnalyticsDataSafe() {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);

        // Formatear YYYY-MM-DD
        const yearS = startDate.getFullYear();
        const monthS = String(startDate.getMonth() + 1).padStart(2, '0');
        const dayS = String(startDate.getDate()).padStart(2, '0');

        const yearE = endDate.getFullYear();
        const monthE = String(endDate.getMonth() + 1).padStart(2, '0');
        const dayE = String(endDate.getDate()).padStart(2, '0');

        const startStr = `${yearS}-${monthS}-${dayS}`;
        const endStr = `${yearE}-${monthE}-${dayE}`;

        return await getFunnelStats(startStr, endStr);
    } catch (e) {
        console.error("Fallo no crítico cargando analíticas en el dashboard:", e);
        return null;
    }
}

async function getDashboardStats() {
    const supabase = await createAdminClient();

    // Get course count
    const { count: cursosCount } = await supabase
        .from('cursos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true);

    // Get enrollees count (Reservas Totales: not cancelado/rechazado)
    const { count: inscriptosCount } = await supabase
        .from('inscriptos')
        .select('*', { count: 'exact', head: true })
        .neq('estado', 'cancelado')
        .neq('estado', 'rechazado');

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
    const supabase = await createAdminClient();

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
    const analytics = await getAnalyticsDataSafe();

    const statCards = [
        {
            label: 'Cursos Activos',
            value: stats.cursos,
            icon: BookOpen,
            color: 'bg-blue-500',
        },
        {
            label: 'Reservas Totales',
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
            label: 'Confirmados',
            value: stats.verificados,
            icon: TrendingUp,
            color: 'bg-[var(--color-accent)]',
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-serif font-bold text-foreground">Dashboard</h1>

            {/* Tráfico */}
            {analytics && (
                <div className="space-y-4 mb-8">
                    <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                        <Globe className="w-5 h-5 text-green-700" /> Rendimiento de Tráfico <span className="text-sm font-normal text-muted-foreground">(Últimos 30 días)</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 bg-slate-50/50 border-slate-200">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center`}>
                                    <MousePointerClick className="w-6 h-6 text-slate-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Solo Visitaron Landing</p>
                                    <p className="text-2xl font-bold text-slate-900">{analytics.homeVisits}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 bg-blue-50/30 border-blue-100">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center`}>
                                    <Eye className="w-6 h-6 text-blue-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-800">Entraron a Fichas de Curso</p>
                                    <p className="text-2xl font-bold text-blue-900">{analytics.courseVisits}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <h2 className="text-lg font-medium text-foreground mb-4">Estado Operativo Actual</h2>
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
