import { useState } from "react";

/**
 * Custom hook to manage code editor state and handle remote code execution.
 */
export function useCodeExecution(initialCode: string) {
    const [code, setCode] = useState<string>(initialCode);
    const [output, setOutput] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Sends the current code state to the backend execution API
    const handleRunCode = async () => {
        setIsLoading(true);
        setOutput("");

        try {
            const response = await fetch("/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (data.error) {
                setOutput(data.error);
            } else {
                setOutput(
                    data.run?.output || "Code executed successfully with no output logs."
                );
            }
        } catch (error) {
            setOutput("Execution Error: Internal server error.");
        } finally {
            setIsLoading(false);
        }
    };

    return { code, setCode, output, isLoading, handleRunCode };
}