"use client";
import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/ui/useTheme";

// the three theme choices shown as segments in the swiper
const OPTIONS = [
    { value: "system", label: "System", icon: "ti-device-laptop" },
    { value: "light", label: "Light", icon: "ti-sun" },
    { value: "dark", label: "Dark", icon: "ti-moon" },
] as const;

// segmented control that slides a highlight thumb behind the active theme
export default function ThemeSwiper() {
    const { theme, setTheme } = useTheme();
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);

    // positions the sliding thumb under whichever option is active
    const updateThumb = (index: number) => {
        const track = trackRef.current;
        const thumb = thumbRef.current;
        if (!track || !thumb) return;
        // +1 skips the thumb element itself, which is track's first child
        const option = track.children[index + 1] as HTMLElement;
        thumb.style.left = `${option.offsetLeft - 3}px`;
        thumb.style.width = `${option.offsetWidth}px`;
    };

    // reposition the thumb whenever the active theme changes
    useEffect(() => {
        const index = OPTIONS.findIndex((o) => o.value === theme);
        updateThumb(index === -1 ? 0 : index);
    }, [theme]);

    // also reposition on window resize, since offsets are pixel-based
    useEffect(() => {
        const handleResize = () => {
            const index = OPTIONS.findIndex((o) => o.value === theme);
            updateThumb(index === -1 ? 0 : index);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [theme]);

    return (
        <div
            ref={trackRef}
            role="radiogroup"
            aria-label="Theme"
            className="relative flex w-60 cursor-pointer select-none rounded-none border border-border bg-bg-surface p-[3px]"
        >
            <div
                ref={thumbRef}
                className="absolute top-[3px] bottom-[3px] rounded-none border border-border bg-bg-element transition-all duration-200 ease-in-out"
            />

            {OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={theme === opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`relative z-10 flex flex-1 items-center justify-center gap-1 rounded-none py-1.5 text-xs transition-colors duration-200 ${
                        theme === opt.value
                            ? "font-medium text-fg"
                            : "text-comment hover:text-fg-muted"
                    }`}
                >
                    <i className={`ti ${opt.icon}`} aria-hidden="true" />
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
