"use client";

interface AnchoredButtonProps {
    label: string;
    onClick?: () => void;
}

export default function FloatingButton({
    label,
    onClick = () => {},
}: AnchoredButtonProps) {
    const base = [
        "fixed bottom-6 right-6 z-50",
        "text-xl pt-2",
        "aspect-square shrink-0 px-3 py-1",
        "hover:scale-110 active:scale-95",
        "flex items-center justify-center",
        "c-transition c-bg-normal c-border-normal c-label-muted",
    ].join(" ");

    const medium = ["md:text-2xl"].join(" ");

    const large = ["lg:text-4xl"].join(" ");

    return (
        <button
            onClick={onClick}
            type="button"
            className={`${base} ${medium} ${large}`}
        >
            {label}
        </button>
    );
}
