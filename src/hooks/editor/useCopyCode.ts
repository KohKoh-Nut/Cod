import { useState } from "react";

// copies text to clipboard and briefly flags "copied" for UI feedback
export function useCopyCode() {
    const [copied, setCopied] = useState(false);

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);

            // reset the "copied" flag after 2 seconds
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return { copy, copied };
}
