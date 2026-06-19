"use client";
import { useEffect, useRef } from "react";

export function useAutoScroll(dependency: unknown) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        // don't hijack scroll if the user has scrolled up to read earlier content
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
