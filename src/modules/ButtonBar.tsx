import Button from "@/components/Button";

interface ButtonProps {
    label: string;
    link?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    className?: string;
}

interface ButtonBarProps {
    buttons: ButtonProps[];
}

/**
 * A horizontal toolbar component that renders a list of standardized actions.
 */
export default function ButtonBar({ buttons }: ButtonBarProps) {
    return (
        <div className="flex flex-row justify-left gap-2">
            {buttons.map((button) => (
                <Button
                    key={button.label}
                    label={button.label}
                    onClick={button.onClick}
                    className={button.className}
                />
            ))}
        </div>
    );
}
