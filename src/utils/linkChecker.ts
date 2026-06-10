/**
 * Resolves whether a given path string targets an external network resource
 * or an internal application routing destination. It checks the prefix of the path
 * against standard web protocol markers to identify remote URLs.
 *
 * @public
 * @param {string} link - The destination URL string or local route path to evaluate.
 * @returns {boolean} True if the link specifies an external remote origin, otherwise false.
 */
export function isExternalLink(link: string): boolean {
    return (
        link.startsWith("http://") ||
        link.startsWith("https://") ||
        link.startsWith("//")
    );
}
