import { useState, useEffect, useCallback, useRef } from "react";

import { getDefaultCode } from "@/constants/codeSample";

// languages the editor lets the user pick from
export const SUPPORTED_LANGUAGES = [
    "python",
    "javascript",
    "typescript",
    "c",
    "cpp",
    "rust",
    "r",
    "go",
    "ruby",
    "php",
    "scala",
    "perl",
    "bash",
    "lua",
    "haskell",
];

// shape of the pyodide runtime object once it's loaded
interface Pyodide {
    globals: { set: (key: string, value: unknown) => void };
    toPy: (value: unknown) => unknown;
    runPythonAsync: (
        code: string,
        options?: { globals?: unknown },
    ) => Promise<unknown>;
    pyimport: (mod: string) => unknown;
}

// pyodide attaches itself to window once loaded, and we attach our own
// input bridge for python's input() calls
declare global {
    interface Window {
        pyodide?: Pyodide;
        loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide>;
        __jsInput__?: (prompt: string) => Promise<string>;
    }
}

// one line in the terminal-style output panel
export type TerminalLine =
    | { type: "output"; text: string }
    | { type: "error"; text: string }
    | { type: "input"; text: string }
    | { type: "info"; text: string };

// known-good Wandbox compiler for each language, used first before
// falling back to a runtime lookup
const PREFERRED_COMPILERS: Record<
    string,
    { compiler: string; options?: string; filename?: string }
> = {
    typescript: { compiler: "typescript-5.6.2" },
    c: { compiler: "gcc-13.2.0", options: "-std=c17" },
    cpp: { compiler: "gcc-13.2.0", options: "-std=c++20" },
    rust: { compiler: "rust-1.82.0" },
    r: { compiler: "r-4.4.1" },
    go: { compiler: "go-1.23.2" },
    ruby: { compiler: "ruby-4.0.2" },
    php: { compiler: "php-8.3.12" },
    scala: { compiler: "scala-2.13.15" },
    perl: { compiler: "perl-5.42.0" },
    bash: { compiler: "bash" },
    lua: { compiler: "lua-5.4.7" },
    haskell: { compiler: "ghc-9.10.1" },
};

// maps the display names Wandbox uses for a runtime's language back to
// our own lowercase language ids
const LANGUAGE_ALIASES: Record<string, string> = {
    C: "c",
    "C++": "cpp",
    Java: "java",
    Rust: "rust",
    Go: "go",
    Ruby: "ruby",
    PHP: "php",
    Scala: "scala",
    Perl: "perl",
    "Bash script": "bash",
    Lua: "lua",
    Haskell: "haskell",
    Python: "python",
    R: "r",
    Kotlin: "kotlin",
    JavaScript: "javascript",
    TypeScript: "typescript",
};

// cached list of available Wandbox runtimes, fetched once per session
let runtimeCache: Array<{ name: string; language: string }> | null = null;

async function getRuntimes(
    proxy: string,
): Promise<Array<{ name: string; language: string }>> {
    if (runtimeCache) return runtimeCache;
    const res = await fetch(`${proxy}/runtimes`);
    if (!res.ok) throw new Error(`Could not fetch runtimes: ${res.status}`);
    runtimeCache = (await res.json()) as Array<{
        name: string;
        language: string;
    }>;
    return runtimeCache;
}

// just returns the preconfigured compiler for a language, if we have one
async function resolveCompiler(
    lang: string,
    proxy: string,
): Promise<{ compiler: string; options?: string; filename?: string }> {
    const preferred = PREFERRED_COMPILERS[lang];
    if (!preferred) throw new Error(`No compiler configured for: ${lang}`);
    return preferred;
}

// used when the preconfigured compiler name is rejected by Wandbox --
// looks up a live runtime name for the language instead
async function fallbackCompiler(lang: string, proxy: string): Promise<string> {
    const runtimes = await getRuntimes(proxy);
    const alias = Object.entries(LANGUAGE_ALIASES).find(
        ([, v]) => v === lang,
    )?.[0];
    const match = runtimes.find(
        (r) => r.language === alias || r.language === lang,
    );
    if (!match)
        throw new Error(
            `No compiler found for ${lang} in Wandbox runtime list`,
        );
    return match.name;
}

// pyodide is loaded once and shared across the whole app, since it's a
// large asset and every run/switch shouldn't refetch it
let pyodideInstance: Pyodide | null = null;
let pyodideLoaderPromise: Promise<Pyodide> | null = null;

