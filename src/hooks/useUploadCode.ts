import { useRef } from "react";

export function useUploadCode(
    onLoad: (content: string) => void,
    disabled = false,
) {
    const inputRef = useRef<HTMLInputElement>(null);

    const triggerUpload = () => {
        if (disabled) return;
        inputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result;
            if (typeof text === "string") {
                onLoad(text);
            }
        };

        reader.readAsText(file);
        // Reset input value to allow re-uploading the same file
        e.target.value = "";
    };

    return { inputRef, triggerUpload, handleFileChange };
}
