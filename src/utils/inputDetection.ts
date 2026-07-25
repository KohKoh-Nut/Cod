// Wandbox runs compiled/interpreted languages non-interactively, so we
// can't prompt for input while the program runs -- instead this scans
// the source for input-reading calls and guesses how many values to
// collect from the user upfront, per language's typical input syntax
export function countInputCalls(src: string, lang: string): number {
    // strip comments out of the user's code first so commented-out
    // input calls don't get counted
    const stripped = src
        .replace(/\/\/[^\n]*/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "");

    if (lang === "python") {
        // python's comment marker is # not //, so strip that too before
        // counting python's own input() calls below
        return (
            stripped.replace(/#[^\n]*/g, "").match(/\binput\s*\(/g) ?? []
        ).length;
    }

    if (lang === "cpp" || lang === "c++") {
        let count = 0;
        for (const line of stripped.split("\n")) {
            const trimmed = line.trim();
            if (/\bgetline\s*\(/.test(trimmed)) {
                count += (trimmed.match(/\bgetline\s*\(/g) ?? []).length;
            } else if (/\bcin\b/.test(trimmed)) {
                // each >> after cin pulls in one more value
                count += (trimmed.match(/>>/g) ?? []).length;
            }
        }
        return count;
    }

    if (lang === "c") {
        return (stripped.match(/%[diouxXeEfgGcs]/g) ?? []).length;
    }
    if (lang === "java") {
        return (
            stripped.match(
                /\.(nextLine|nextInt|nextDouble|nextFloat|nextLong|next)\s*\(/g,
            ) ?? []
        ).length;
    }
    if (lang === "rust") {
        return (stripped.match(/\.read_line\s*\(/g) ?? []).length;
    }

    return (stripped.match(/\bprompt\s*\(/g) ?? []).length;
}
