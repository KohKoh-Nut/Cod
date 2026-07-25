import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCopyCode } from "@/hooks/editor/useCopyCode";

describe("useCopyCode", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        Object.assign(navigator, {
            clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("starts with copied set to false", () => {
        const { result } = renderHook(() => useCopyCode());
        expect(result.current.copied).toBe(false);
    });

    it("writes the given text to the clipboard", async () => {
        const { result } = renderHook(() => useCopyCode());

        await act(async () => {
            await result.current.copy("print(1)");
        });

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("print(1)");
    });

    it("flips copied to true right after a successful copy", async () => {
        const { result } = renderHook(() => useCopyCode());

        await act(async () => {
            await result.current.copy("hello");
        });

        expect(result.current.copied).toBe(true);
    });

    it("flips copied back to false 2 seconds later", async () => {
        const { result } = renderHook(() => useCopyCode());

        await act(async () => {
            await result.current.copy("hello");
        });
        expect(result.current.copied).toBe(true);

        act(() => vi.advanceTimersByTime(2000));
        expect(result.current.copied).toBe(false);
    });

    it("does not flip copied to true when the clipboard write fails", async () => {
        (navigator.clipboard.writeText as any).mockRejectedValueOnce(
            new Error("denied"),
        );
        const { result } = renderHook(() => useCopyCode());

        await act(async () => {
            await result.current.copy("hello");
        });

        expect(result.current.copied).toBe(false);
    });
});
