"use client";
import { useState, useRef } from "react";
import Button from "@/components/Button";

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
            <Button
                label="Code"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                link="/"
                className="fixed bottom-6 left-6 text-base pt-1 z-50"
            />

            {isVisible && (
                <div className="flex flex-col justify-between absolute bottom-6 left-30 z-50">
                    <Button
                        label="Profile"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        link="/profile"
                    />

                    <Button
                        label="Settings"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        link="/settings"
                    />

                    <Button
                        label="Sandbox"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        link="/sandbox"
                    />

                    <Button
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
