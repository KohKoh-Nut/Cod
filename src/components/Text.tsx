import React from "react";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { isExternalLink } from "@/utils/linkChecker";

// Sizing, line heights, and typography layout variations
const textLayout = cva(
    "font-mono text-justify text-pretty hyphens-auto lang='en' rounded-none",
    {
        variants: {
            type: {
                none: "",
                header: "leading-tight tracking-wide",
                paragraph: "leading-relaxed tracking-tight",
                description: "leading-normal tracking-tight",
                date: "uppercase tracking-wider",
                time: "uppercase",
                url: "underline underline-offset-2 tracking-normal break-all cursor-pointer",
            },
            level: {
                none: "",
                1: "",
                2: "",
                3: "",
            },
            size: {
                none: "",
                sm: "text-base md:text-lg",
                md: "text-lg md:text-xl",
                lg: "text-lg md:text-xl",
                xl: "text-xl md:text-2xl",
                xxl: "text-2xl md:text-3xl",
            },
            formatting: {
                none: "",
                medium: "font-medium",
                semibold: "font-semibold",
                bold: "font-bold",
                italics: "italic",
            },
            border: {
                none: "",
                light: "py-1 px-2",
            },
        },
        defaultVariants: {
            type: "paragraph",
            level: "none",
            size: "md",
            formatting: "none",
            border: "none",
        },
    },
);

// Theme states, background styles, and custom selection highlights
const textTheme = cva("c-transition rounded-none", {
    variants: {
        border: {
            none: "",
            light: "border border-border px-2.5 py-1 pt-1.5",
        },
        bg: {
            none: "",
            light: "bg-bg-surface",
        },
        color: {
            none: "",
            important:
                "text-fg selection:text-abyssal-bark selection:bg-magma-dust",
            primary:
                "text-fg selection:text-burnt-charcoal selection:bg-outback-sky",
            secondary:
                "text-fg-muted opacity-80 selection:text-burnt-charcoal selection:bg-tumbleweed",
            muted: "text-fg-muted opacity-60 selection:text-abyssal-bark selection:bg-desert-sage",
            link: "text-brand hover:text-brand-hover active:text-brand-hover selection:text-dusty-parchment selection:bg-dusty-mauve",
        },
    },
    defaultVariants: {
        border: "none",
        bg: "none",
        color: "primary",
    },
});

// Maps text types to HTML elements and fallback styling presets
const TEXT_TYPE_CONFIGS = {
    none: {
        tag: "span",
        defaultSize: "none",
        defaultFormatting: "none",
        defaultColor: "none",
    },
    header_1: {
        tag: "h1",
        defaultSize: "xxl",
        defaultFormatting: "bold",
        defaultColor: "important",
    },
    header_2: {
        tag: "h2",
        defaultSize: "xl",
        defaultFormatting: "semibold",
        defaultColor: "important",
    },
    header_3: {
        tag: "h3",
        defaultSize: "lg",
        defaultFormatting: "medium",
        defaultColor: "important",
    },
    paragraph: {
        tag: "p",
        defaultSize: "md",
        defaultFormatting: "none",
        defaultColor: "primary",
    },
    description: {
        tag: "span",
        defaultSize: "sm",
        defaultFormatting: "none",
        defaultColor: "secondary",
    },
    date: {
        tag: "time",
        defaultSize: "sm",
        defaultFormatting: "none",
        defaultColor: "muted",
    },
    time: {
        tag: "time",
        defaultSize: "sm",
        defaultFormatting: "none",
        defaultColor: "muted",
    },
    url: {
        tag: "a",
        defaultSize: "sm",
        defaultFormatting: "none",
        defaultColor: "link",
    },
} as const;

const DEFAULT_FALLBACK_CONFIG = {
    tag: "p",
    defaultSize: "md",
    defaultFormatting: "none",
    defaultColor: "primary",
} as const;

interface TextProps
    extends VariantProps<typeof textLayout>, VariantProps<typeof textTheme> {
    label?: string;
    link?: string;
    children?: React.ReactNode;
    as?: keyof React.JSX.IntrinsicElements;
    className?: string;
}

export default function Text({
    label,
    link,
    children,
    as,
    className,
    type,
    level,
    size,
    formatting,
    color,
    border,
    bg,
}: TextProps) {
    // Generate the lookup key (e.g., combine header type with its level)
    const configKey =
        type === "header" && level !== "none" ? `${type}_${level}` : type;
    const activeConfig =
        TEXT_TYPE_CONFIGS[configKey as keyof typeof TEXT_TYPE_CONFIGS] ??
        DEFAULT_FALLBACK_CONFIG;

    // Resolve structural values using user inputs or mapping defaults
    const ComponentTag = as ?? activeConfig.tag;
    const activeSize = size ?? activeConfig.defaultSize;
    const activeFormatting = formatting ?? activeConfig.defaultFormatting;
    const activeColor = color ?? activeConfig.defaultColor;

    // Compile dynamic classes using class-variance-authority and tailwind-merge
    const combinedClasses = twMerge(
        textLayout({
            type,
            level,
            border,
            size: activeSize,
            formatting: activeFormatting,
        }),
        textTheme({ border, bg, color: activeColor }),
        className,
    );

    // Render internal applications links
    if (type === "url" && !isExternalLink(link ?? "") && !as) {
        return (
            <Link href={link ?? "/"} className={combinedClasses}>
                {children ?? label}
            </Link>
        );
    }

    // Include safety tags for external navigation anchors
    const customAnchorProps =
        ComponentTag === "a"
            ? { href: link, target: "_blank", rel: "noopener noreferrer" }
            : {};

    return (
        <ComponentTag className={combinedClasses} {...customAnchorProps}>
            {children ?? label}
        </ComponentTag>
    );
}
