// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "../wandbox-proxy.worker.js";

const ALLOWED_ORIGIN = "https://kohkoh-nut.github.io";

// fake KV binding, backed by a plain Map instead of real Cloudflare KV
function makeFakeKV() {
    const store = new Map();
    return {
        async get(key) {
            return store.has(key) ? store.get(key) : null;
        },
        async put(key, value) {
            store.set(key, value);
        },
    };
}

function makeEnv() {
    return { RATE_LIMIT_KV: makeFakeKV() };
}

function makeRequest({
    method = "GET",
    path = "/",
    origin = ALLOWED_ORIGIN,
    ip = "1.2.3.4",
    body,
    contentLength,
} = {}) {
    const headers = new Headers();
    if (origin !== null) headers.set("Origin", origin);
    if (ip !== null) headers.set("CF-Connecting-IP", ip);
    if (body !== undefined) {
        headers.set("Content-Type", "application/json");
        headers.set(
            "Content-Length",
            String(contentLength ?? JSON.stringify(body).length),
        );
    }
    return new Request(`https://proxy.example.workers.dev${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
}

// each call gets its own Response instance -- reusing one Response
// across calls breaks on the second .json() since the body stream is
// already consumed by then
function mockFetchOk(payload) {
    vi.stubGlobal(
        "fetch",
        vi.fn(() =>
            Promise.resolve(
                new Response(JSON.stringify(payload), { status: 200 }),
            ),
        ),
    );
}

describe("wandbox-proxy worker: origin checks", () => {
    beforeEach(() => vi.restoreAllMocks());

    it("rejects a request with no Origin header", async () => {
        const req = makeRequest({ method: "POST", origin: null, body: {} });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(403);
    });

    it("rejects a request from an origin not on the allow-list", async () => {
        const req = makeRequest({
            method: "POST",
            origin: "https://evil.example.com",
            body: { code: "1+1", compiler: "python-3.10" },
        });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(403);
    });

    it("rejects a CORS preflight from a disallowed origin", async () => {
        const req = makeRequest({
            method: "OPTIONS",
            origin: "https://evil.example.com",
        });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(403);
    });

    it("answers a CORS preflight from the allowed origin, reflecting it back", async () => {
        const req = makeRequest({ method: "OPTIONS" });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(200);
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
            ALLOWED_ORIGIN,
        );
    });
});

describe("wandbox-proxy worker: POST / (compile and run)", () => {
    beforeEach(() => vi.restoreAllMocks());

    it("proxies a valid request to Wandbox and returns its output", async () => {
        mockFetchOk({ program_output: "2\n", program_error: "", status: "0" });

        const req = makeRequest({
            method: "POST",
            body: { code: "print(1+1)", compiler: "python-3.10" },
        });
        const res = await worker.fetch(req, makeEnv());
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.program_output).toBe("2\n");
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
            ALLOWED_ORIGIN,
        );
        expect(fetch).toHaveBeenCalledWith(
            "https://wandbox.org/api/compile.json",
            expect.objectContaining({ method: "POST" }),
        );
    });

    it("merges program_error and compiler_error into one field", async () => {
        mockFetchOk({
            program_output: "",
            program_error: "boom",
            compiler_error: "warning: x",
        });

        const req = makeRequest({
            method: "POST",
            body: { code: "bad code", compiler: "gcc-13.2.0" },
        });
        const res = await worker.fetch(req, makeEnv());
        const data = await res.json();

        expect(data.program_error).toBe("boomwarning: x");
    });

    it("rejects a request missing code", async () => {
        const req = makeRequest({
            method: "POST",
            body: { compiler: "python-3.10" },
        });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(400);
    });

    it("rejects a request missing compiler", async () => {
        const req = makeRequest({ method: "POST", body: { code: "1+1" } });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(400);
    });

    it("rejects a body that isn't valid JSON", async () => {
        const req = new Request("https://proxy.example.workers.dev/", {
            method: "POST",
            headers: {
                Origin: ALLOWED_ORIGIN,
                "Content-Type": "application/json",
                "Content-Length": "9",
            },
            body: "not json",
        });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(400);
    });

    it("rejects a body over the size cap", async () => {
        const req = makeRequest({
            method: "POST",
            body: { code: "1+1", compiler: "python-3.10" },
            contentLength: 200_000, // Content-Length lie, same as an oversized real body
        });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(413);
    });

    it("returns 502 when Wandbox itself errors", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                Promise.resolve(new Response("server error", { status: 500 })),
            ),
        );
        const req = makeRequest({
            method: "POST",
            body: { code: "1+1", compiler: "python-3.10" },
        });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(502);
    });

    it("returns 502 when Wandbox can't be reached at all", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new Error("network down"))),
        );
        const req = makeRequest({
            method: "POST",
            body: { code: "1+1", compiler: "python-3.10" },
        });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(502);
    });

    it("rejects methods other than GET/POST/OPTIONS", async () => {
        const req = makeRequest({
            method: "PUT",
            body: { code: "1+1", compiler: "python-3.10" },
        });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(405);
    });
});

describe("wandbox-proxy worker: GET routes", () => {
    beforeEach(() => vi.restoreAllMocks());

    it("proxies GET /runtimes to Wandbox's compiler list", async () => {
        mockFetchOk([{ name: "python-3.10", language: "Python" }]);

        const req = makeRequest({ method: "GET", path: "/runtimes" });
        const res = await worker.fetch(req, makeEnv());
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual([{ name: "python-3.10", language: "Python" }]);
        expect(fetch).toHaveBeenCalledWith(
            "https://wandbox.org/api/list.json",
            expect.any(Object),
        );
    });

    it("returns 502 when Wandbox is unreachable for /runtimes", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => Promise.reject(new Error("down"))),
        );
        const req = makeRequest({ method: "GET", path: "/runtimes" });
        const res = await worker.fetch(req, makeEnv());
        expect(res.status).toBe(502);
    });

    it("filters /debug-compilers by language substring", async () => {
        mockFetchOk([
            { name: "python-3.10", language: "Python", version: "3.10" },
            { name: "gcc-13.2.0", language: "C", version: "13.2.0" },
        ]);

        const req = makeRequest({
            method: "GET",
            path: "/debug-compilers?lang=python",
        });
        const res = await worker.fetch(req, makeEnv());
        const data = await res.json();

        expect(data).toEqual([
            { name: "python-3.10", language: "Python", version: "3.10" },
        ]);
    });

    it("returns an empty list from /debug-compilers when nothing matches", async () => {
        mockFetchOk([{ name: "gcc-13.2.0", language: "C", version: "13.2.0" }]);

        const req = makeRequest({
            method: "GET",
            path: "/debug-compilers?lang=rust",
        });
        const res = await worker.fetch(req, makeEnv());
        const data = await res.json();

        expect(data).toEqual([]);
    });
});

describe("wandbox-proxy worker: rate limiting", () => {
    beforeEach(() => vi.restoreAllMocks());

    it("allows requests under the limit and blocks the one that goes over", async () => {
        mockFetchOk({ program_output: "" });
        const env = makeEnv();
        const send = () =>
            worker.fetch(
                makeRequest({
                    method: "POST",
                    body: { code: "1+1", compiler: "python-3.10" },
                }),
                env,
            );

        for (let i = 0; i < 20; i++) {
            const res = await send();
            expect(res.status).toBe(200);
        }

        const blocked = await send();
        expect(blocked.status).toBe(429);
    });

    it("tracks limits per IP, not globally", async () => {
        mockFetchOk({ program_output: "" });
        const env = makeEnv();
        const sendFrom = (ip) =>
            worker.fetch(
                makeRequest({
                    method: "POST",
                    ip,
                    body: { code: "1+1", compiler: "python-3.10" },
                }),
                env,
            );

        for (let i = 0; i < 20; i++) await sendFrom("1.1.1.1");
        const cappedIpBlocked = await sendFrom("1.1.1.1");
        const otherIpAllowed = await sendFrom("2.2.2.2");

        expect(cappedIpBlocked.status).toBe(429);
        expect(otherIpAllowed.status).toBe(200);
    });

    it("fails open when no KV binding is configured", async () => {
        mockFetchOk({ program_output: "" });
        const env = {}; // no RATE_LIMIT_KV bound yet
        const req = makeRequest({
            method: "POST",
            body: { code: "1+1", compiler: "python-3.10" },
        });
        const res = await worker.fetch(req, env);
        expect(res.status).toBe(200);
    });
});
