import { NavButtonProps } from "@/components/Interface";
import NavButton from "@/components/Button/NavButton";

/**
 * Standard navigation button variant with default themes that can be overridden via className.
 */
export default function NormalButton({
    label,
    onClick = () => {},
    onMouseEnter = () => {},
    onMouseLeave = () => {},
    className: style,
    link,
}: NavButtonProps) {
    // Fallback to default styling if no custom className is provided
    const base = [
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