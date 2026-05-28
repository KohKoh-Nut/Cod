import { ButtonProps } from "@/components/Interface";
import Button from "@/components/Button/Button";

/**
 * Standard button variant with default themes that can be overridden via className.
 */
export default function NormalButton({
    label,
    onClick = () => {},
    className: style,
}: ButtonProps) {
    // Fallback to default styling if no custom className is provided
    const base = [
        style ? style : "c-bg-normal c-border-normal c-label-muted",
    ].join(" ");

    return <Button label={label} onClick={onClick} className={base} />;
}
