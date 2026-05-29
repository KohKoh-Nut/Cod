import { NavButtonProps } from "@/components/Interface";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

/**
 * A reusable, flexible navigation button component that serves as the foundation for design system variations.
 */
export default function NavButton({
    label,
    onClick = () => {},
    onMouseEnter = () => {},
    onMouseLeave = () => {},
    className = "",
    link,
}: NavButtonProps) {
    // Core layout and transition styles
    const base = [
        "text-sm pt-1",
        "shrink-0 px-3 py-1",
        "flex items-center justify-center",
        "c-transition",
    ].join(" ");

    // Merge base styles with custom class overrides safely using tailwind-merge
    const combined = twMerge(base, className);

    return (
        <Link href={link} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} type="button" className={combined}>
            {label}
        </Link>
    );
}
