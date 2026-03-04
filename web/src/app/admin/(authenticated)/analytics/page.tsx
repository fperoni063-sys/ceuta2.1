'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFunnelStats, getCourseVisitsStats, getDailyStats } from '@/app/actions/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, TrendingUp, CreditCard, MousePointerClick, BookOpen, Eye, UserCheck, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type FunnelStats = {
    visits: number;
    homeVisits: number;
    courseVisits: number;
    funnel: {
        open: number;
        contact: number;
        details: number;
        payment: number;
        confirmation: number;
        upload: number;
    };
    paymentMethods: {
        mercadopago: number;
        transferencia: number;
        efectivo: number;
    };
};

type CourseVisit = {
    courseId: number;
    courseName: string;
    slug: string;
    views: number;
    uniqueVisitors: number;
};

type DailyStat = {
    date: string;
    homeVisits: number;
    courseVisits: number;
    modalOpens: number;
    conversions: number;
};

function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<FunnelStats | null>(null);
    const [courseVisits, setCourseVisits] = useState<CourseVisit[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
    const [loading, setLoading] = useState(true);

    // Default to last 30 days
    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return formatLocalDate(d);
    });
    const [endDate, setEndDate] = useState<string>(() => formatLocalDate(new Date()));

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getFunnelStats(startDate, endDate),
            getCourseVisitsStats(startDate, endDate),
            getDailyStats(startDate, endDate)
        ])
            .then(([funnelData, courseData, dailyData]) => {
                setStats(funnelData);
                setCourseVisits(courseData);
                setDailyStats(dailyData);
            })
            .finally(() => setLoading(false));
    }, [startDate, endDate]);

    if (loading && !stats) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-700" /></div>;
    }

    if (!stats) return <div>Error loading stats</div>;

    const conversionRate = stats.funnel.open > 0
        ? ((stats.funnel.upload / stats.funnel.open) * 100).toFixed(1)
        : '0';

    const funnelSteps = [
        { label: 'Modal Abierto', count: stats.funnel.open, color: 'bg-blue-500' },
        { label: 'Contacto (Paso 1)', count: stats.funnel.contact, color: 'bg-blue-400' },
        { label: 'Detalles (Paso 2)', count: stats.funnel.details, color: 'bg-blue-300' },
        { label: 'Vio Pago (Paso 3)', count: stats.funnel.payment, color: 'bg-indigo-300' },
        { label: 'Intención Pago (Paso 4)', count: stats.funnel.confirmation, color: 'bg-indigo-400' },
        { label: 'Comprobante Subido', count: stats.funnel.upload, color: 'bg-green-500' },
    ];

    const totalCourseViews = courseVisits.reduce((acc, c) => acc + c.views, 0);
    const maxDailyViews = Math.max(...dailyStats.map(d => d.homeVisits + d.courseVisits), 1);

    return (
        <div className="p-6 space-y-8 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-heading font-bold text-earth-900">Analítica Avanzada</h1>
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
                    <CalendarDays className="w-5 h-5 text-gray-400" />
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            className="text-sm px-2 py-1 rounded border-gray-200 outline-none focus:ring-1 focus:ring-green-700"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-gray-400 text-sm">hasta</span>
                        <input
                            type="date"
                            className="text-sm px-2 py-1 rounded border-gray-200 outline-none focus:ring-1 focus:ring-green-700"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Total (Home + Cursos)" value={stats.visits} icon={MousePointerClick}
                    diff={`Home: ${stats.homeVisits} - Cursos: ${stats.courseVisits}`} />
                <KpiCard title="Inicios de Inscripción" value={stats.funnel.open} icon={Users} />
                <KpiCard title="Inscripciones Finales" value={stats.funnel.upload} icon={TrendingUp} diff={conversionRate + '% Conv.'} />
                <KpiCard title="Intenciones de Pago" value={stats.funnel.confirmation} icon={CreditCard} />
            </div>

            {/* Daily Chart */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-earth-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-700" />
                        Tráfico Diario
                    </h3>
                    <div className="flex gap-4 text-xs font-medium">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-400"></div> Cursos</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-indigo-200"></div> Home</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Inscripciones</span>
                    </div>
                </div>

                <div className="h-[250px] flex items-end gap-1 sm:gap-2 mt-8 pb-4 border-b relative">
                    {/* Y-Axis scale markers */}
                    <div className="absolute left-0 top-0 bottom-0 w-full pointer-events-none flex flex-col justify-between text-xs text-gray-300">
                        <div className="border-t border-gray-100 w-full flex justify-end pr-2"><span className="-mt-2 bg-white px-1">{maxDailyViews}</span></div>
                        <div className="border-t border-gray-100 w-full flex justify-end pr-2"><span className="-mt-2 bg-white px-1">{Math.floor(maxDailyViews / 2)}</span></div>
                        <div className="border-t border-gray-100 w-full flex justify-end pr-2"><span className="-mt-2 bg-white px-1">0</span></div>
                    </div>

                    {dailyStats.map((day, idx) => {
                        const minH = 4; // minimum pixel height for anything > 0 
                        const courseH = day.courseVisits > 0 ? Math.max((day.courseVisits / maxDailyViews) * 200, minH) : 0;
                        const homeH = day.homeVisits > 0 ? Math.max((day.homeVisits / maxDailyViews) * 200, minH) : 0;
                        const convH = day.conversions > 0 ? Math.max((day.conversions / maxDailyViews) * 200, minH) : 0;
                        const dateLabel = new Date(day.date + 'T12:00:00Z').toLocaleDateString('es-UY', { month: 'short', day: 'numeric' });

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center group relative z-10">
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-gray-900 text-white text-xs p-2 rounded shadow-xl z-20 w-32 left-1/2 -translate-x-1/2 pointer-events-none">
                                    <span className="font-bold border-b border-gray-700 pb-1 mb-1">{dateLabel}</span>
                                    <span className="flex justify-between">Visitas Curso: <b>{day.courseVisits}</b></span>
                                    <span className="flex justify-between">Visitas Home: <b>{day.homeVisits}</b></span>
                                    <span className="flex justify-between text-blue-300">Aperturas: <b>{day.modalOpens}</b></span>
                                    <span className="flex justify-between text-green-300">Inscripciones: <b>{day.conversions}</b></span>
                                </div>
                                {/* Bars */}
                                <div className="w-full max-w-[20px] bg-indigo-200 rounded-t-sm transition-all flex flex-col justify-end" style={{ height: `${homeH + courseH}px` }}>
                                    {/* Home base */}
                                    <div className="w-full bg-blue-400 rounded-t-sm transition-all" style={{ height: `${courseH}px` }}></div>
                                    {/* Conversions overlay */}
                                    <div className="w-full bg-green-500 absolute bottom-0 left-0 transition-all opacity-80" style={{ height: `${convH}px` }}></div>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-2 truncate w-full text-center">
                                    {idx % Math.max(1, Math.floor(dailyStats.length / 10)) === 0 ? dateLabel : ''}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Course Visits Ranking */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-earth-900 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-green-700" />
                        Ranking de Cursos por Visitas
                    </h3>
                    <span className="text-sm text-gray-500">{totalCourseViews} visitas a cursos</span>
                </div>

                {courseVisits.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay datos de visitas aún para este período</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="pb-3 text-sm font-medium text-gray-500">#</th>
                                    <th className="pb-3 text-sm font-medium text-gray-500">Curso</th>
                                    <th className="pb-3 text-sm font-medium text-gray-500 text-right">
                                        <span className="flex items-center justify-end gap-1">
                                            <Eye className="w-3 h-3" /> Vistas
                                        </span>
                                    </th>
                                    <th className="pb-3 text-sm font-medium text-gray-500 text-right">
                                        <span className="flex items-center justify-end gap-1">
                                            <UserCheck className="w-3 h-3" /> Únicos
                                        </span>
                                    </th>
                                    <th className="pb-3 text-sm font-medium text-gray-500 text-right">% del Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {courseVisits.slice(0, 10).map((course, idx) => {
                                    const percentOfTotal = totalCourseViews > 0
                                        ? ((course.views / totalCourseViews) * 100).toFixed(1)
                                        : '0';
                                    return (
                                        <tr key={course.courseId} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 text-sm">
                                                <span className={cn(
                                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                                    idx === 0 ? "bg-yellow-100 text-yellow-700" :
                                                        idx === 1 ? "bg-gray-100 text-gray-600" :
                                                            idx === 2 ? "bg-orange-100 text-orange-700" :
                                                                "bg-gray-50 text-gray-400"
                                                )}>
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <Link
                                                    href={`/cursos/${course.slug}`}
                                                    className="text-sm font-medium text-earth-900 hover:text-green-700 transition-colors"
                                                    target="_blank"
                                                >
                                                    {course.courseName}
                                                </Link>
                                            </td>
                                            <td className="py-3 text-right">
                                                <span className="text-sm font-bold text-green-700">{course.views}</span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <span className="text-sm text-gray-600">{course.uniqueVisitors}</span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500 rounded-full transition-all"
                                                            style={{ width: `${percentOfTotal}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 w-10 text-right">{percentOfTotal}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Funnel Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-bold mb-6 text-earth-900">Embudo de Conversión</h3>
                    <div className="space-y-4">
                        {funnelSteps.map((step, idx) => {
                            const prevCount = idx === 0 ? step.count : funnelSteps[idx - 1].count;
                            const percentage = idx === 0 ? 100 : (prevCount > 0 ? (step.count / prevCount) * 100 : 0);
                            const widthPercent = stats.funnel.open > 0 ? (step.count / stats.funnel.open) * 100 : 0;

                            return (
                                <div key={step.label} className="relative">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{step.label}</span>
                                        <span className="text-gray-500">
                                            {step.count} usuarios
                                            {idx > 0 && <span className="text-xs ml-2 text-red-400">({(100 - percentage).toFixed(0)}% abandono)</span>}
                                        </span>
                                    </div>
                                    <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", step.color)}
                                            style={{ width: `${Math.max(widthPercent, 1)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Insights / Friccion */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-bold mb-4 text-earth-900">Métodos de Pago Preferidos</h3>
                        <div className="space-y-3">
                            <PaymentStat label="Mercado Pago" count={stats.paymentMethods.mercadopago} total={stats.funnel.payment} color="bg-cyan-100 text-cyan-700" />
                            <PaymentStat label="Transferencia" count={stats.paymentMethods.transferencia} total={stats.funnel.payment} color="bg-green-100 text-green-700" />
                            <PaymentStat label="Efectivo" count={stats.paymentMethods.efectivo} total={stats.funnel.payment} color="bg-orange-100 text-orange-700" />
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-100 p-6">
                        <h3 className="text-lg font-bold mb-2 text-amber-900">💡 Fricción Detectada</h3>
                        {stats.funnel.payment - stats.funnel.confirmation > 10 ? (
                            <p className="text-sm text-amber-800">
                                Hay una caída significativa ({stats.funnel.payment - stats.funnel.confirmation} usuarios) en el paso de pago.
                                Considera revisar los precios o agregar más opciones de financiación.
                            </p>
                        ) : (
                            <p className="text-sm text-amber-800">
                                El flujo parece saludable. La caída entre pasos es normal.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, diff }: { title: string, value: number, icon: React.ElementType, diff?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {diff && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {diff}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function PaymentStat({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
    const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
                <span className={cn("px-2 py-1 rounded text-xs font-bold", color)}>{percent}%</span>
                <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{count}</span>
        </div>
    );
}

