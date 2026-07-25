import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { useAutoScroll } from "@/hooks/editor/useAutoScroll";

// jsdom doesn't implement scrollTo or real layout at all, so every
// element needs it stubbed before the very first render -- the hook's
// effect fires on mount too, before a test gets a chance to set its
// own scroll metrics
beforeEach(() => {
    Element.prototype.scrollTo = vi.fn();
});

function setScrollMetrics(
    el: HTMLElement,
    { scrollHeight = 0, scrollTop = 0, clientHeight = 0 },
) {
    Object.defineProperty(el, "scrollHeight", { value: scrollHeight, configurable: true });
    Object.defineProperty(el, "scrollTop", { value: scrollTop, configurable: true });
    Object.defineProperty(el, "clientHeight", { value: clientHeight, configurable: true });
    // fresh mock so assertions below only see calls made after this point
    el.scrollTo = vi.fn();
}

function TestComponent({ dep }: { dep: unknown }) {
    const ref = useAutoScroll(dep);
    return <div ref={ref} data-testid="scroll-box" />;
}

describe("useAutoScroll", () => {
    it("scrolls to the bottom when already near the bottom", () => {
        const { getByTestId, rerender } = render(<TestComponent dep={1} />);
        const box = getByTestId("scroll-box") as HTMLDivElement;
        // 1000 - 900 - 100 = 0, well within the 150px threshold
        setScrollMetrics(box, { scrollHeight: 1000, scrollTop: 900, clientHeight: 100 });

        rerender(<TestComponent dep={2} />);

        expect(box.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: "smooth" });
    });

    it("does not scroll when far from the bottom and not at the top", () => {
        const { getByTestId, rerender } = render(<TestComponent dep={1} />);
        const box = getByTestId("scroll-box") as HTMLDivElement;
        // 1000 - 200 - 100 = 700px away, well over the threshold
        setScrollMetrics(box, { scrollHeight: 1000, scrollTop: 200, clientHeight: 100 });

        rerender(<TestComponent dep={2} />);

        expect(box.scrollTo).not.toHaveBeenCalled();
    });

    it("scrolls when scrollTop is exactly 0, even if that's far from the bottom", () => {
        // covers a container that hasn't scrolled at all yet (e.g. first
        // render with content already taller than the box)
        const { getByTestId, rerender } = render(<TestComponent dep={1} />);
        const box = getByTestId("scroll-box") as HTMLDivElement;
        setScrollMetrics(box, { scrollHeight: 1000, scrollTop: 0, clientHeight: 100 });

        rerender(<TestComponent dep={2} />);

        expect(box.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: "smooth" });
    });

    it("does not scroll again when the dependency doesn't change", () => {
        const { getByTestId, rerender } = render(<TestComponent dep={1} />);
        const box = getByTestId("scroll-box") as HTMLDivElement;
        setScrollMetrics(box, { scrollHeight: 1000, scrollTop: 900, clientHeight: 100 });

        rerender(<TestComponent dep={1} />);

        // effect only depends on `dependency`, and it didn't change
        expect(box.scrollTo).not.toHaveBeenCalled();
    });

    it("treats the 150px threshold as the edge of 'near the bottom'", () => {
        const { getByTestId, rerender } = render(<TestComponent dep={1} />);
        const box = getByTestId("scroll-box") as HTMLDivElement;
        // 1000 - 750 - 100 = 150, right at the boundary, should still scroll
        setScrollMetrics(box, { scrollHeight: 1000, scrollTop: 750, clientHeight: 100 });

        rerender(<TestComponent dep={2} />);

        expect(box.scrollTo).toHaveBeenCalled();
    });
});
