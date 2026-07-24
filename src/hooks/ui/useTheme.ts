import { useContext } from "react";
import { ThemeContext } from "@/components/ui/ThemeProvider";

// gives access to the current theme, must be called inside ThemeProvider
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}
