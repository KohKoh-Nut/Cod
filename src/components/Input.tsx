import React from "react";
import Text from "@/components/Text";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

// Wraps a native input with label + error text, both rendered through Text
export default function InputField({
    label,
    error,
    type = "text",
    className = "",
    ...props
}: InputFieldProps) {
    // error state swaps border color, base classes stay the same otherwise
    const inputClasses = [
        "bg-slate-700 text-white border px-4 py-2",
        "focus:outline-none transition-colors w-full font-mono",
        error
            ? "border-red-400 focus:border-red-400"
            : "border-slate-600 focus:border-cyan-500",
        className,
    ].join(" ");

    return (
        <div className="flex flex-col space-y-1 w-full">
            {label && (
                <Text
                    type="description"
                    color="secondary"
                    formatting="medium"
                    className="mb-1 text-sm block"
                >
                    {label}
                </Text>
            )}

            <input type={type} className={inputClasses} {...props} />

            {error && (
                <Text
                    type="description"
                    color="important"
                    className="text-red-400 text-xs flex items-center gap-1 mt-1"
                >
                    <span className="font-bold">x</span>
                    {error}
                </Text>
            )}
        </div>
    );
}
