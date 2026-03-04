'use server'

import { createAdminClient } from '@/lib/supabase/server';
import { cookies, headers } from 'next/headers';

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

        const eventData = {
            session_id: sessionId,
            event_name: eventName,
            event_category: options?.category || 'general',
            page_path: options?.pagePath,
            course_id: options?.courseId,
            metadata: options?.metadata || {},
            utm_source: options?.utm?.source,
            utm_medium: options?.utm?.medium,
            utm_campaign: options?.utm?.campaign,
        };

        await supabase.from('analytics_events').insert(eventData);

    } catch (error) {
        console.error('Error tracking event:', error);
    }
}

export async function getFunnelStats(startDate?: string, endDate?: string) {
    const supabase = createAdminClient();

    // Base query
    let query = supabase.from('analytics_events').select('*');
    if (startDate) {
        // UYT is UTC-3, so 00:00 UYT is 03:00 UTC
        query = query.gte('created_at', `${startDate}T03:00:00.000Z`);
    }
    if (endDate) {
        // 23:59:59 UYT -> +24h - 1ms from 03:00 UTC that day
        const endUtc = new Date(new Date(`${endDate}T03:00:00.000Z`).getTime() + 86399999).toISOString();
        query = query.lte('created_at', endUtc);
    }

    // Fetch critical events for funnel
    // Note: handling large datasets in memory is bad, but for 'super basic' internal tool with low traffic it's fine.
    // For scale, use SQL aggregations or RPC.
    const { data: events, error } = await query.in('event_name', [
        'enrollment_modal_open',
        'enrollment_step_1_complete',
        'enrollment_step_2_complete',
        'enrollment_step_3_view',
        'enrollment_payment_method_click',
        'enrollment_step_4_view',
        'enrollment_comprobante_upload',
        'course_view'
    ]);

    if (error) throw error;

    // Process events
    const stats = {
        totalVisits: new Set<string>(),
        homeVisits: new Set<string>(),
        courseVisits: new Set<string>(),
        funnel: {
            step0_open: new Set<string>(),
            step1_contact: new Set<string>(),
            step2_details: new Set<string>(),
            step3_payment: new Set<string>(),
            step4_confirmation: new Set<string>(),
            step5_upload: new Set<string>(),
        },
        paymentMethods: {
            mercadopago: new Set<string>(),
            transferencia: new Set<string>(),
            efectivo: new Set<string>()
        },
        dropOffs: {
            step1: 0,
            step2: 0,
            step3: 0,
            step4: 0
        }
    };

    events?.forEach((e: any) => {
        const sid = e.session_id;

        if (e.event_name === 'course_view') {
            stats.totalVisits.add(sid);
            stats.courseVisits.add(sid);
        }

        if (e.event_name === 'home_view') {
            stats.totalVisits.add(sid);
            stats.homeVisits.add(sid);
        }

        if (e.event_name === 'enrollment_modal_open') stats.funnel.step0_open.add(sid);
        if (e.event_name === 'enrollment_step_1_complete') stats.funnel.step1_contact.add(sid);
        if (e.event_name === 'enrollment_step_2_complete') stats.funnel.step2_details.add(sid);
        if (e.event_name === 'enrollment_step_3_view') stats.funnel.step3_payment.add(sid);
        if (e.event_name === 'enrollment_step_4_view') stats.funnel.step4_confirmation.add(sid); // Intent to pay confirmed
        if (e.event_name === 'enrollment_comprobante_upload') stats.funnel.step5_upload.add(sid);

        if (e.event_name === 'enrollment_payment_method_click') {
            const method = e.metadata?.method;
            if (method === 'mercadopago') stats.paymentMethods.mercadopago.add(sid);
            if (method === 'transferencia') stats.paymentMethods.transferencia.add(sid);
            if (method === 'efectivo') stats.paymentMethods.efectivo.add(sid);
        }
    });

    return {
        visits: stats.totalVisits.size,
        homeVisits: stats.homeVisits.size,
        courseVisits: stats.courseVisits.size,
        funnel: {
            open: stats.funnel.step0_open.size,
            contact: stats.funnel.step1_contact.size,
            details: stats.funnel.step2_details.size,
            payment: stats.funnel.step3_payment.size,
            confirmation: stats.funnel.step4_confirmation.size,
            upload: stats.funnel.step5_upload.size
        },
        paymentMethods: {
            mercadopago: stats.paymentMethods.mercadopago.size,
            transferencia: stats.paymentMethods.transferencia.size,
            efectivo: stats.paymentMethods.efectivo.size
        }
    };
}

