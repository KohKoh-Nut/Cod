"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase-client";
import { useFriendOptions } from "@/hooks/friends/useFriendOptions";
import { ShareVisibility } from "@/types/share";
import { ShareResult } from "@/hooks/share/useShareCode";
import Popup from "@/components/ui/Popup";
import VisibilitySelector from "@/components/panels/VisibilitySelector";
import FriendMultiSelect from "@/components/panels/FriendMultiSelect";
import SocialShareLinks from "@/components/panels/SocialShareLinks";

interface SharePanelProps {
    isOpen: boolean;
    onClose: () => void;
    isCreating: boolean;

    defaultVisibility: ShareVisibility;
    defaultFriendIds: string[];
    onCreateShare: (
        visibility: ShareVisibility,
        friendIds: string[],
    ) => Promise<ShareResult | "AUTH_REQUIRED" | null>;
}

// popup that walks through picking a visibility, generating a share
// link, and then showing/copying that link once created
export default function SharePanel({
    isOpen,
    onClose,
    isCreating,
    defaultVisibility,
    defaultFriendIds,
    onCreateShare,
}: SharePanelProps) {
    const [copied, setCopied] = useState(false);
    const [visibility, setVisibility] =
        useState<ShareVisibility>(defaultVisibility);
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    const [result, setResult] = useState<ShareResult | null>(null);
    const [authRequired, setAuthRequired] = useState(false);

    const { friends, loadFriends } = useFriendOptions();

    // reset to a fresh state each time the panel opens, and load the
    // friend list if the user is signed in
    useEffect(() => {
        if (!isOpen) return;
        setResult(null);
        setAuthRequired(false);
        setCopied(false);
        setVisibility(defaultVisibility);

        const init = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) return;
            await loadFriends(sessionData.session.user.id);
        };
        init();
    }, [isOpen, defaultVisibility, loadFriends]);

    // once friends are loaded, preselect whichever defaults are still
    // valid friends (e.g. carried over from forking a share)
    useEffect(() => {
        if (friends.length === 0) return;
        setSelectedFriendIds(
            defaultFriendIds.filter((id) => friends.some((f) => f.id === id)),
        );
    }, [friends, defaultFriendIds]);

    const handleCopy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Clipboard copy failed:", err);
        }
    };

    // sends the user to the profile/login page, stripping the current
    // share/profile segment out of the path first
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

    const toggleFriend = (id: string) => {
        setSelectedFriendIds((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
        );
    };

    // a friends-only share needs at least one friend picked
    const canGenerate =
        visibility !== "friends" || selectedFriendIds.length > 0;

    const handleGenerate = async () => {
        const outcome = await onCreateShare(visibility, selectedFriendIds);
        if (outcome === "AUTH_REQUIRED") {
            setAuthRequired(true);
            return;
        }
        if (outcome) setResult(outcome);
    };

    return (
        <Popup isOpen={isOpen} onClose={onClose} maxWidth="md">
            {/* not signed in, sharing requires an account */}
            {authRequired ? (
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
            ) : result ? (
                // link has been generated, show it with copy/social actions
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
                            value={result.url}
                            className="w-full bg-transparent text-xs text-interactive outline-none font-mono"
                        />
                        <button
                            onClick={handleCopy}
                            className={`px-3 py-1 text-xs font-bold font-mono transition uppercase ${
                                copied
                                    ? "bg-success text-bg"
                                    : "bg-brand hover:bg-brand-hover text-bg"
                            }`}
                        >
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>

                    <SocialShareLinks shareUrl={result.url} />
                </div>
            ) : (
                // no share yet, show the visibility/friend picker form
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-fg">
                            Share Code Snippet
                        </h3>
                        <p className="text-xs text-fg-muted">
                            Choose who can open the link before it's generated.
                        </p>
                    </div>

                    <VisibilitySelector
                        value={visibility}
                        onChange={setVisibility}
                    />

                    {visibility === "friends" && (
                        <FriendMultiSelect
                            friends={friends}
                            selected={selectedFriendIds}
                            onToggle={toggleFriend}
                        />
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={!canGenerate || isCreating}
                        className="w-full py-2.5 bg-brand hover:bg-brand-hover text-bg font-bold uppercase text-xs transition font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? "Generating..." : "Generate Link"}
                    </button>
                </div>
            )}
        </Popup>
    );
}