async function loadPyodideRuntime(): Promise<Pyodide> {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoaderPromise) return pyodideLoaderPromise;

    pyodideLoaderPromise = (async () => {
        if (!window.loadPyodide) {
            // wait for the pyodide script tag to finish loading, reusing
            // one already on the page if some other code added it first
            await new Promise<void>((resolve, reject) => {
                const existing = document.querySelector(
                    'script[src*="pyodide.js"]',
                ) as HTMLScriptElement | null;

                if (existing) {
                    existing.addEventListener("load", () => resolve());
                    existing.addEventListener("error", () =>
                        reject(new Error("Pyodide script failed to load")),
                    );
                    return;
                }

                const tag = document.createElement("script");
                tag.src =
                    "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
                tag.onload = () => resolve();
                tag.onerror = () =>
                    reject(new Error("Pyodide script failed to load"));
                document.head.appendChild(tag);
            });
        }

        if (!window.loadPyodide)
            throw new Error("loadPyodide not found after script load");

        pyodideInstance = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
        });
        window.pyodide = pyodideInstance;
        return pyodideInstance;
    })();

    return pyodideLoaderPromise;
}

// drives the code editor: current code/language, terminal output lines,
// running state, and the actual run/input logic for every language
export function useCodeExecution(initialCode: string) {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState("python");
    const [lines, setLines] = useState<TerminalLine[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pyodideReady, setPyodideReady] = useState(false);
    const [waitingForInput, setWaitingForInput] = useState(false);

    // queue of resolvers waiting on the next line of user input
    const inputQueue = useRef<Array<(value: string) => void>>([]);

    // changing language also resets the editor to that language's sample code
    const switchLanguage = (lang: string) => {
        setLanguage(lang);
        setCode(getDefaultCode(lang));
    };

    const pushLine = (line: TerminalLine) => {
        setLines((prev) => [...prev, line]);
    };

    // called when the user types a response in the terminal's input prompt
    const submitInput = (value: string) => {
        pushLine({ type: "input", text: value });
        const nextResolver = inputQueue.current.shift();
        if (nextResolver) nextResolver(value);
        if (inputQueue.current.length === 0) setWaitingForInput(false);
    };

    // pauses execution and waits for the user to answer a prompt
    const requestInput = useCallback((prompt: string): Promise<string> => {
        if (prompt) pushLine({ type: "output", text: prompt });
        setWaitingForInput(true);
        return new Promise((resolve) => {
            inputQueue.current.push(resolve);
        });
    }, []);

    // start loading pyodide as soon as the hook mounts, so it's hopefully
    // ready by the time the user first runs python code
    useEffect(() => {
        loadPyodideRuntime()
            .then(() => setPyodideReady(true))
            .catch(() => {});
    }, []);

    // runs python code inside pyodide, redirecting stdout/stderr into a
    // string buffer and wiring python's input() to our own input queue
    async function runPython(src: string): Promise<string> {
        const py = await loadPyodideRuntime();
        window.__jsInput__ = requestInput;

        const result = await py.runPythonAsync(`
import sys, io, builtins, ast, traceback, js

_buf = io.StringIO()
sys.stdout = _buf
sys.stderr = _buf

async def _input(prompt=""):
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__
    val = await js.globalThis.__jsInput__(str(prompt))
    sys.stdout = _buf
    sys.stderr = _buf
    return str(val)

builtins.input = _input

_src = ${JSON.stringify(src)}

async def _run():
    ns = {"input": _input, "__name__": "__main__"}
    try:
        exec(compile(ast.parse(_src), "<code>", "exec"), ns)
    except SystemExit:
        pass
    except Exception:
        print(traceback.format_exc(), end="")

await _run()

sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
_buf.getvalue()
`);

        return (result as string) ?? "";
    }

    // runs javascript directly in the browser with a fake console object,
    // so log/error/warn output gets captured instead of going to devtools
    function runJavaScript(src: string): string {
        const output: string[] = [];
        const format = (...args: unknown[]) => args.map(String).join(" ");

        const customConsole = {
            log: (...args: unknown[]) => output.push(format(...args)),
            error: (...args: unknown[]) =>
                output.push("Error: " + format(...args)),
            warn: (...args: unknown[]) =>
                output.push("Warn: " + format(...args)),
            info: (...args: unknown[]) => output.push(format(...args)),
        };

        try {
            new Function("console", src)(customConsole);
        } catch (e) {
            output.push(
                `Runtime Error: ${e instanceof Error ? e.message : String(e)}`,
            );
        }

        return output.join("\n");
    }

    // Wandbox runs compiled/interpreted languages non-interactively, so we
    // can't prompt for input while the program runs -- instead this scans
    // the source for input-reading calls and guesses how many values to
    // collect from the user upfront, per language's typical input syntax
    function countInputCalls(src: string, lang: string): number {
        // strip comments out of the user's code first so commented-out
        // input calls don't get counted
        const stripped = src
            .replace(/\/\/[^\n]*/g, "")
            .replace(/\/\*[\s\S]*?\*\//g, "");

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
        if (lang === "python") {
            return (stripped.match(/\binput\s*\(/g) ?? []).length;
        }

        return (stripped.match(/\bprompt\s*\(/g) ?? []).length;
    }

    // asks the user for however many inputs the program appears to need,
    // then joins them into one stdin blob for Wandbox
    async function gatherStdin(src: string, lang: string): Promise<string> {
        const count = countInputCalls(src, lang);
        if (count === 0) return "";

        pushLine({
            type: "info",
            text: `program needs ${count} input${count > 1 ? "s" : ""} — enter them in order:`,
        });

        const values: string[] = [];
        for (let i = 0; i < count; i++) {
            const val = await requestInput(`[${i + 1}/${count}]`);
            values.push(val);
        }
        return values.join("\n");
    }

    // sends the code to the Wandbox proxy and returns its raw response
    async function callWandbox(
        proxy: string,
        compiler: string,
        options: string,
        src: string,
        stdin: string,
        filename?: string,
    ) {
        const body = filename
            ? {
                  compiler,
                  options,
                  stdin,
                  codes: [{ file: filename, code: src }],
              }
            : { compiler, options, stdin, code: src };

        const res = await fetch(proxy, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new Error(`Server error ${res.status}: ${await res.text()}`);
        return (await res.json()) as {
            program_output?: string;
            program_error?: string;
            error?: string;
        };
    }

    // runs any non-python, non-javascript language through Wandbox,
    // retrying once with a live-looked-up compiler if the preconfigured
    // one has gone stale
    async function runViaWandbox(src: string, lang: string): Promise<string> {
        if (lang === "kotlin" || lang === "java")
            throw new Error(
                `${lang} is not supported. Try a different language.`,
            );

        const proxy = process.env.NEXT_PUBLIC_WANDBOX_PROXY;
        if (!proxy)
            throw new Error(
                "NEXT_PUBLIC_WANDBOX_PROXY is not set. See wandbox-proxy.worker.js.",
            );

        const stdin = await gatherStdin(src, lang);
        const config = await resolveCompiler(lang, proxy);
        let data = await callWandbox(
            proxy,
            config.compiler,
            config.options ?? "",
            src,
            stdin,
            config.filename,
        );

        // preconfigured compiler name is no longer valid, fall back to
        // a fresh lookup and remember it for next time
        if (data.error?.includes("Unknown compiler")) {
            const realCompiler = await fallbackCompiler(lang, proxy);
            data = await callWandbox(
                proxy,
                realCompiler,
                config.options ?? "",
                src,
                stdin,
                config.filename,
            );
            PREFERRED_COMPILERS[lang] = { ...config, compiler: realCompiler };
        }

        if (data.error) throw new Error(data.error);
        return [data.program_output, data.program_error]
            .filter(Boolean)
            .join("\n")
            .trim();
    }

    // clears the terminal and routes to the right runner for the
    // current language, then reports the result or error as a new line
    async function handleRunCode() {
        setLines([]);
        inputQueue.current = [];
        setWaitingForInput(false);
        setIsLoading(true);
        pushLine({ type: "info", text: `▶ running ${language}…` });

        try {
            let output = "";

            if (language === "python") {
                output = await runPython(code);
            } else if (language === "javascript") {
                output = runJavaScript(code);
            } else {
                output = await runViaWandbox(code, language);
            }

            if (output.trim()) {
                pushLine({ type: "output", text: output });
            } else {
                pushLine({ type: "info", text: "exited with no output" });
            }
        } catch (err) {
            pushLine({
                type: "error",
                text: err instanceof Error ? err.message : String(err),
            });
        } finally {
            setIsLoading(false);
            setWaitingForInput(false);
        }
    }

    return {
        code,
        setCode,
        language,
        setLanguage: switchLanguage,
        lines,
        isLoading,
        waitingForInput,
        submitInput,
        handleRunCode,
        pyodideReady,
    };
}
