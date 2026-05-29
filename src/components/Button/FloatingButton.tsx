import { ButtonProps } from "@/components/Interface";
import Button from "@/components/Button/Button";

/**
 * Floating Action Button (FAB) variant positioned fixed on the screen with scale animations.
 */
export default function FloatingButton({
    label,
    onClick = () => {},
    onMouseEnter = () => {},
    onMouseLeave = () => {},
    className: style,
}: ButtonProps) {
    // Layout positioning, dimensions, micro-interactions, and theme fallbacks
    const base = [
        "fixed bottom-6 right-6 z-50",
        "text-4xl pt-2",
        "aspect-square",
        "hover:scale-110 active:scale-95",
        style ? style : "c-bg-normal c-border-normal c-label-muted",
    ].join(" ");

    return <Button label={label} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={base} />;
}
