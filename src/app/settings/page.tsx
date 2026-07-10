'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase-client';
import { useProfileData, ProfileVisibility } from '@/hooks/useProfileData';
import ThemeSwiper from '@/components/ThemeSwiper';
import Text from '@/components/Text';
import Button from '@/components/Button';

const VISIBILITY_OPTIONS: ProfileVisibility[] = ['public', 'friends', 'private'];

export default function SettingsPage() {
    const router = useRouter();
    const { visibility, handleVisibilityChange } = useProfileData();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            router.refresh();
            router.push('/login');
        }
    };

    return (
        <div className="p-6 flex flex-col gap-8 max-w-2xl mx-auto w-full">
            <Text type="header" level={2} label="Settings" />

            {/* Appearance */}
            <div className="flex flex-col gap-3 border-b border-border pb-6">
                <Text type="header" level={3} label="Appearance" />
                <ThemeSwiper />
            </div>

            {/* Profile visibility */}
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
                                ${visibility === v
                                    ? 'border-brand text-brand bg-bg-element'
                                    : 'border-border text-comment hover:text-fg hover:border-fg-muted'
                                }`}
                        >
                            {v === 'public' ? '🌐 Public' : v === 'friends' ? '👥 Friends' : '🔒 Private'}
                        </button>
                    ))}
                </div>
                <Text
                    type="description"
                    color="muted"
                    label={
                        visibility === 'public'
                            ? 'Anyone can view your profile.'
                            : visibility === 'friends'
                            ? 'Only your friends can view your profile.'
                            : 'Only you can view your profile.'
                    }
                />
            </div>

            {/* Account */}
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