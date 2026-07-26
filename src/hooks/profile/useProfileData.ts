"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase-client";
import { Share } from "@/types/share";

export type ProfileVisibility = "public" | "friends" | "private";

export type UserShareItem = Share;

export interface SharedWithMeGroup {
    username: string;
    shares: UserShareItem[];
}

interface UseProfileDataReturn {
    loading: boolean;
    username: string;
    visibility: ProfileVisibility;
    myShares: UserShareItem[];
    sharedWithMe: Record<string, SharedWithMeGroup>;
    usernameError: string;
    usernameSaving: boolean;
    handleLogout: () => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
    handleVisibilityChange: (v: ProfileVisibility) => Promise<void>;
    handleUsernameChange: (newUsername: string) => Promise<boolean>;
}

const SHARE_FIELDS = "id, code, language, created_at, user_id, visibility";

// shares sent to a user, grouped by who sent them
async function fetchSharedWithMe(
    uid: string,
): Promise<Record<string, SharedWithMeGroup>> {
    const { data, error } = await supabase
        .from("share_recipients")
        .select(
            `sender:profiles!share_recipients_sender_id_fkey (id, username), share:shares!share_recipients_share_id_fkey (${SHARE_FIELDS})`,
        )
        .eq("recipient_id", uid);

    if (error) {
        console.error("Error fetching shared with me:", error.message);
        return {};
    }

    // group the flat rows into one entry per sender
    const grouped: Record<string, SharedWithMeGroup> = {};
    (data ?? []).forEach((row: any) => {
        const senderId = row.sender.id;
        grouped[senderId] ??= { username: row.sender.username, shares: [] };
        grouped[senderId].shares.push(row.share as UserShareItem);
    });
    return grouped;
}

// enforces the app's username rules: short, plain, and safe to put in a url
function validateUsername(value: string): string | null {
    if (value.length < 3) return "Username must be at least 3 characters long.";
    if (value.length > 20)
        return "Username must be at most 20 characters long.";
    if (!/^[a-zA-Z0-9_]+$/.test(value))
        return "Username can only contain letters, numbers, and underscores.";
    return null;
}

// backs the "my profile" settings/dashboard page: current user's info,
// their own shares, what's been shared with them, and the actions
// available from that page (logout, delete a share, change visibility,
// change username)
export function useProfileData(): UseProfileDataReturn {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [visibility, setVisibility] = useState<ProfileVisibility>("public");
    const [myShares, setMyShares] = useState<UserShareItem[]>([]);
    const [userId, setUserId] = useState("");
    const [sharedWithMe, setSharedWithMe] = useState<
        Record<string, SharedWithMeGroup>
    >({});
    const [usernameError, setUsernameError] = useState("");
    const [usernameSaving, setUsernameSaving] = useState(false);

    // on mount, load the logged-in user's profile, shares, and inbox;
    // bounce to login if there's no session
    useEffect(() => {
        const load = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUserId(user.id);

            try {
                const { data: profileData, error: profileError } =
                    await supabase
                        .from("profiles")
                        .select("username, visibility")
                        .eq("id", user.id)
                        .maybeSingle();

                if (!profileError && profileData) {
                    setUsername(
                        profileData.username ??
                            user.email?.split("@")[0] ??
                            "Developer",
                    );
                    setVisibility(
                        (profileData.visibility as ProfileVisibility) ??
                            "public",
                    );
                } else {
                    // no profile row yet, fall back to something readable
                    setUsername(user.email?.split("@")[0] || "Developer");
                }

                const { data, error } = await supabase
                    .from("shares")
                    .select(`${SHARE_FIELDS}, history`)
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });
                if (error) throw error;
                if (data) setMyShares(data as UserShareItem[]);

                setSharedWithMe(await fetchSharedWithMe(user.id));
            } catch (err) {
                console.error("Error loading profile data:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [router]);

    // signs out and sends the user back to the login page
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            router.refresh();
            router.push("/login");
        }
    };

    // deletes one of your own shares and drops it from local state
    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("shares").delete().eq("id", id);
        if (!error) setMyShares((prev) => prev.filter((s) => s.id !== id));
    };

    // updates your profile's public/friends/private visibility setting
    const handleVisibilityChange = async (v: ProfileVisibility) => {
        const { error } = await supabase
            .from("profiles")
            .update({ visibility: v })
            .eq("id", userId);
        if (!error) setVisibility(v);
        else console.error("Error updating visibility:", error.message);
    };

    // validates the new username, checks nobody else already has it, then
    // saves it; returns whether it succeeded so the settings page can show
    // a confirmation without tracking its own copy of the error
    const handleUsernameChange = async (
        newUsername: string,
    ): Promise<boolean> => {
        setUsernameError("");

        const trimmed = newUsername.trim();
        const validationError = validateUsername(trimmed);
        if (validationError) {
            setUsernameError(validationError);
            return false;
        }

        // nothing to do if it didn't actually change
        if (trimmed === username) return true;

        setUsernameSaving(true);

        const { data: existing, error: lookupError } = await supabase
            .from("profiles")
            .select("id")
            .ilike("username", trimmed)
            .neq("id", userId)
            .maybeSingle();

        if (lookupError) {
            console.error(
                "Error checking username availability:",
                lookupError.message,
            );
            setUsernameError("Something went wrong. Please try again.");
            setUsernameSaving(false);
            return false;
        }

        if (existing) {
            setUsernameError("That username is already taken.");
            setUsernameSaving(false);
            return false;
        }

        const { error } = await supabase
            .from("profiles")
            .update({ username: trimmed })
            .eq("id", userId);

        setUsernameSaving(false);

        if (error) {
            console.error("Error updating username:", error.message);
            setUsernameError("Something went wrong. Please try again.");
            return false;
        }

        setUsername(trimmed);
        return true;
    };

    return {
        loading,
        username,
        visibility,
        myShares,
        sharedWithMe,
        usernameError,
        usernameSaving,
        handleLogout,
        handleDelete,
        handleVisibilityChange,
        handleUsernameChange,
    };
}
