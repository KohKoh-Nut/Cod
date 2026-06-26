import { useState, useEffect, useCallback, useRef } from "react";
import { getDefaultCode } from "@/constants/codeSample";

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

interface Pyodide {
    globals: { set: (key: string, value: unknown) => void };
    toPy: (value: unknown) => unknown;
    runPythonAsync: (
        code: string,
        options?: { globals?: unknown },
    ) => Promise<unknown>;
    pyimport: (mod: string) => unknown;
}

declare global {
    interface Window {
        pyodide?: Pyodide;
        loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide>;
        __jsInput__?: (prompt: string) => Promise<string>;
    }
}

export type TerminalLine =
    | { type: "output"; text: string }
    | { type: "error"; text: string }
    | { type: "input"; text: string }
    | { type: "info"; text: string };

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

async function resolveCompiler(
    lang: string,
    proxy: string,
): Promise<{ compiler: string; options?: string; filename?: string }> {
    const preferred = PREFERRED_COMPILERS[lang];
    if (!preferred) throw new Error(`No compiler configured for: ${lang}`);
    return preferred;
}

// Fallback search when a specific compiler version fails
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

let pyodideInstance: Pyodide | null = null;
let pyodideLoaderPromise: Promise<Pyodide> | null = null;

// Inject script and load local webassembly Python runtime
async function loadPyodideRuntime(): Promise<Pyodide> {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoaderPromise) return pyodideLoaderPromise;

    pyodideLoaderPromise = (async () => {
        if (!window.loadPyodide) {
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

export function useCodeExecution(initialCode: string) {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState("python");
    const [lines, setLines] = useState<TerminalLine[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pyodideReady, setPyodideReady] = useState(false);
    const [waitingForInput, setWaitingForInput] = useState(false);

    const inputQueue = useRef<Array<(value: string) => void>>([]);

    const switchLanguage = (lang: string) => {
        setLanguage(lang);
        setCode(getDefaultCode(lang));
    };

    const pushLine = (line: TerminalLine) => {
        setLines((prev) => [...prev, line]);
    };

    // Process user input from the custom terminal UI prompt
    const submitInput = (value: string) => {
        pushLine({ type: "input", text: value });
        const nextResolver = inputQueue.current.shift();
        if (nextResolver) nextResolver(value);
        if (inputQueue.current.length === 0) setWaitingForInput(false);
    };

    // Synchronize standard interactive input stream lines
    const requestInput = useCallback((prompt: string): Promise<string> => {
        if (prompt) pushLine({ type: "output", text: prompt });
        setWaitingForInput(true);
        return new Promise((resolve) => {
            inputQueue.current.push(resolve);
        });
    }, []);

    // Pre-load python assets on component mount
    useEffect(() => {
        loadPyodideRuntime()
            .then(() => setPyodideReady(true))
            .catch(() => {});
    }, []);

    // Run python script in-browser capturing standard outputs
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

    // Evaluate JavaScript strings locally with scoped context console tracking
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

    // Count text calls to prompt pre-emptive batch user requests
    function countInputCalls(src: string, lang: string): number {
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

    // Gather required standard interactive data lines before running third-party proxies
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

    // Process compiled execution tasks remotely
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

    // Entry action to resolve target engines and capture output
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
