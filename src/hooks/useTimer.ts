"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to track active session duration with automatic background accumulation.
 */
export function useTimer() {
    const [seconds, setSeconds] = useState<number>(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setSeconds((prevSeconds) => prevSeconds + 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Converts the raw active runtime seconds into a standard MM:SS string representation
    const getFormattedTime = () => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        const paddedMins = String(mins).padStart(2, "0");
        const paddedSecs = String(secs).padStart(2, "0");

        return `${paddedMins}:${paddedSecs}`;
    };

    return {
        seconds,
        timeString: getFormattedTime(),
        reset: () => setSeconds(0),
    };
}
