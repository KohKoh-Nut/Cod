"use client";

import { FriendOption } from "@/hooks/friends/useFriendOptions";

interface FriendMultiSelectProps {
    friends: FriendOption[];
    selected: string[];
    onToggle: (id: string) => void;
}

// checklist of a user's friends, used when sharing code privately
export default function FriendMultiSelect({
    friends,
    selected,
    onToggle,
}: FriendMultiSelectProps) {
    // nothing to pick from yet
    if (friends.length === 0) {
        return (
            <p className="text-xs text-fg-muted font-mono">
                You have no friends yet. Add friends to share with them.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            <span className="text-[11px] text-fg-muted font-bold uppercase tracking-wider">
                Select at least one friend:
            </span>
            <div className="border border-border max-h-40 overflow-y-auto">
                {friends.map((f) => (
                    <label
                        key={f.id}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-mono cursor-pointer hover:bg-bg-element border-b border-border last:border-b-0"
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(f.id)}
                            onChange={() => onToggle(f.id)}
                            className="accent-brand"
                        />
                        {f.username}
                    </label>
                ))}
            </div>
        </div>
    );
}
