"use client";

import { useState, useEffect } from "react";
import { useShareWithFriend, FriendOption } from "@/hooks/useShareWithFriend";
import { supabase } from "@/utils/supabase-client";

interface SharePanelProps {
    isOpen: boolean;
    onClose: () => void;
    shareUrl: string;
    // shareId is needed to tag friend-specific share records in share_recipients
    shareId?: string;
}

export default function SharePanel({
    isOpen,
    onClose,
    shareUrl,
    shareId,
}: SharePanelProps) {
    const [copied, setCopied] = useState(false);

    // Tab state — 'public' shows the shareable link, 'friend' shows the friend picker
    const [tab, setTab] = useState<'public' | 'friend'>('public');
    const [friends, setFriends] = useState<FriendOption[]>([]);
    const [selectedFriend, setSelectedFriend] = useState('');
    const [sharedSuccess, setSharedSuccess] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');

    const { shareWithFriend, isSharing, error } = useShareWithFriend(currentUserId);

    // Fetch the current user's session when the modal opens
    useEffect(() => {
        if (!isOpen) return;
        const init = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) 
                return;
            setCurrentUserId(sessionData.session.user.id);
        };
        init();
    }, [isOpen]);

    // Lazy-load friends only when friend tab is opened
    useEffect(() => {
        if (tab !== 'friend' || !currentUserId) 
            return;
        const loadFriends = async () => {
            const { data } = await supabase
                .from('friends')
                .select(`friend:profiles!friends_friend_id_fkey (id, username)`)
                .eq('user_id', currentUserId);
            setFriends((data ?? []).map((d: any) => ({
                id: d.friend.id,
                username: d.friend.username,
            })));
        };
        loadFriends();
    }, [tab, currentUserId]);

    if (!isOpen) 
        return null;

    // Special sentinel value returned when the user isn't logged in
    const isAuthRequired = shareUrl === "AUTH_REQUIRED";

    // Redirect to the profile/login page, preserving the app's base path
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

    // Copy the share URL to clipboard and show a temporary "Copied!" label
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Clipboard copy failed:", err);
        }
    };

    // Insert a share_recipients row linking this share to the selected friend
    const handleShareWithFriend = async () => {


        if (!selectedFriend || !shareId) 
            return;
        
        const ok = await shareWithFriend(shareId, selectedFriend);
        if (ok) {
            setSharedSuccess(
                `Shared with ${friends.find(f => f.id === selectedFriend)?.username ?? 'friend'}!`
            );
            // Clear success message after 3 seconds
            setTimeout(() => setSharedSuccess(''), 3000);
        }
    };

    // Pre-encode URL and text for social share links
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent("Check out this code snippet on Cod!");

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

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-fg-muted hover:text-fg transition p-1"
                    aria-label="Close panel"
                >
                    ✕
                </button>

                {/* Auth required state — shown when user is not logged in */}
                {isAuthRequired ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-error">
                            Authentication Required
                        </h3>
                        <p className="text-xs text-fg-muted leading-relaxed">
                            Sign in to save snapshots and enable network sharing.
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

                        {/* Tab toggle — switch between public link and friend picker */}
                        <div className="flex border border-border">
                            <button
                                onClick={() => setTab('public')}
                                className={`flex-1 py-1.5 text-xs font-mono font-bold uppercase transition
                                    ${tab === 'public'
                                        ? 'bg-brand text-bg'
                                        : 'bg-bg-element text-comment hover:text-fg'
                                    }`}
                            >
                                Public
                            </button>
                            <button
                                onClick={() => setTab('friend')}
                                className={`flex-1 py-1.5 text-xs font-mono font-bold uppercase transition
                                    ${tab === 'friend'
                                        ? 'bg-brand text-bg'
                                        : 'bg-bg-element text-comment hover:text-fg'
                                    }`}
                            >
                                Share with Friend
                            </button>
                        </div>

                        {/* Public tab — shareable link and social share buttons */}
                        {tab === 'public' && (
                            <>
                                {/* Copy link row */}
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

                                {/* Social share grid */}
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
                            </>
                        )}

                        {/* Friend tab — friend picker and share action */}
                        {tab === 'friend' && (
                            <div className="space-y-4">
                                {friends.length === 0 ? (
                                    <p className="text-xs text-fg-muted font-mono">
                                        You have no friends yet. Add friends to share with them.
                                    </p>
                                ) : (
                                    <>
                                        {/* Friend dropdown */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[11px] text-fg-muted font-bold uppercase tracking-wider">
                                                Select a friend:
                                            </span>
                                            <select
                                                value={selectedFriend}
                                                onChange={(e) => setSelectedFriend(e.target.value)}
                                                className="bg-bg-element text-fg border border-border px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand rounded-none w-full"
                                            >
                                                <option value="">-- Choose a friend --</option>
                                                {friends.map((f) => (
                                                    <option key={f.id} value={f.id}>
                                                        {f.username}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Share button — disabled until a friend is selected */}
                                        <button
                                            onClick={handleShareWithFriend}
                                            disabled={!selectedFriend || isSharing}
                                            className="w-full py-2 text-xs font-bold font-mono uppercase bg-brand hover:bg-brand-hover text-bg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSharing ? 'Sharing...' : 'Share'}
                                        </button>

                                        {/* Success and error feedback */}
                                        {sharedSuccess && (
                                            <p className="text-xs text-success font-mono">{sharedSuccess}</p>
                                        )}
                                        {error && (
                                            <p className="text-xs text-error font-mono">{error}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}