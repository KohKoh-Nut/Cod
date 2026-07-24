import { useState, useCallback } from "react";
import { supabase } from "@/utils/supabase-client";

export interface FriendOption {
    id: string;
    username: string;
}

// simple id/username list of a user's friends, used for pickers like
// the friend multiselect when sharing code
export function useFriendOptions() {
    const [friends, setFriends] = useState<FriendOption[]>([]);
    const [loading, setLoading] = useState(false);

    const loadFriends = useCallback(async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("friends")
            .select(`friend:profiles!friends_friend_id_fkey (id, username)`)
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching friends:", error.message);
            setFriends([]);
        } else {
            setFriends(
                (data ?? []).map((d: any) => ({
                    id: d.friend.id,
                    username: d.friend.username,
                })),
            );
        }
        setLoading(false);
    }, []);

    return { friends, loading, loadFriends };
}
