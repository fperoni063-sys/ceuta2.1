'use client';

import { useEffect, useRef } from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

interface CourseTrackerProps {
    courseId: number;
}

export function CourseTracker({ courseId }: CourseTrackerProps) {
    const { track } = useAnalytics();
    const tracked = useRef(false);

    useEffect(() => {
        if (!tracked.current) {
            tracked.current = true;
            // The hook automatically appends the UTM parameters and session ID
            track('course_view', {
                courseId,
                category: 'engagement'
            });
        }
    }, [track, courseId]);

    return null;
}
