"use client";

import { useEffect, useRef } from "react";

/**
 * Custom hook to automatically scroll a container to the bottom when a dependency updates,
 * preserving user scroll position if they have scrolled upward.
 */
export function useAutoScroll(dependency: unknown) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        // Threshold in pixels to determine if user is anchored close to the bottom
        const threshold = 150;

        const isNearBottom =
            container.scrollHeight -
                container.scrollTop -
                container.clientHeight <=
            threshold;

        // Snap or smooth scroll to the bottom if the user hasn't manually scrolled up
        if (isNearBottom || container.scrollTop === 0) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [dependency]);

    return scrollRef;
}
