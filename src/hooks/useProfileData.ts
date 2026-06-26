"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase-client";
import { ShareHistoryEntry } from "@/hooks/useShareCode";

export interface UserShareItem {
    id: string;
    language: string;
    code: string;
    created_at: string;
    history: ShareHistoryEntry[] | null;
}

interface UseProfileDataReturn {
    loading: boolean;
    username: string;
    myShares: UserShareItem[];
    handleLogout: () => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
}

export function useProfileData(): UseProfileDataReturn {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [myShares, setMyShares] = useState<UserShareItem[]>([]);

    useEffect(() => {
        const fetchUserDataAndShares = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            try {
                const { data: profileData, error: profileError } =
                    await supabase
                        .from("profiles")
                        .select("username")
                        .eq("id", user.id)
                        .maybeSingle();

                if (!profileError && profileData?.username) {
                    setUsername(profileData.username);
                } else {
                    setUsername(user.email?.split("@")[0] || "Developer");
                }

                const { data, error } = await supabase
                    .from("shares")
                    .select("id, language, code, created_at, history")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                if (data) setMyShares(data as UserShareItem[]);
            } catch (err) {
                console.error("Error pulling history profiles:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDataAndShares();
    }, [router]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            router.refresh();
            router.push("/login");
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("shares").delete().eq("id", id);
        if (!error) {
            setMyShares((prev) => prev.filter((s) => s.id !== id));
        }
    };

    return { loading, username, myShares, handleLogout, handleDelete };
}
