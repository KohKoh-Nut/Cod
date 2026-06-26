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
            {/* Main Trigger Button */}
            <Button
                label="Menu"
                onClick={handleCodeClick}
                className="fixed bottom-6 left-6 text-base pt-1 z-50"
            />

            {/* Sub-menu Links Popover */}
            {isOpen && (
                <div className="flex flex-col justify-between absolute bottom-6 left-30 z-50">
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
        </main>
    );
}
