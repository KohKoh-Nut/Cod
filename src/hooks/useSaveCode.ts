export function useSaveCode() {
    const saveCode = (content: string) => {
        const fileName = window.prompt("Enter file name", "code.txt");
        if (!fileName) return;

        // Ensure the file ends with a .txt extension
        const finalName = fileName.endsWith(".txt")
            ? fileName
            : `${fileName}.txt`;

        // Create a blob and trigger a download via a temporary link
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = finalName;

        // Append, click, and cleanup
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    return { saveCode };
}
