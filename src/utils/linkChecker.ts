/**
 * Checks if a link points to an external URL or an internal route
 */
export function isExternalLink(link: string): boolean {
    return (
        link.startsWith("http://") ||
        link.startsWith("https://") ||
        link.startsWith("//")
    );
}
