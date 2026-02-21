'use client';

import { useEffect, useRef } from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export function HomeTracker() {
    const { track } = useAnalytics();
    const tracked = useRef(false);

    useEffect(() => {
        if (!tracked.current) {
            tracked.current = true;
            track('home_view');
        }
    }, [track]);

    return null;
}
