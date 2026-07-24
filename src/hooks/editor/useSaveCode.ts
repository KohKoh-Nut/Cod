// downloads the editor content as a local .txt file
export function useSaveCode() {
    const saveCode = (content: string) => {
        const fileName = window.prompt("Enter file name", "code.txt");
        if (!fileName) return;

        // force a .txt extension if the user didn't type one
        const finalName = fileName.endsWith(".txt")
            ? fileName
            : `${fileName}.txt`;

        // build a downloadable blob url for the file content
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        // use a throwaway anchor tag to trigger the browser download
        const link = document.createElement("a");
        link.href = url;
        link.download = finalName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    return { saveCode };
}
