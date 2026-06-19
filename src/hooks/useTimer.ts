"use client";
import { useState, useEffect } from "react";

export function useTimer() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, []);

    function formatTime() {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    return {
        seconds,
        timeString: formatTime(),
        reset: () => setSeconds(0),
    };
}
