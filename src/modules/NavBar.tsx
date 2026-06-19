"use client";
import { useState, useRef } from "react";
import Button from "@/components/Button";

const NAV_LINKS = [
    { label: "Profile", link: "/profile" },
    { label: "Settings", link: "/settings" },
];

export default function NavBar() {
    const [isVisible, setIsVisible] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleMouseEnter() {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setIsVisible(true);
    }

    // delay hiding so the cursor can move between the trigger and the popover
    function handleMouseLeave() {
        hideTimer.current = setTimeout(() => setIsVisible(false), 300);
    }

    return (
        <main>
            <Button
                label="Code"
                link="/"
                className="fixed bottom-6 left-6 text-base pt-1 z-50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />

            {isVisible && (
                <div className="flex flex-col justify-between absolute bottom-6 left-30 z-50">
                    {NAV_LINKS.map((item) => (
                        <Button
                            key={item.label}
                            label={item.label}
                            link={item.link}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}
