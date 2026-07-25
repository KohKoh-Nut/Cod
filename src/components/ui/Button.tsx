import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

// sizing and hover/active scale animation, kept separate from color
const buttonLayout = cva(
    "font-bold font-mambo shrink-0 flex items-center justify-center c-transition border-2 rounded-none",
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

// border/background/text colors and their hover and active states
const buttonTheme = cva(
    "selection:text-abyssal-bark selection:bg-apricot-dust cursor-pointer rounded-none",
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
                light: "bg-bg-surface hover:bg-crushed-clay active:bg-crushed-clay",
            },
            text: {
                muted: "text-fg-muted opacity-40 hover:text-brand hover:opacity-100 active:text-brand tracking-wide",
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
    link?: string;
    className?: string;
    aria?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

// single button component that renders as a Next Link when a url is
// given, or a plain button otherwise
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
    const combinedClasses = twMerge(
        buttonLayout({ size, scale }),
        buttonTheme({ border, bg, text }),
        className,
    );

    // renders as a navigable link when a url is provided
    if (link) {
        return (
            <Link
                href={link}
                aria-label={aria}
                className={combinedClasses}
                {...props}
            >
                {label}
            </Link>
        );
    }

    // otherwise a plain button
    return (
        <button
            type={type}
            aria-label={aria}
            className={combinedClasses}
            {...props}
        >
            {label}
        </button>
    );
}
