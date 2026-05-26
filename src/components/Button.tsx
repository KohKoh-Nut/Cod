interface ButtonProps {
    label: string;
    defaultBorder?: boolean;
    onClick?: () => void;
}

/**
 * Interactive navigation utility that maps data parameters to semantic Next.js link routes.
 */
export default function Button({
    label,
    defaultBorder = true,
    onClick = () => {},
}: ButtonProps) {
    const base = [
        "text-xs pt-1",
        "aspect-square shrink-0 px-3 py-1",
        "flex items-center justify-center",
        "c-transition c-bg-normal c-label-muted",
        defaultBorder ? "c-border-normal" : "c-outline-hover",
    ].join(" ");

    const medium = ["md:text-sm"].join(" ");

    const large = ["lg:text-sm"].join(" ");

    return (
        <button
            onClick={onClick}
            type="button"
            className={`${base} ${medium} ${large}`}
        >
            {label}
        </button>
    );
}
