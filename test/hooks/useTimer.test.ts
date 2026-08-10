import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimer } from "@/hooks/ui/useTimer";

describe("useTimer", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("starts at 0 seconds", () => {
        const { result } = renderHook(() => useTimer());
        expect(result.current.seconds).toBe(0);
        expect(result.current.timeString).toBe("00:00");
    });

    it("ticks up by 1 second every second", () => {
        const { result } = renderHook(() => useTimer());

        act(() => vi.advanceTimersByTime(1000));
        expect(result.current.seconds).toBe(1);

        act(() => vi.advanceTimersByTime(3000));
        expect(result.current.seconds).toBe(4);
    });

    it("formats minutes and seconds with zero-padding", () => {
        const { result } = renderHook(() => useTimer());

        act(() => vi.advanceTimersByTime(65_000)); // 1:05
        expect(result.current.timeString).toBe("01:05");
    });

    it("reset sets seconds back to 0", () => {
        const { result } = renderHook(() => useTimer());

        act(() => vi.advanceTimersByTime(5000));
        expect(result.current.seconds).toBe(5);

        act(() => result.current.reset());
        expect(result.current.seconds).toBe(0);
    });

    it("keeps ticking after a reset", () => {
        const { result } = renderHook(() => useTimer());

        act(() => vi.advanceTimersByTime(5000));
        act(() => result.current.reset());
        act(() => vi.advanceTimersByTime(2000));

        expect(result.current.seconds).toBe(2);
    });
});
