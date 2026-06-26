"use client";

import { useState, useRef } from "react";
import Button from "@/components/Button";

const NAV_LINKS = [
    { label: "Profile", link: "/profile" },
    { label: "Settings", link: "/settings" },
];

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cancel active closure actions and show the sub-menu immediately
    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    // Keep the sub-menu visible briefly to ease hover transition gaps
    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
    };

    const handleCodeClick = () => {
        window.location.hash = "";
        window.location.href = window.location.origin + "/Cod/";
    };

    return (
        <main>
            {/* Main Trigger Button */}
            <Button
                label="Code"
                onClick={handleCodeClick}
                className="fixed bottom-6 left-6 text-base pt-1 z-50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />

            {/* Sub-menu Links Popover */}
            {isOpen && (
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
