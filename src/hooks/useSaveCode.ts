export function useSaveCode() {
  const saveCode = (content: string) => {
    const filename = window.prompt('Enter file name', 'code.txt');
    if (!filename) return; // user cancelled

    const finalName = filename.endsWith('.txt') ? filename : `${filename}.txt`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = finalName;
    link.click();

    URL.revokeObjectURL(url);
  };

  return { saveCode };
}