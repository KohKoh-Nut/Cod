"use client";

import { useEffect, useRef } from "react";

export function useAutoScroll(dependency: unknown) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        // Calculate how far the user is from the bottom of the container
        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        // Only scroll down if the user is close to the bottom
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
