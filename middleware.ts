import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // mirror cookies onto the request so they're visible downstream
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );

                    // rebuild the response so it picks up the updated request headers
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });

                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // use getUser() here, not getSession() - getSession() just reads the cookie
    // and doesn't verify it, so it's not safe for auth checks in middleware
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // protect /profile routes
    if (request.nextUrl.pathname.startsWith("/profile") && !user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
}

// run on everything except static assets/images
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
