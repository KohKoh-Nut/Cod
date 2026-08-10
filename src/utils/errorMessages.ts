// common Supabase auth and Postgres error text, mapped to copy a general
// user can actually act on instead of raw backend wording
const KNOWN_MESSAGES: Array<{ match: RegExp; friendly: string }> = [
    {
        match: /invalid login credentials/i,
        friendly: "Incorrect email or password.",
    },
    {
        match: /email not confirmed/i,
        friendly:
            "Please confirm your email before signing in -- check your inbox for the confirmation link.",
    },
    {
        match: /user already registered/i,
        friendly: "An account with this email already exists.",
    },
    {
        match: /password should be at least/i,
        friendly: "Password is too short.",
    },
    {
        match: /unable to validate email address/i,
        friendly: "That doesn't look like a valid email address.",
    },
    {
        match: /rate limit|too many requests|only request this once/i,
        friendly: "Too many attempts. Please wait a moment and try again.",
    },
    {
        match: /duplicate key value/i,
        friendly: "That already exists.",
    },
    {
        match: /row-level security/i,
        friendly: "You don't have permission to do that.",
    },
    {
        match: /failed to fetch|networkerror|network request failed/i,
        friendly: "Network error. Check your connection and try again.",
    },
];

// turns a supabase/postgrest error (or anything thrown) into a message
// safe to show a general user, falling back to something generic instead
// of leaking raw backend text like constraint names or stack traces
export function toFriendlyError(
    error: unknown,
    fallback = "Something went wrong. Please try again.",
): string {
    const raw =
        error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "";
    const known = KNOWN_MESSAGES.find((entry) => entry.match.test(raw));
    return known ? known.friendly : fallback;
}
