"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase-client";
import { useProfile, ProfileVisibility } from "@/hooks/profile/useProfile";
import ShareCard from "@/components/profile/ShareCard";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";

// order shown in the visibility picker
const VISIBILITY_OPTIONS: ProfileVisibility[] = [
    "public",
    "friends",
    "private",
];

// public-facing profile page, reached with ?username=... in the url
export default function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const username = searchParams.get("username") ?? "";
    const [currentUserId, setCurrentUserId] = useState("");

    // viewing a profile still requires being logged in
    useEffect(() => {
        const fetchSession = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
                router.push("/login");
                return;
            }
            setCurrentUserId(sessionData.session.user.id);
        };
        fetchSession();
    }, [router]);

    const {
        profile,
        shares,
        sharedWithRecipient,
        sharedWithMe,
        relation,
        canView,
        isLoading,
        error,
        updateVisibility,
    } = useProfile(username, currentUserId);

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("shares").delete().eq("id", id);
        if (error) console.error("Error deleting share:", error.message);
    };

    // no username in the url at all
    if (!username) {
        return (
            <main className="c-page-layout flex items-center justify-center">
                <Text
                    label="No user specified."
                    type="description"
                    color="muted"
                />
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="c-page-layout flex items-center justify-center">
                <Text
                    label="Loading profile..."
                    type="description"
                    color="muted"
                />
            </main>
        );
    }

    if (error) {
        return (
            <main className="c-page-layout flex items-center justify-center">
                <Text label={error} type="description" color="muted" />
            </main>
        );
    }

    // profile exists but the viewer isn't allowed to see it
    if (!canView) {
        return (
            <main className="c-page-layout flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Text
                        label={
                            profile?.visibility === "private"
                                ? "This profile is private."
                                : "This profile is only visible to friends."
                        }
                        type="description"
                        color="muted"
                    />
                    <Button
                        label="Go Back"
                        size="sm"
                        onClick={() => router.back()}
                    />
                </div>
            </main>
        );
    }

    return (
        <main className="c-page-layout overflow-auto">
            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div className="flex items-start justify-between border border-border bg-bg-surface p-6">
                    <div className="flex flex-col gap-1">
                        <Text
                            type="header"
                            level={2}
                            label={profile?.username ?? ""}
                        />

                        <span className="text-xs font-mono text-comment mt-1">
                            {relation === "owner"
                                ? "You"
                                : relation === "friend"
                                  ? "Friend"
                                  : "Public"}
                        </span>
                    </div>

                    {/* only the profile owner can change its visibility */}
                    {relation === "owner" && profile && (
                        <div className="flex flex-col gap-2 items-end">
                            <Text
                                label="Profile visibility"
                                type="description"
                                color="muted"
                            />
                            <div className="flex gap-1">
                                {VISIBILITY_OPTIONS.map((v) => (
                                    <Button
                                        key={v}
                                        label={
                                            v.charAt(0).toUpperCase() +
                                            v.slice(1)
                                        }
                                        size="sm"
                                        onClick={() => updateVisibility(v)}
                                        className={
                                            profile.visibility === v
                                                ? "border-brand text-brand"
                                                : ""
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <Text
                        type="header"
                        level={3}
                        label={
                            relation === "owner"
                                ? `Your Shares (${shares.length})`
                                : `${profile?.username}'s Shares (${shares.length})`
                        }
                    />

                    {/* shares this profile owner has made public/available */}
                    {shares.length === 0 ? (
                        <Text
                            label={
                                relation === "owner"
                                    ? "You have no shared snippets yet."
                                    : "No shared snippets yet."
                            }
                            type="description"
                            color="muted"
                        />
                    ) : (
                        shares.map((share) => (
                            <ShareCard
                                key={share.id}
                                share={share}
                                isOwner={relation === "owner"}
                                onDelete={
                                    relation === "owner"
                                        ? handleDelete
                                        : undefined
                                }
                            />
                        ))
                    )}

                    {/* things the current viewer has personally shared with this profile's owner */}
                    {sharedWithRecipient.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <Text
                                type="header"
                                level={3}
                                label={`Code Shared with ${profile?.username} (${sharedWithRecipient.length})`}
                            />
                            {sharedWithRecipient.map((share) => (
                                <ShareCard
                                    key={share.id}
                                    share={share}
                                    isOwner={true}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}

                    {/* things this profile's owner has personally shared with the current viewer */}
                    {sharedWithMe.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <Text
                                type="header"
                                level={3}
                                label={`Code Shared with Me (${sharedWithMe.length})`}
                            />
                            {sharedWithMe.map((share) => (
                                <ShareCard
                                    key={share.id}
                                    share={share}
                                    isOwner={false}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
