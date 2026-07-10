"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase-client";
import { ShareHistoryEntry } from "@/hooks/useShareCode";

// Controls who can view this user's profile page
export type ProfileVisibility = 'public' | 'friends' | 'private';

// A single shared code snapshot from the shares table
export interface UserShareItem {
    id: string;
    language: string;
    code: string;
    created_at: string;
    history: ShareHistoryEntry[] | null;
}

// Groups shares sent to the current user by a single sender
export interface SharedWithMeGroup {
    username: string;
    shares: UserShareItem[];
}

export interface SharedWithOtherGroup {
    username: string;
    shares: UserShareItem[];
}

interface UseProfileDataReturn {
    loading: boolean;
    username: string;
    visibility: ProfileVisibility;
    myShares: UserShareItem[];
    sharedWithMe: Record<string, SharedWithMeGroup>;
    sharedWithOthers: Record<string, SharedWithOtherGroup>;
    handleLogout: () => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
    handleVisibilityChange: (v: ProfileVisibility) => Promise<void>;
}

export function useProfileData(): UseProfileDataReturn {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [visibility, setVisibility] = useState<ProfileVisibility>('public');
    const [myShares, setMyShares] = useState<UserShareItem[]>([]);
    const [userId, setUserId] = useState("");

    // Shares sent to the current user, keyed by sender id
    const [sharedWithMe, setSharedWithMe] = useState<Record<string, SharedWithMeGroup>>({});

    // Shares the current user has sent to others, keyed by recipient id
    const [sharedWithOthers, setSharedWithOthers] = useState<Record<string, SharedWithOtherGroup>>({});

    useEffect(() => {
        // Fetch all shares sent to this user and group them by sender
        const fetchSharedWithMeGrouped = async (uid: string) => {
            const { data, error } = await supabase
                .from('share_recipients')
                .select(`
                    sender:profiles!share_recipients_sender_id_fkey (id, username),
                    share:shares!share_recipients_share_id_fkey (id, code, language, created_at, user_id)
                `)
                .eq('recipient_id', uid);

            if (error) { console.error('Error fetching shared with me:', error.message); return {}; }

            // Group results by sender so each sender gets their own section on the profile page
            const grouped: Record<string, SharedWithMeGroup> = {};
            (data ?? []).forEach((d: any) => {
                const senderId = d.sender.id;
                if (!grouped[senderId]) {
                    grouped[senderId] = { username: d.sender.username, shares: [] };
                }
                grouped[senderId].shares.push(d.share as UserShareItem);
            });
            return grouped;
        };

        // Fetch all shares sent by this user and group them by recipient
        // Each recipient gets their own section on the profile page
        const fetchSharedWithOthersGrouped = async (uid: string) => {
            const { data, error } = await supabase
                .from('share_recipients')
                .select(`
                    recipient:profiles!share_recipients_recipient_id_fkey (id, username),
                    share:shares!share_recipients_share_id_fkey (id, code, language, created_at, user_id)
                `)
                .eq('sender_id', uid);

            if (error) { console.error('Error fetching shared with others:', error.message); return {}; }

            // Group by recipient
            const grouped: Record<string, SharedWithOtherGroup> = {};
            (data ?? []).forEach((d: any) => {
                const recipientId = d.recipient.id;
                if (!grouped[recipientId]) {
                    grouped[recipientId] = { username: d.recipient.username, shares: [] };
                }
                grouped[recipientId].shares.push(d.share as UserShareItem);
            });
            return grouped;
        };

        const fetchUserDataAndShares = async () => {
            // Check for an active session before fetching any profile data
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }

            setUserId(user.id);

            try {
                // Fetch username and visibility setting from the profiles table
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("username, visibility")
                    .eq("id", user.id)
                    .maybeSingle();

                if (!profileError && profileData) {
                    setUsername(profileData.username ?? user.email?.split("@")[0] ?? "Developer");
                    setVisibility((profileData.visibility as ProfileVisibility) ?? 'public');
                } else {
                    // Fall back to email prefix if profile row is missing
                    setUsername(user.email?.split("@")[0] || "Developer");
                }

                // Fetch all shares created by this user, ordered newest first
                const { data, error } = await supabase
                    .from("shares")
                    .select("id, language, code, created_at, history")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                if (data) setMyShares(data as UserShareItem[]);

                // Fetch and group shares sent to this user by friends
                const grouped = await fetchSharedWithMeGrouped(user.id);
                setSharedWithMe(grouped);
            } catch (err) {
                console.error("Error pulling history profiles:", err);
            } finally {
                setLoading(false);
            }

            const grouped = await fetchSharedWithMeGrouped(user.id);
            setSharedWithMe(grouped);

            const sentGrouped = await fetchSharedWithOthersGrouped(user.id);
            setSharedWithOthers(sentGrouped);
        };

        fetchUserDataAndShares();
    }, [router]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) { router.refresh(); router.push("/login"); }
    };

    // Optimistically remove deleted share from local state without refetching
    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("shares").delete().eq("id", id);
        if (!error) setMyShares((prev) => prev.filter((s) => s.id !== id));
    };

    // Update the profile visibility setting and reflect it in local state
    const handleVisibilityChange = async (v: ProfileVisibility) => {
        const { error } = await supabase
            .from("profiles")
            .update({ visibility: v })
            .eq("id", userId);
        if (!error) setVisibility(v);
        else console.error("Error updating visibility:", error.message);
    };

    return { 
        loading, 
        username, 
        visibility, 
        myShares, 
        sharedWithMe, 
        sharedWithOthers,
        handleLogout, 
        handleDelete, 
        handleVisibilityChange 
    };
}