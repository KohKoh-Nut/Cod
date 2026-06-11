import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

import Text from "@/components/Text";

const MessageLayout = cva("p-4 max-w-[80%] font-mono", {
    variants: {
        type: {
            send: "self-end",
            receive: "self-receive",
        },
    },
    defaultVariants: { type: "send" },
});

const MessageTheme = cva("c-transition border leading-relaxed break-words", {
    variants: {
        type: {
            send: "border-swamp-murk bg-ancient-pine text-eucalyptus-leaf",
            receive: "border-deep-teal bg-sunken-timber ",
        },
    },
    defaultVariants: { type: "send" },
});

interface MessageProps
    extends
        VariantProps<typeof MessageLayout>,
        VariantProps<typeof MessageTheme> {
    sender?: string;
    text?: string;
    className?: string;
}

export default function Message({
    sender,
    text,
    className,
    type,
}: MessageProps) {
    const combined = twMerge(
        MessageLayout({ type }),
        MessageTheme({ type }),
        className,
    );

    return (
        <div className={combined}>
            <Text
                label={`> ${sender}`}
                className="mb-1"
                color="none"
                formatting="bold"
                size="sm"
            />
            <Text label={text} type="none" className="mb-1" size="sm" />
        </div>
    );
}
