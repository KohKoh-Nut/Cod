import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

import Link from "next/link";

/**
 * Manages foundational dimensions, spacing configurations, responsive scaling structures,
 * and standard animation scaling transformations for the Button micro-interaction system.
 */
const ButtonLayout = cva(
    [
        "font-bold font-mambo",
        "shrink-0 flex items-center justify-center",
        "c-transition border-2",
    ].join(" "),
    {
        variants: {
            size: {
                sm: [
                    "text-base px-2.5 py-1 pt-1.5",
                    "md:text-lg ",
                    "lg:text-xl ",
                ].join(" "),
                md: [
                    "text-lg  px-5 py-2 pt-3.5",
                    "md:text-xl",
                    "lg:text-2xl",
                ].join(" "),
                lg: [
                    "text-xl px-6 py-3 pt-4.5",
                    "md:text-2xl",
                    "lg:text-3xl",
                ].join(" "),
            },
            scale: {
                none: "hover:scale-100 active:scale-100",
                bounce: "hover:scale-110 active:scale-95",
            },
        },
        defaultVariants: { size: "sm", scale: "bounce" },
    },
);

/**
 * Controls structural palette states, managing boundaries, background colors,
 * and specific text contrast or branding emphasis variations across interaction cycles.
 */
const ButtonTheme = cva(
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
        defaultVariants: { border: "light", bg: "light", text: "dark" },
    },
);

/**
 * Interface representing the complete set of properties accepted by the Button component.
 * * @interface ButtonProps
 * @extends {VariantProps<typeof ButtonLayout>} Inherits structural dimensional properties ('size', 'scale').
 * @extends {VariantProps<typeof ButtonTheme>} Inherits palette aesthetic properties ('border', 'bg', 'text').
 * @property {string} label - The central text content string displayed inside the interactive primitive.
 * @property {string} [link] - An optional application routing string that shifts the underlying node to a Next.js navigation anchor.
 * @property {string} [className] - Optional custom CSS style targets to mix into the styling layout stack.
 * @property {() => void} [onClick] - Interaction callback triggered when a primary selection sequence completes.
 * @property {() => void} [onMouseEnter] - Boundary tracking callback active when a pointer shifts onto the asset element.
 * @property {() => void} [onMouseLeave] - Boundary tracking callback active when a pointer shifts outside the asset element.
 */
interface ButtonProps
    extends
        VariantProps<typeof ButtonLayout>,
        VariantProps<typeof ButtonTheme> {
    label: string;
    link?: string;
    className?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    aria?: string;
}

/**
 * A highly configurable interactive micro-primitive that dynamically toggles its structural
 * context element between an underlying standard standard HTML button or an optimized Next.js Link element.
 *
 * @public
 * @param {ButtonProps} props - Layout controls, interactive event hooks, and surface assets for the button element.
 * @param {string} props.label - Raw descriptive text content mapped inside the container space.
 * @param {string} [props.link] - Navigation location parameter determining contextual element conversion.
 * @param {string} [props.className] - Override formatting classes mixed down to the container structure via tailwind-merge.
 * @param {"light" | "muted" | "none"} [props.border="light"] - Configured visual outer boundary state mapping.
 * @param {"light" | "muted" | "none"} [props.bg="light"] - Configured backing base color state mapping.
 * @param {"dark" | "light" | "muted" | "brand"} [props.text="dark"] - Font display coloring strategy and horizontal kerning adjustments.
 * @param {"sm" | "md" | "lg"} [props.size="sm"] - Sizing configuration rules defining responsive padding scaling.
 * @param {"bounce" | "none"} [props.scale="bounce"] - Transform animations active across click and hover interaction patterns.
 * @returns {JSX.Element} An interactive anchor tracking application logic or deep-linked client navigational pathways.
 */
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
    ...props
}: ButtonProps) {
    const combined = twMerge(
        ButtonLayout({ size, scale }),
        ButtonTheme({ border, bg, text }),
        className,
    );
    const sharedProps = { className: combined, ...props };

    if (link)
        return (
            <Link href={link} aria-label={aria} {...sharedProps}>
                {label}
            </Link>
        );
    return (
        <button type="button" aria-label={aria} {...sharedProps}>
            {label}
        </button>
    );
}
