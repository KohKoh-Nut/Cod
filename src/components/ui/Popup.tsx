"use client";

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
    children: React.ReactNode;
}

// tailwind class for each supported popup width
const MAX_WIDTH_CLASSES: Record<NonNullable<PopupProps["maxWidth"]>, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
};

// shared modal shell (backdrop, card, close button) used by every popup
// in the app, so panels only need to provide their own content
export default function Popup({
    isOpen,
    onClose,
    title,
    description,
    maxWidth = "md",
    children,
}: PopupProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in p-4">
            <div
                className={`w-full ${MAX_WIDTH_CLASSES[maxWidth]} border border-border bg-bg-surface p-6 shadow-2xl relative rounded-none`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-fg-muted hover:text-fg transition p-1"
                    aria-label="Close panel"
                >
                    ✕
                </button>

                {(title || description) && (
                    <div className="mb-4">
                        {title && (
                            <h3 className="text-lg font-bold text-fg">
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="text-xs text-fg-muted mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {children}
            </div>
        </div>
    );
}
