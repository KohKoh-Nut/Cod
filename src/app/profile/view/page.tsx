import { Suspense } from "react";
import ProfileContent from "@/components/profile/ProfileContent";

export default function ProfileViewPage() {
    return (
        <Suspense
            fallback={
                <main className="c-page-layout flex items-center justify-center">
                    <span className="text-fg-muted text-sm font-mono">
                        Loading profile...
                    </span>
                </main>
            }
        >
            <ProfileContent />
        </Suspense>
    );
}
