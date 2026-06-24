import React from "react";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { isExternalLink } from "@/utils/linkChecker";

// layout variants - font, spacing, size, leading, tracking per type
const textLayout = cva(
    "font-mono text-justify text-pretty hyphens-auto lang='en'",
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

// theme variants - color, background, border, selection highlight per state
const textTheme = cva("c-transition", {
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
                "text-fg selection:text-crimson-creek selection:bg-wildfire",
            primary:
                "text-fg selection:text-bluestone selection:bg-eucalyptus-smoke",
            secondary:
                "text-fg-muted opacity-80 selection:text-dry-straw selection:bg-spinifex-gold",
            muted: "text-fg-muted opacity-60 selection:text-dry-moss selection:bg-pale-spinifex",
            link: "text-brand hover:text-brand-hover active:text-brand-hover selection:text-berry-bramble selection:bg-dusty-mauve",
        },
    },
    defaultVariants: {
        border: "none",
        bg: "none",
        color: "primary",
    },
});

// maps type+level to the html tag and its defaults
// headers need the level suffix (header_1, header_2...) since level changes the tag
const typeConfig = {
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

const defaultConfig = {
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
    as?: keyof React.JSX.IntrinsicElements; // override the resolved tag if needed
    className?: string;
}

// renders the right tag based on type/level, falls back to next/link for internal urls
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
    // headers need the level suffix to match typeConfig keys, e.g "header_1"
    const lookupKey =
        type === "header" && level !== "none" ? `${type}_${level}` : type;

    const config =
        typeConfig[lookupKey as keyof typeof typeConfig] ?? defaultConfig;
    const { tag: Tag, defaultSize, defaultFormatting, defaultColor } = config;

    const FinalTag = as ?? Tag;
    const finalSize = size ?? defaultSize;
    const finalFormatting = formatting ?? defaultFormatting;
    const finalColor = color ?? defaultColor;

    const classes = twMerge(
        textLayout({
            type,
            level,
            border,
            size: finalSize,
            formatting: finalFormatting,
        }),
        textTheme({ border, bg, color: finalColor }),
        className,
    );

    // internal links use next/link for client side nav
    if (type === "url" && !isExternalLink(link ?? "") && !as) {
        return (
            <Link href={link ?? "/"} className={classes}>
                {children ?? label}
            </Link>
        );
    }

    // external links / raw anchors get target blank + rel for security
    const anchorProps =
        FinalTag === "a"
            ? { href: link, target: "_blank", rel: "noopener noreferrer" }
            : {};

    return (
        <FinalTag className={classes} {...anchorProps}>
            {children ?? label}
        </FinalTag>
    );
}
