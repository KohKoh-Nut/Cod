import React from "react";

import Button from "@/components/Button";

type ButtonProps = React.ComponentProps<typeof Button>;

interface ButtonBarProps {
    buttons: ButtonProps[];
}

export default function ButtonBar({ buttons }: ButtonBarProps) {
    return (
        <div className="flex flex-row justify-start gap-2">
            {/* Render out the array of configured buttons */}
            {buttons.map((buttonProps, index) => (
                <Button
                    key={`${buttonProps.label}-${index}`}
                    {...buttonProps}
                />
            ))}
        </div>
    );
}
