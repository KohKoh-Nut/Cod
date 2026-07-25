// true if the link points outside this app (full URL or protocol-relative)
export function isExternalLink(link: string): boolean {
    return (
        link.startsWith("http://") ||
        link.startsWith("https://") ||
        link.startsWith("//")
    );
}
