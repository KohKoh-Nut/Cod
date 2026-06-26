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

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link:", err);
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
            color: "bg-bg-element text-fg hover:bg-abyssal-bark hover:text-dusty-parchment",
        },
        {
            name: "Facebook",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: "bg-bg-element text-fg hover:bg-eucalyptus-smoke hover:text-abyssal-bark",
        },
        {
            name: "LinkedIn",
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: "bg-bg-element text-fg hover:bg-river-ooze hover:text-abyssal-bark",
        },
        {
            name: "Reddit",
            url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
            color: "bg-bg-element text-fg hover:bg-apricot-dust hover:text-abyssal-bark",
        },
    ];

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-bg/80 font-mono backdrop-blur-sm animate-fade-in rounded-none">
            <div className="w-full max-w-md border border-border bg-bg-surface p-6 shadow-2xl rounded-none relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-fg-muted hover:text-fg text-sm transition cursor-pointer"
                >
                    ✕
                </button>

                <h3 className="text-lg font-bold text-fg mb-1">
                    Share Code Snippet
                </h3>
                <p className="text-xs text-fg-muted mb-4">
                    Your code snapshot is live and ready to share.
                </p>

                {/* Copy Link Input Group */}
                <div className="flex items-center gap-2 border border-border bg-bg p-2 mb-6 rounded-none">
                    <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="w-full bg-transparent text-xs text-interactive outline-none select-all font-mono"
                    />
                    <button
                        onClick={handleCopy}
                        className={`px-3 py-1 text-xs font-bold font-mono transition duration-200 ease-in-out uppercase rounded-none shrink-0 cursor-pointer ${
                            copied
                                ? "bg-success text-bg"
                                : "bg-brand hover:bg-brand-hover text-bg"
                        }`}
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>

                {/* Social Media Sharing Grid */}
                <div className="flex flex-col gap-2 rounded-none">
                    <span className="text-[11px] text-fg-muted font-bold uppercase tracking-wider">
                        Share to network:
                    </span>
                    <div className="grid grid-cols-2 gap-2 mt-1 rounded-none">
                        {socialShares.map((platform) => (
                            <a
                                key={platform.name}
                                href={platform.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-center py-2 text-xs font-bold transition duration-150 ease-in-out border border-border rounded-none cursor-pointer ${platform.color}`}
                            >
                                {platform.name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
