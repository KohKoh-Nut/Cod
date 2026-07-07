'use client';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

const OPTIONS = [
  { value: 'system', label: 'System', icon: 'ti-device-laptop' },
  { value: 'light',  label: 'Light',  icon: 'ti-sun'           },
  { value: 'dark',   label: 'Dark',   icon: 'ti-moon'          },
] as const;

export default function ThemeSwiper() {
  const { theme, setTheme } = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const updateThumb = (index: number) => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;
    const option = track.children[index + 1] as HTMLElement; // +1 skips thumb
    thumb.style.left = `${option.offsetLeft - 3}px`;
    thumb.style.width = `${option.offsetWidth}px`;
  };

  useEffect(() => {
    const index = OPTIONS.findIndex((o) => o.value === theme);
    updateThumb(index === -1 ? 0 : index);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      const index = OPTIONS.findIndex((o) => o.value === theme);
      updateThumb(index === -1 ? 0 : index);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-comment">Appearance</p>
      <div
        ref={trackRef}
        role="radiogroup"
        aria-label="Theme"
        className="relative flex w-60 cursor-pointer select-none rounded-full border border-border bg-bg-surface p-[3px]"
      >
        {/* Sliding thumb */}
        <div
          ref={thumbRef}
          className="absolute top-[3px] bottom-[3px] rounded-full border border-border bg-bg-element transition-all duration-200 ease-in-out"
        />

        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={theme === opt.value}
            onClick={() => setTheme(opt.value)}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-xs transition-colors duration-200 ${
              theme === opt.value
                ? 'font-medium text-fg'
                : 'text-comment hover:text-fg-muted'
            }`}
          >
            <i className={`ti ${opt.icon}`} aria-hidden="true" />
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}