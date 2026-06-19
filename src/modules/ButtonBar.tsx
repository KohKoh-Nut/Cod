import Button from "@/components/Button";

// reuse the props type from Button rather than redefining them
type ButtonConfig = React.ComponentProps<typeof Button>;

interface ButtonBarProps {
    buttons: ButtonConfig[];
}

export default function ButtonBar({ buttons }: ButtonBarProps) {
    return (
        <div className="flex flex-row justify-start gap-2">
            {buttons.map((button) => (
                <Button key={button.label} {...button} />
            ))}
        </div>
    );
}