export async function getCourseVisitsStats(startDate?: string, endDate?: string) {
    const supabase = createAdminClient();

    // Fetch course_view events
    let query = supabase
        .from('analytics_events')
        .select('course_id, session_id')
        .eq('event_name', 'course_view')
        .not('course_id', 'is', null);

    if (startDate) {
        query = query.gte('created_at', `${startDate}T03:00:00.000Z`);
    }
    if (endDate) {
        const endUtc = new Date(new Date(`${endDate}T03:00:00.000Z`).getTime() + 86399999).toISOString();
        query = query.lte('created_at', endUtc);
    }

    const { data: events, error } = await query;

    if (error) {
        console.error('Error fetching course visits:', error);
        return [];
    }

    // Aggregate by course_id
    const courseVisits = new Map<number, { views: number; uniqueVisitors: Set<string> }>();

    events?.forEach((e: { course_id: number; session_id: string }) => {
        if (!courseVisits.has(e.course_id)) {
            courseVisits.set(e.course_id, { views: 0, uniqueVisitors: new Set() });
        }
        const stats = courseVisits.get(e.course_id)!;
        stats.views++;
        stats.uniqueVisitors.add(e.session_id);
    });

    // Fetch course names
    const courseIds = Array.from(courseVisits.keys());
    if (courseIds.length === 0) return [];

    const { data: courses } = await supabase
        .from('cursos')
        .select('id, nombre, slug')
        .in('id', courseIds);

    // Combine and sort by views
    const result = courseIds.map(id => {
        const stats = courseVisits.get(id)!;
        const course = courses?.find(c => c.id === id);
        return {
            courseId: id,
            courseName: course?.nombre || `Curso #${id}`,
            slug: course?.slug || String(id),
            views: stats.views,
            uniqueVisitors: stats.uniqueVisitors.size
        };
    });

    // Sort by views descending
    result.sort((a, b) => b.views - a.views);

    return result;
}

export async function getDailyStats(startDateStr?: string, endDateStr?: string) {
    const supabase = createAdminClient();

    // Date range defaulting to last 30 days if not heavily specified (UYT boundaries)
    const endStr = endDateStr || new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString().split('T')[0];
    const startStr = startDateStr || new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Build the UTC limits to query Supabase
    const startUtc = `${startStr}T03:00:00.000Z`;
    const endUtc = new Date(new Date(`${endStr}T03:00:00.000Z`).getTime() + 86399999).toISOString();

    let query = supabase
        .from('analytics_events')
        .select('created_at, event_name, session_id')
        .gte('created_at', startUtc)
        .lte('created_at', endUtc);

    const { data: events, error } = await query;
    if (error) {
        console.error('Error fetching daily stats:', error);
        return [];
    }

    // Initialize map of days
    const dailyMap = new Map<string, {
        date: string;
        home_views: Set<string>;
        course_views: Set<string>;
        open_modals: Set<string>;
        uploads: Set<string>;
    }>();

    // Generate strict date array by iterating UTC midnight-to-midnight mathematically to prevent TZ skips
    const startObj = new Date(startUtc);
    const endObj = new Date(endUtc);

    // Safety check max 365 days
    let currentMs = startObj.getTime();
    while (currentMs <= endObj.getTime()) {
        const d = new Date(currentMs);
        const dateKey = d.toISOString().split('T')[0];
        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, {
                date: dateKey,
                home_views: new Set(),
                course_views: new Set(),
                open_modals: new Set(),
                uploads: new Set()
            });
        }
        currentMs += 86400000; // +1 exact strictly 24 hours UTC
    }

    events?.forEach((e: { created_at: string, event_name: string, session_id: string }) => {
        // e.created_at is UTC. To get the UYT date string visually, we subtract 3 hours in ms.
        const uytDateStr = new Date(new Date(e.created_at).getTime() - 3 * 60 * 60 * 1000).toISOString().split('T')[0];

        if (!dailyMap.has(uytDateStr)) return;

        const dayStats = dailyMap.get(uytDateStr)!;

        if (e.event_name === 'home_view') dayStats.home_views.add(e.session_id);
        if (e.event_name === 'course_view') dayStats.course_views.add(e.session_id);
        if (e.event_name === 'enrollment_modal_open') dayStats.open_modals.add(e.session_id);
        if (e.event_name === 'enrollment_comprobante_upload') dayStats.uploads.add(e.session_id);
    });

    const result = Array.from(dailyMap.values()).map(d => ({
        date: d.date,
        homeVisits: d.home_views.size,
        courseVisits: d.course_views.size,
        modalOpens: d.open_modals.size,
        conversions: d.uploads.size,
    }));

    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
}
