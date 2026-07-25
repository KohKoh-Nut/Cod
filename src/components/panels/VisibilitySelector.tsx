"use client";

import { ShareVisibility } from "@/types/share";

// label, and explanatory hint for each visibility level
const OPTIONS: { value: ShareVisibility; label: string; hint: string }[] = [
    {
        value: "public",
        label: "Public",
        hint: "Anyone with the link can view it.",
    },
    {
        value: "friends",
        label: "Friends",
        hint: "Only the friends you pick can view it.",
    },
    { value: "private", label: "Private", hint: "Only you can view it." },
];

interface VisibilitySelectorProps {
    value: ShareVisibility;
    onChange: (visibility: ShareVisibility) => void;
}

// three-way toggle for a share's visibility, showing a hint for
// whichever option is currently picked
export default function VisibilitySelector({
    value,
    onChange,
}: VisibilitySelectorProps) {
    const activeHint = OPTIONS.find((o) => o.value === value)?.hint;

    return (
        <div className="space-y-2">
            <span className="text-[11px] text-fg-muted font-bold uppercase tracking-wider">
                Who can view:
            </span>
            <div className="grid grid-cols-3 border border-border">
                {OPTIONS.map((opt, i) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`py-2 px-2 text-xs font-mono font-bold uppercase transition ${i > 0 ? "border-l border-border" : ""} ${
                            value === opt.value
                                ? "bg-brand text-bg"
                                : "bg-bg-element text-comment hover:text-fg"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
            <p className="text-[11px] text-fg-muted">{activeHint}</p>
        </div>
    );
}
