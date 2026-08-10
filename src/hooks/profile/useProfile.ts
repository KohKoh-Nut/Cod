import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase-client";
import { Share } from "@/types/share";

export type ProfileVisibility = "public" | "friends" | "private";

export interface Profile {
    id: string;
    username: string;
    visibility: ProfileVisibility;
}

export type ViewerRelation = "owner" | "friend" | "stranger";

// fields to select whenever we pull a full share row
const SHARE_FIELDS =
    "id, code, language, created_at, user_id, visibility, history";

// shares one user sent directly to another, via the share_recipients table
async function fetchSharesBetween(
    senderId: string,
    recipientId: string,
): Promise<Share[]> {
    const { data, error } = await supabase
        .from("share_recipients")
        .select(`share:shares!share_recipients_share_id_fkey (${SHARE_FIELDS})`)
        .eq("sender_id", senderId)
        .eq("recipient_id", recipientId);

    if (error) {
        console.error("Error fetching shares between users:", error.message);
        return [];
    }
    return (data ?? []).map((row: any) => row.share as Share);
}

// loads someone else's (or your own) profile page: their info, their
// public shares, and anything shared privately between you two,
// gated by friendship and their visibility setting
export function useProfile(username: string, currentUserId: string) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [shares, setShares] = useState<Share[]>([]);
    const [sharedWithRecipient, setSharedWithRecipient] = useState<Share[]>([]);
    const [sharedWithMe, setSharedWithMe] = useState<Share[]>([]);
    const [relation, setRelation] = useState<ViewerRelation>("stranger");
    const [canView, setCanView] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // reload whenever the viewed username or the viewer changes
    useEffect(() => {
        if (!username || !currentUserId) return;
        fetchProfile();
    }, [username, currentUserId]);

    // loads a user's own public share list
    const fetchShares = async (userId: string) => {
        const { data, error } = await supabase
            .from("shares")
            .select(SHARE_FIELDS)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        if (error) {
            console.error("Error fetching shares:", error.message);
            return;
        }
        setShares((data as Share[]) ?? []);
    };

    // main load: fetches the profile, works out the viewer's relation to
    // it, and decides what they're allowed to see
    const fetchProfile = async () => {
        setIsLoading(true);
        setError("");

        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, visibility")
            .eq("username", username)
            .single();

        if (profileError || !profileData) {
            setError("User not found.");
            setIsLoading(false);
            return;
        }

        const profile = profileData as Profile;
        setProfile(profile);

        // viewing your own profile always grants full access
        if (profile.id === currentUserId) {
            setRelation("owner");
            setCanView(true);
            await fetchShares(profile.id);
            setIsLoading(false);
            return;
        }

        // otherwise check whether the viewer and the profile owner are friends
        const { data: friendData } = await supabase
            .from("friends")
            .select("id")
            .eq("user_id", currentUserId)
            .eq("friend_id", profile.id)
            .maybeSingle();

        const isFriend = !!friendData;
        setRelation(isFriend ? "friend" : "stranger");

        // access depends on the profile owner's visibility setting
        const allowed =
            profile.visibility === "public" ||
            (profile.visibility === "friends" && isFriend);
        setCanView(allowed);

        if (allowed) {
            await fetchShares(profile.id);
            // shares exchanged directly between the viewer and the owner,
            // in both directions
            setSharedWithRecipient(
                await fetchSharesBetween(currentUserId, profile.id),
            );
            setSharedWithMe(
                await fetchSharesBetween(profile.id, currentUserId),
            );
        }

        setIsLoading(false);
    };

    // updates the current user's own visibility setting
    const updateVisibility = async (visibility: ProfileVisibility) => {
        const { error } = await supabase
            .from("profiles")
            .update({ visibility })
            .eq("id", currentUserId);
        if (error) {
            console.error("Error updating visibility:", error.message);
            return false;
        }
        setProfile((prev) => (prev ? { ...prev, visibility } : prev));
        return true;
    };

    return {
        profile,
        shares,
        sharedWithRecipient,
        sharedWithMe,
        relation,
        canView,
        isLoading,
        error,
        updateVisibility,
    };
}
