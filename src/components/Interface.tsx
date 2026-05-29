export interface ButtonProps {
    label: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?:() => void;
    className?: string;
}

export interface NavButtonProps extends ButtonProps {
    link: string;
};

export interface FloatingButtonExtra {
    position?: string;
    text?: string;
}
