// Cloudflare Worker — proxies to Wandbox and adds CORS headers.
// Routes:
//   POST /                 — compile and run code
//   GET  /runtimes         — full compiler list from Wandbox
//   GET  /debug-compilers  — compiler list filtered by language

// origins allowed to call this worker
const ALLOWED_ORIGINS = ["https://kohkoh-nut.github.io"];

// rate limit: max requests per IP per window
const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW_SECONDS = 10;

// reject bodies bigger than this before parsing
const MAX_BODY_BYTES = 100_000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const allowed = origin !== null && ALLOWED_ORIGINS.includes(origin);

    // CORS preflight
    if (request.method === "OPTIONS") {
      if (!allowed) return new Response("Forbidden", { status: 403 });
      return cors(new Response(null), origin);
    }

    // wrong/missing origin never reaches Wandbox
    if (!allowed) {
      return new Response("Forbidden", { status: 403 });
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    if (await isRateLimited(ip, env)) {
      return cors(json({ error: "Too many requests, slow down." }, 429), origin);
    }

    // GET /runtimes — full list from Wandbox
    if (request.method === "GET" && url.pathname.endsWith("/runtimes")) {
      let res;
      try {
        res = await fetch("https://wandbox.org/api/list.json", {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; WandboxProxy/1.0)" },
        });
      } catch (err) {
        return cors(json({ error: `Could not reach Wandbox: ${err.message}` }, 502), origin);
      }
      const data = await res.json();
      return cors(json(data), origin);
    }

    // GET /debug-compilers?lang=java — returns matching compiler names for a language
    if (request.method === "GET" && url.pathname.endsWith("/debug-compilers")) {
      const lang = url.searchParams.get("lang") ?? "";
      let res;
      try {
        res = await fetch("https://wandbox.org/api/list.json", {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; WandboxProxy/1.0)" },
        });
      } catch (err) {
        return cors(json({ error: `Could not reach Wandbox: ${err.message}` }, 502), origin);
      }
      const data = await res.json();
      // Filter to entries whose language or name contains the query
      const matches = data.filter((c) =>
        c.language?.toLowerCase().includes(lang.toLowerCase()) ||
        c.name?.toLowerCase().includes(lang.toLowerCase())
      );
      return cors(json(matches.map((c) => ({ name: c.name, language: c.language, version: c.version }))), origin);
    }

    // POST / — compile and run
    if (request.method !== "POST") {
      return cors(new Response("Method not allowed", { status: 405 }), origin);
    }

    const contentLength = Number(request.headers.get("Content-Length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return cors(json({ error: "Payload too large" }, 413), origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return cors(new Response("Invalid JSON", { status: 400 }), origin);
    }
    const { code, compiler, options = "", stdin = "" } = body;
    if (!code || !compiler) {
      return cors(json({ error: "Missing code or compiler" }, 400), origin);
    }
    let wandboxRes;
    try {
      wandboxRes = await fetch("https://wandbox.org/api/compile.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; WandboxProxy/1.0)",
        },
        body: JSON.stringify({ code, compiler, options, stdin }),
      });
    } catch (err) {
      return cors(json({ error: `Could not reach Wandbox: ${err.message}` }, 502), origin);
    }
    if (!wandboxRes.ok) {
      const text = await wandboxRes.text();
      return cors(json({ error: `Wandbox returned ${wandboxRes.status}: ${text}` }, 502), origin);
    }
    const data = await wandboxRes.json();
    return cors(json({
      program_output: data.program_output ?? "",
      program_error:  (data.program_error ?? "") + (data.compiler_error ?? ""),
      status:         data.status,
    }), origin);
  },
};

// fixed-window counter in KV, one key per IP
async function isRateLimited(ip, env) {
  if (!env.RATE_LIMIT_KV) return false; // no binding yet, fail open
  const key = `rl:${ip}`;
  const current = parseInt((await env.RATE_LIMIT_KV.get(key)) ?? "0", 10);
  if (current >= RATE_LIMIT) return true;
  await env.RATE_LIMIT_KV.put(key, String(current + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });
  return false;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// origin is already checked against the allow-list before this runs,
// so it's safe to reflect back instead of using "*"
function cors(response, origin) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Vary", "Origin");
  return new Response(response.body, { status: response.status, headers });
}
