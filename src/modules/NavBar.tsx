"use client";
import { useState, useRef } from "react";
import FloatingNavButton from "@/components/Button/FloatingNavButton";
import NormalNavButton from "@/components/Button/NormalNavButton";

/**
 * Navigation bar component featuring a hover-triggered popover menu with debounced visibility tracking.
 */
export default function NavBar() {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        // Debounce hiding the menu to allow smooth cursor transition between elements
        timerRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 300);
    };

    return (
        <main>
            <FloatingNavButton
                label="Code"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                link="/"
                position="bottom-6 left-6"
                text="text-base pt-1"
            />

            {isVisible && (
                <div className="flex flex-col justify-between absolute bottom-6 left-30 z-50">
                    <NormalNavButton
                        label="Profile"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        link="/profile"
                    />

                    <NormalNavButton
                        label="Settings"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        link="/settings"
                    />

                    <NormalNavButton
                        label="Sandbox"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        link="/sandbox"
                    />

                    <NormalNavButton
                        label="Leaderboard"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        link="/leaderboard"
                    />
                </div>
            )}
        </main>
    );
}
