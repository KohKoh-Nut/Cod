export interface ButtonProps {
    label: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?:() => void;
    className?: string;
}