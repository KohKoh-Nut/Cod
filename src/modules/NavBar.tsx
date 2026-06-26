"use client";

import { useState, useRef, useEffect } from "react";

import Button from "@/components/Button";

const NAV_LINKS = [
    { label: "Code", link: "/" },
    { label: "Profile", link: "/profile" },
    { label: "Settings", link: "/settings" },
];

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const navRef = useRef<HTMLElement | null>(null);

    const toggleMenu = () => setIsOpen((prev) => !prev);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event: MouseEvent) => {
            if (
                navRef.current &&
                !navRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () =>
            document.removeEventListener("mousedown", handleOutsideClick);
    }, [isOpen]);

    const handleCodeClick = () => {
        toggleMenu();
    };

    return (
        <main ref={navRef}>
            <div className="fixed bottom-6 left-6 z-50">
                {/* Main Trigger Button */}
                <Button
                    label="Code"
                    onClick={handleCodeClick}
                    className="relative text-base pt-1"
                />

                {/* Sub-menu Links Popover, anchored to the button above it */}
                {isOpen && (
                    <div className="flex flex-col justify-between absolute bottom-full left-0 mb-2 gap-1">
                        {NAV_LINKS.map((item) => (
                            <Button
                                key={item.label}
                                label={item.label}
                                link={item.link}
                                onClick={() => setIsOpen(false)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
