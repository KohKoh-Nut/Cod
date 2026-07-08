import React, { useState } from "react";
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
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    const inputStyles = `
        bg-bg-element text-fg border px-4 py-2 rounded-none 
        focus:outline-none transition-colors w-full font-mono
        ${isPassword ? "pr-10" : ""}
        ${error ? "border-error focus:border-error" : "border-border focus:border-interactive"} 
        ${className}
    `
        .trim()
        .replace(/\s+/g, " ");

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

            <div className="relative w-full">
                <input
                    type={resolvedType}
                    className={inputStyles}
                    {...props}
                />

                {/* Password reveal toggle */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-comment hover:text-fg transition-colors focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        <i
                            className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"}`}
                            aria-hidden="true"
                        />
                    </button>
                )}
            </div>

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