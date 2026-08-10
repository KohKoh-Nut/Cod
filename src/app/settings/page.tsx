"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase-client";
import {
    useProfileData,
    ProfileVisibility,
} from "@/hooks/profile/useProfileData";
import ThemeSwiper from "@/components/theme/ThemeSwiper";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// order shown in the visibility picker
const VISIBILITY_OPTIONS: ProfileVisibility[] = [
    "public",
    "friends",
    "private",
];

// account settings: theme, username, profile visibility, and logout
export default function SettingsPage() {
    const router = useRouter();
    const {
        username,
        visibility,
        usernameError,
        usernameSaving,
        handleVisibilityChange,
        handleUsernameChange,
    } = useProfileData();

    // local draft of the username field, kept separate from the saved
    // value so the input doesn't jump around while the profile is loading
    const [usernameDraft, setUsernameDraft] = useState(username);
    const [usernameSuccess, setUsernameSuccess] = useState(false);

    // once the real username has loaded, seed the draft with it
    useEffect(() => {
        setUsernameDraft(username);
    }, [username]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            router.refresh();
            router.push("/login");
        }
    };

    // saves the new username; shows a confirmation only when it actually changed
    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // pressing enter in the field still fires a submit even while the
        // button is disabled, so the in-flight save has to be guarded here too
        if (usernameSaving) return;
        setUsernameSuccess(false);
        const ok = await handleUsernameChange(usernameDraft);
        if (ok) setUsernameSuccess(true);
    };

    return (
        <div className="p-6 flex flex-col gap-8 max-w-2xl mx-auto w-full">
            <Text type="header" level={2} label="Settings" />

            <div className="flex flex-col gap-3 border-b border-border pb-6">
                <Text type="header" level={3} label="Appearance" />
                <Text
                    type="description"
                    color="muted"
                    label="Choose how Cod looks on this device."
                />
                <ThemeSwiper />
            </div>

            <div className="flex flex-col gap-3 border-b border-border pb-6">
                <Text type="header" level={3} label="Username" />
                <Text
                    type="description"
                    color="muted"
                    label="This is the name friends use to find and add you."
                />
                <form
                    onSubmit={handleUsernameSubmit}
                    className="flex items-end gap-2"
                >
                    <div className="flex-1">
                        <Input
                            label="Username"
                            type="text"
                            value={usernameDraft}
                            disabled={usernameSaving}
                            onChange={(e) => {
                                setUsernameDraft(e.target.value);
                                setUsernameSuccess(false);
                            }}
                            error={usernameError || undefined}
                        />
                    </div>
                    <Button
                        label={usernameSaving ? "Saving..." : "Save"}
                        type="submit"
                        size="sm"
                        disabled={usernameSaving || usernameDraft === username}
                    />
                </form>
                {usernameSuccess && (
                    <Text
                        type="description"
                        color="muted"
                        label="Username updated."
                    />
                )}
            </div>

            <div className="flex flex-col gap-3 border-b border-border pb-6">
                <Text type="header" level={3} label="Profile Visibility" />
                <Text
                    type="description"
                    color="muted"
                    label="Control who can view your profile and shared code snippets."
                />
                <div className="flex gap-2">
                    {VISIBILITY_OPTIONS.map((v) => (
                        <button
                            key={v}
                            onClick={() => handleVisibilityChange(v)}
                            className={`px-3 py-1.5 text-xs font-mono border transition-colors rounded-none cursor-pointer
                                ${
                                    visibility === v
                                        ? "border-brand text-brand bg-bg-element"
                                        : "border-border text-comment hover:text-fg hover:border-fg-muted"
                                }`}
                        >
                            {v === "public"
                                ? "🌐 Public"
                                : v === "friends"
                                  ? "👥 Friends"
                                  : "🔒 Private"}
                        </button>
                    ))}
                </div>
                <Text
                    type="description"
                    color="muted"
                    label={
                        visibility === "public"
                            ? "Anyone can view your profile."
                            : visibility === "friends"
                              ? "Only your friends can view your profile."
                              : "Only you can view your profile."
                    }
                />
            </div>

            <div className="flex flex-col gap-3">
                <Text type="header" level={3} label="Account" />
                <Text
                    type="description"
                    color="muted"
                    label="Sign out of your account on this device."
                />
                <Button
                    label="Log Out"
                    size="sm"
                    onClick={handleLogout}
                    className="w-fit border-error text-error hover:bg-error hover:text-bg"
                />
            </div>
        </div>
    );
}
