'use server'

import { createAdminClient } from '@/lib/supabase/server';
import { cookies, headers } from 'next/headers';

// Los eventos de analítica se borran recién pasados estos días. Antes, la compu de Franco
// los baja a la carpeta "Ceuta trafico web" (tarea "Ceuta Respaldo Trafico Web").
const DIAS_MINIMOS_ANALYTICS = 90;

function tipoDeDispositivo(userAgent: string): 'celular' | 'tablet' | 'compu' {
    if (/iPad|Tablet/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent))) return 'tablet';
    if (/Mobi|iPhone|Android/i.test(userAgent)) return 'celular';
    return 'compu';
}

// Navegador interno de una app, cuando se abre un enlace desde Instagram o Facebook.
function appDelNavegador(userAgent: string): 'instagram' | 'facebook' | undefined {
    if (/Instagram/i.test(userAgent)) return 'instagram';
    if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(userAgent)) return 'facebook';
    return undefined;
}

// Solo un sitio (https://l.instagram.com), nunca una dirección completa.
function limpiarSitio(referrer?: string | null): string | null {
    if (!referrer) return null;
    return /^https?:\/\/[^\s/?#]{1,100}$/i.test(referrer) ? referrer : null;
}

function recortar(texto?: string | null): string | null {
    return texto ? String(texto).slice(0, 100) : null;
}

/**
 * Tracks a user event for internal analytics.
 */
export async function trackEvent(
    eventName: string,
    options?: {
        category?: string;
        pagePath?: string;
        courseId?: number;
        metadata?: Record<string, unknown>;
        referrer?: string | null;
        utm?: {
            source?: string | null;
            medium?: string | null;
            campaign?: string | null;
        }
    }
) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('ceuta_analytics_sid')?.value;

        if (!sessionId) {
            return;
        }

        const reqHeaders = await headers();
        const userAgent = reqHeaders.get('user-agent') || '';

        // Comprehensive bot/crawler exclusion list
        if (/bot|crawler|spider|crawling|headless|lighthouse|vercel|googlebot|bingbot|yandex|slurp|duckduckbot|baiduspider|twitterbot|facebookexternalhit|linkedinbot|embedly|slackbot|whatsapp/i.test(userAgent)) {
            return;
        }

        const supabase = createAdminClient();

        const app = appDelNavegador(userAgent);
        const eventData = {
            session_id: sessionId,
            event_name: eventName,
            event_category: options?.category || 'general',
            page_path: options?.pagePath,
            course_id: options?.courseId,
            metadata: {
                dispositivo: tipoDeDispositivo(userAgent),
                ...(app ? { app } : {}),
                ...(options?.metadata || {}),
            },
            utm_source: recortar(options?.utm?.source),
            utm_medium: recortar(options?.utm?.medium),
            utm_campaign: recortar(options?.utm?.campaign),
            referrer: limpiarSitio(options?.referrer),
        };

        await supabase.from('analytics_events').insert(eventData);

    } catch (error) {
        console.error('Error tracking event:', error);
    }
}

export async function getFunnelStats(startDate?: string, endDate?: string) {
    const supabase = createAdminClient();

    const startStr = startDate || new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endStr = endDate || new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString().split('T')[0];

    const startUtc = `${startStr}T03:00:00.000Z`;
    const endUtc = new Date(new Date(`${endStr}T03:00:00.000Z`).getTime() + 86399999).toISOString();

    try {
        const { data, error } = await supabase.rpc('get_analytics_funnel_stats', {
            start_utc: startUtc,
            end_utc: endUtc,
        });

        if (error) {
            console.error('Error calling get_analytics_funnel_stats RPC:', error);
            throw error;
        }

        if (data) {
            return data as {
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
        }
    } catch (err) {
        console.error('Fallback error in getFunnelStats:', err);
    }

    return {
        visits: 0,
        homeVisits: 0,
        courseVisits: 0,
        funnel: {
            open: 0,
            contact: 0,
            details: 0,
            payment: 0,
            confirmation: 0,
            upload: 0,
        },
        paymentMethods: {
            mercadopago: 0,
            transferencia: 0,
            efectivo: 0,
        }
    };
}

export async function getCourseVisitsStats(startDate?: string, endDate?: string) {
    const supabase = createAdminClient();

    const startStr = startDate || new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endStr = endDate || new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString().split('T')[0];

    const startUtc = `${startStr}T03:00:00.000Z`;
    const endUtc = new Date(new Date(`${endStr}T03:00:00.000Z`).getTime() + 86399999).toISOString();

    try {
        const { data, error } = await supabase.rpc('get_analytics_course_stats', {
            start_utc: startUtc,
            end_utc: endUtc,
        });

        if (error) {
            console.error('Error calling get_analytics_course_stats RPC:', error);
            return [];
        }

        return (data || []).map((row: { course_id: number; course_name: string; slug: string; views: number; unique_visitors: number }) => ({
            courseId: row.course_id,
            courseName: row.course_name,
            slug: row.slug,
            views: Number(row.views),
            uniqueVisitors: Number(row.unique_visitors),
        }));
    } catch (err) {
        console.error('Error in getCourseVisitsStats:', err);
        return [];
    }
}

export async function getDailyStats(startDateStr?: string, endDateStr?: string) {
    const supabase = createAdminClient();

    const startStr = startDateStr || new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endStr = endDateStr || new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString().split('T')[0];

    const startUtc = `${startStr}T03:00:00.000Z`;
    const endUtc = new Date(new Date(`${endStr}T03:00:00.000Z`).getTime() + 86399999).toISOString();

    try {
        const { data, error } = await supabase.rpc('get_analytics_daily_stats', {
            start_utc: startUtc,
            end_utc: endUtc,
        });

        if (error) {
            console.error('Error calling get_analytics_daily_stats RPC:', error);
            return [];
        }

        return (data || []).map((row: { date_str: string; home_visits: number; course_visits: number; modal_opens: number; conversions: number }) => ({
            date: row.date_str,
            homeVisits: Number(row.home_visits),
            courseVisits: Number(row.course_visits),
            modalOpens: Number(row.modal_opens),
            conversions: Number(row.conversions),
        }));
    } catch (err) {
        console.error('Error in getDailyStats:', err);
        return [];
    }
}

/**
 * Elimina los eventos de analytics con más de `daysToKeep` días de antigüedad (default y mínimo: 90 días).
 * Mantiene la base de datos dentro del límite gratuito de Supabase. Nunca borra nada más nuevo que
 * DIAS_MINIMOS_ANALYTICS, así el respaldo de la compu de Franco siempre llega antes.
 */
export async function purgeOldAnalyticsEvents(daysToKeep: number = DIAS_MINIMOS_ANALYTICS): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
        const dias = Number.isFinite(daysToKeep)
            ? Math.max(DIAS_MINIMOS_ANALYTICS, Math.floor(daysToKeep))
            : DIAS_MINIMOS_ANALYTICS;
        const supabase = createAdminClient();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - dias);
        const cutoffIso = cutoffDate.toISOString();

        // Eliminar eventos con created_at menor a la fecha límite
        const { error, count } = await supabase
            .from('analytics_events')
            .delete({ count: 'exact' })
            .lt('created_at', cutoffIso);

        if (error) {
            console.error('Error purgando eventos de analytics:', error);
            return { success: false, error: error.message };
        }

        console.log(`🧹 Purga de analytics completada: eliminados registros anteriores a ${cutoffIso} (total: ${count ?? 0})`);
        return { success: true, deletedCount: count ?? 0 };
    } catch (err) {
        console.error('Error inesperado purgando analytics:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
}

