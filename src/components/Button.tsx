import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

// Layout variants: controls size, padding, and hover/active scale behavior
const buttonLayout = cva(
    "font-bold font-mambo shrink-0 flex items-center justify-center c-transition border-2",
    {
        variants: {
            size: {
                sm: "text-base px-2.5 py-1 md:text-lg lg:text-xl",
                md: "text-lg px-5 py-2 md:text-xl lg:text-2xl",
                lg: "text-xl px-6 py-3 md:text-2xl lg:text-3xl",
            },
            scale: {
                none: "hover:scale-100 active:scale-100",
                bounce: "hover:scale-110 active:scale-95",
            },
        },
        defaultVariants: {
            size: "sm",
            scale: "bounce",
        },
    },
);

// Theme variants: controls border, background, and text color per interaction state
const buttonTheme = cva(
    "selection:text-burnt-ochre selection:bg-canyon-flash cursor-pointer",
    {
        variants: {
            border: {
                none: "border-transparent hover:border-transparent active:border-transparent",
                muted: "border-transparent hover:border-border active:border-border",
                light: "border-border hover:border-comment active:border-comment",
            },
            bg: {
                none: "bg-transparent hover:bg-transparent active:bg-transparent",
                muted: "bg-transparent hover:bg-bg-surface active:bg-bg-surface",
                light: "bg-bg-surface hover:bg-border-65 active:bg-border-65",
            },
            text: {
                muted: "text-fg/0 hover:text-brand active:text-brand tracking-wide",
                light: "text-fg-muted hover:text-fg active:text-fg",
                dark: "text-fg hover:text-brand active:text-brand",
                brand: "text-brand hover:text-brand-hover active:text-brand-hover tracking-tight",
            },
        },
        defaultVariants: {
            border: "light",
            bg: "light",
            text: "dark",
        },
    },
);

interface ButtonProps
    extends
        VariantProps<typeof buttonLayout>,
        VariantProps<typeof buttonTheme> {
    label: string;
    type?: "submit" | "button" | "reset";
    // when provided, renders a Next.js Link instead of a <button>
    link?: string;
    className?: string;
    aria?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

// Renders either a Next.js Link or a plain button depending on whether `link` is passed
export default function Button({
    label,
    link,
    aria,
    className,
    border,
    bg,
    text,
    size,
    scale,
    type = "button",
    ...props
}: ButtonProps) {
    const classes = twMerge(
        buttonLayout({ size, scale }),
        buttonTheme({ border, bg, text }),
        className,
    );

    if (link) {
        return (
            <Link href={link} aria-label={aria} className={classes} {...props}>
                {label}
            </Link>
        );
    }

    return (
        <button type={type} aria-label={aria} className={classes} {...props}>
            {label}
        </button>
    );
}
