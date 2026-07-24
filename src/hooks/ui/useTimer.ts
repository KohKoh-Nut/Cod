"use client";

import { useState, useEffect } from "react";

// simple stopwatch, counts up in seconds and formats as mm:ss
export function useTimer() {
    const [seconds, setSeconds] = useState(0);

    // tick once per second while mounted
    useEffect(() => {
        const intervalId = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(intervalId);
    }, []);

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    const reset = () => setSeconds(0);

    return {
        seconds,
        timeString,
        reset,
    };
}
