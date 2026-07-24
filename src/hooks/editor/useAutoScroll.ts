"use client";

import { useEffect, useRef } from "react";

// scrolls a container to the bottom whenever dependency changes,
// but only if the user is already near the bottom (so it doesn't
// yank them down while they're reading something above)
export function useAutoScroll(dependency: unknown) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        const isNearBottom = distanceFromBottom <= 150;

        if (isNearBottom || container.scrollTop === 0) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [dependency]);

    return scrollRef;
}
