import React from "react";

import Text from "@/components/Text";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function InputField({
    label,
    error,
    type = "text",
    className = "",
    ...props
}: InputFieldProps) {
    // Dynamic styles based on error state
    const inputStyles = `
        bg-bg-element text-fg border px-4 py-2 rounded-none 
        focus:outline-none transition-colors w-full font-mono
        ${error ? "border-error focus:border-error" : "border-border focus:border-interactive"} 
        ${className}
    `
        .trim()
        .replace(/\s+/g, " ");

    return (
        <div className="flex flex-col space-y-1 w-full">
            {/* Input Label */}
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

            <input type={type} className={inputStyles} {...props} />

            {/* Error Message */}
            {error && (
                <Text
                    type="description"
                    color="important"
                    className="text-error text-xs flex items-center gap-1 mt-1"
                >
                    <span className="font-bold">x</span>
                    {error}
                </Text>
            )}
        </div>
    );
}
