import { ButtonProps } from "@/components/Interface";
import NormalButton from "@/components/Button/NormalButton";

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
                <NormalButton
                    key={button.label}
                    label={button.label}
                    onClick={button.onClick}
                    className={button.className}
                />
            ))}
        </div>
    );
}
