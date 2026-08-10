"use client";

import { useState, useEffect, useRef } from "react";

// localStorage key the timer's start time is kept under, so it keeps
// counting across page navigation instead of resetting to zero
const TIMER_START_KEY = "editor_timer_start";

// simple stopwatch, counts up in seconds and formats as mm:ss. Keeps
// running from the same start time across page navigation and refreshes,
// by persisting when it started rather than the elapsed count itself
export function useTimer() {
    const [seconds, setSeconds] = useState(0);
    const startRef = useRef<number>(0);

    useEffect(() => {
        // reuse a start time left over from a previous mount, if any,
        // otherwise this is a fresh session
        const stored = localStorage.getItem(TIMER_START_KEY);
        const start = stored ? Number(stored) : Date.now();
        if (!stored) localStorage.setItem(TIMER_START_KEY, String(start));
        startRef.current = start;

        const tick = () =>
            setSeconds(Math.floor((Date.now() - startRef.current) / 1000));

        tick();
        const intervalId = setInterval(tick, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    // starts the clock over from zero, both on screen and in storage
    const reset = () => {
        const start = Date.now();
        startRef.current = start;
        localStorage.setItem(TIMER_START_KEY, String(start));
        setSeconds(0);
    };

    return {
        seconds,
        timeString,
        reset,
    };
}
