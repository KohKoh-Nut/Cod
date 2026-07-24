"use client";

import { createContext, useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: ResolvedTheme;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

// holds the theme state in one place so every consumer (theme switcher,
// editor, etc) shares the same source of truth instead of each reading
// localStorage separately
export default function ThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [theme, setTheme] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

    // restore the saved preference on first load
    useEffect(() => {
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored) setTheme(stored);
    }, []);

    // switches the actual dark/light classes on the html element
    const applyTheme = (isDark: boolean) => {
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.classList.toggle("light", !isDark);
        setResolvedTheme(isDark ? "dark" : "light");
    };

    // re-applies whenever the chosen theme changes, resolving "system"
    // against the OS preference
    useEffect(() => {
        if (theme === "system") {
            applyTheme(
                window.matchMedia("(prefers-color-scheme: dark)").matches,
            );
        } else {
            applyTheme(theme === "dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    // keeps "system" mode in sync if the OS preference changes while open
    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === "system") applyTheme(e.matches);
        };
        media.addEventListener("change", handleChange);
        return () => media.removeEventListener("change", handleChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
