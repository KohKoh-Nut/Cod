import { ButtonProps } from "@/components/Interface";
import { twMerge } from "tailwind-merge";

/**
 * A reusable, flexible button component that serves as the foundation for design system variations.
 */
export default function Button({
    label,
    onClick = () => {},
    className = "",
}: ButtonProps) {
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
        <button onClick={onClick} type="button" className={combined}>
            {label}
        </button>
    );
}
