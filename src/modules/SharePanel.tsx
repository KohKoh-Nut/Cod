"use client";

import { useState } from "react";

interface SharePanelProps {
    isOpen: boolean;
    onClose: () => void;
    shareUrl: string;
}

export default function SharePanel({
    isOpen,
    onClose,
    shareUrl,
}: SharePanelProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const isAuthRequired = shareUrl === "AUTH_REQUIRED";

    const handleLoginRedirect = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const { origin, pathname } = window.location;
        const baseSegments = pathname
            .split("/")
            .filter((s) => s && s !== "share" && s !== "profile");
        const basePath =
            baseSegments.length > 0 ? `/${baseSegments.join("/")}` : "";
        window.location.href = `${origin}${basePath}/profile`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Clipboard copy failed:", err);
        }
    };

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(
        "Check out this code snippet on Cod!",
    );

    const socialShares = [
        {
            name: "X / Twitter",
            url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            color: "hover:bg-abyssal-bark hover:text-dusty-parchment",
        },
        {
            name: "Facebook",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: "hover:bg-eucalyptus-smoke hover:text-abyssal-bark",
        },
        {
            name: "LinkedIn",
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: "hover:bg-river-ooze hover:text-abyssal-bark",
        },
        {
            name: "Reddit",
            url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
            color: "hover:bg-apricot-dust hover:text-abyssal-bark",
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="w-full max-w-md border border-border bg-bg-surface p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-fg-muted hover:text-fg transition p-1"
                    aria-label="Close panel"
                >
                    ✕
                </button>

                {isAuthRequired ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-error">
                            Authentication Required
                        </h3>
                        <p className="text-xs text-fg-muted leading-relaxed">
                            Sign in to save snapshots and enable network
                            sharing.
                        </p>
                        <a
                            href="#"
                            onClick={handleLoginRedirect}
                            className="block w-full text-center py-2.5 bg-brand hover:bg-brand-hover text-bg font-bold uppercase text-xs transition"
                        >
                            Log In / Register
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-fg">
                                Share Code Snippet
                            </h3>
                            <p className="text-xs text-fg-muted">
                                Your snapshot is live.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 border border-border bg-bg p-2">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="w-full bg-transparent text-xs text-interactive outline-none font-mono"
                            />
                            <button
                                onClick={handleCopy}
                                className={`px-3 py-1 text-xs font-bold font-mono transition uppercase ${copied ? "bg-success text-bg" : "bg-brand hover:bg-brand-hover text-bg"}`}
                            >
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>

                        <div className="space-y-2">
                            <span className="text-[11px] text-fg-muted font-bold uppercase tracking-wider">
                                Share to network:
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                {socialShares.map((platform) => (
                                    <a
                                        key={platform.name}
                                        href={platform.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`text-center py-2 text-xs font-bold border border-border bg-bg-element text-fg transition ${platform.color}`}
                                    >
                                        {platform.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
