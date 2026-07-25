import React from "react";

import Button from "@/components/ui/Button";

type ButtonProps = React.ComponentProps<typeof Button>;

interface ButtonBarProps {
    buttons: ButtonProps[];
}

// renders a row of buttons from a list of Button prop objects, so
// callers can build a toolbar declaratively
export default function ButtonBar({ buttons }: ButtonBarProps) {
    return (
        <div className="flex flex-row flex-wrap justify-start gap-2">
            {buttons.map((buttonProps, index) => (
                <Button
                    key={`${buttonProps.label}-${index}`}
                    {...buttonProps}
                />
            ))}
        </div>
    );
}
