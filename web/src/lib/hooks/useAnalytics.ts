'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { trackEvent } from '@/app/actions/analytics';
import Cookies from 'js-cookie';

const SESSION_COOKIE_NAME = 'ceuta_analytics_sid';
const SESSION_DURATION_DAYS = 30;

export function useAnalytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize cookie synchronously on first render to avoid race condition
    const [sessionId] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        let sid = Cookies.get(SESSION_COOKIE_NAME);
        if (!sid) {
            sid = uuidv4();
            // Use 'Lax' instead of 'Strict' so cookie is sent on Magic Link navigation
            Cookies.set(SESSION_COOKIE_NAME, sid, { expires: SESSION_DURATION_DAYS, sameSite: 'Lax' });
        }
        return sid;
    });

    // Track Hook
    const track = async (eventName: string, data?: {
        category?: string;
        courseId?: number;
        metadata?: Record<string, any>;
    }) => {
        // Get UTMs from URL context if present (for initial landing)
        // Note: Ideally useSearchParams only works for client navigation updates.
        // For persistent UTMs, we might check sessionStorage or cookies if we stored them.
        // For simplicity, we just grab current URL params.
        const utm = {
            source: searchParams.get('utm_source'),
            medium: searchParams.get('utm_medium'),
            campaign: searchParams.get('utm_campaign'),
        };

        await trackEvent(eventName, {
            ...data,
            pagePath: pathname,
            utm: {
                source: utm.source,
                medium: utm.medium,
                campaign: utm.campaign
            }
        });
    };

    return { track, sessionId };
}
