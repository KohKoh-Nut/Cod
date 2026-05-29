import { NavButtonProps, FloatingButtonExtra } from "@/components/Interface";
import NavButton from "@/components/Button/NavButton";

/**
 * Floating Navigation Button (FNB) variant positioned fixed on the screen with scale animations.
 */
export default function FloatingNavButton({
    label,
    onClick = () => {},
    onMouseEnter = () => {},
    onMouseLeave = () => {},
    className: style,
    link,
    position,
    text,
}: NavButtonProps & FloatingButtonExtra) {
    // Layout positioning, dimensions, micro-interactions, and theme fallbacks
    const base = [
        "fixed z-50",
        "aspect-square",
        "hover:scale-110 active:scale-95",
        text ? text : "text-4xl pt-2",
        position
            ? position
            : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        style ? style : "c-bg-normal c-border-normal c-label-muted",
    ].join(" ");

    return (
        <NavButton
            label={label}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={base}
            link={link}
        />
    );
}
