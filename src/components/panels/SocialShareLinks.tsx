"use client";

interface SocialShareLinksProps {
    shareUrl: string;
    message?: string;
}

// row of share buttons for a given url, one per social platform
export default function SocialShareLinks({
    shareUrl,
    message = "Check out this code snippet on Cod!",
}: SocialShareLinksProps) {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(message);

    // each platform's own share-intent url format and hover color
    const platforms = [
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
        {
            name: "Telegram",
            url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
            color: "hover:bg-interactive hover:text-abyssal-bark",
        },
        {
            name: "WhatsApp",
            url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            color: "hover:bg-success hover:text-abyssal-bark",
        },
    ];

    return (
        <div className="space-y-2">
            <span className="text-[11px] text-fg-muted font-bold uppercase tracking-wider">
                Share to network:
            </span>
            <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
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
    );
}
