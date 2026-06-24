"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase-client";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
            } else {
                setLoading(false);
            }
        };

        checkUser();
    }, [router]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            router.refresh();
            router.push("/login");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-4">
            <h1 className="text-3xl font-bold mb-4">Welcome to your Profile</h1>
            <p className="mb-6 text-slate-400">
                This page is completely secured.
            </p>

            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium transition rounded"
            >
                Log Out
            </button>
        </div>
    );
}
