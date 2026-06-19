import { useState, useEffect, useCallback, useRef } from "react";
import { getDefaultCode } from "@/constants/codeSample";

export const SUPPORTED_LANGUAGES = [
    "python",
    "javascript",
    "typescript",
    "c",
    "cpp",
    "rust",
    "java",
    "r",
    "go",
    "ruby",
    "php",
    "scala",
    "perl",
    "bash",
    "lua",
    "haskell",
    "kotlin",
];

// Minimal Pyodide surface we actually use
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
        // bridge so Python's input() can call back into JS
        __jsInput__?: (prompt: string) => Promise<string>;
    }
}

export type TerminalLine =
    | { type: "output"; text: string }
    | { type: "error"; text: string }
    | { type: "input"; text: string } // echoed user input
    | { type: "info"; text: string };

// Wandbox compiler config -- used by the /api/execute proxy route
const WANDBOX_COMPILERS: Record<
    string,
    { compiler: string; options?: string }
> = {
    typescript: { compiler: "typescript-5.2.2" },
    c: { compiler: "gcc-head", options: "-std=c17" },
    cpp: { compiler: "gcc-head", options: "-std=c++20" },
    rust: { compiler: "rust-head" },
    java: { compiler: "openjdk-head" },
    r: { compiler: "r-4.3.1" },
    go: { compiler: "go-head" },
    ruby: { compiler: "ruby-head" },
    php: { compiler: "php-head" },
    scala: { compiler: "scala-3.3.0" },
    perl: { compiler: "perl-head" },
    bash: { compiler: "bash" },
    lua: { compiler: "lua-5.4.4" },
    haskell: { compiler: "ghc-head" },
    kotlin: { compiler: "kotlin-1.9.0" },
};

// Pyodide is heavy (~10MB), so we load it once and reuse the same instance.
// The promise prevents a second load if the hook mounts while the first is still in flight.
let pyodideInstance: Pyodide | null = null;
let pyodideLoading: Promise<Pyodide> | null = null;

async function getPyodide(): Promise<Pyodide> {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoading) return pyodideLoading;

    pyodideLoading = (async () => {
        // the script tag may already be present (added via next/script in _app or layout)
        if (!window.loadPyodide) {
            await new Promise<void>((resolve, reject) => {
                const existing = document.querySelector(
                    'script[src*="pyodide.js"]',
                ) as HTMLScriptElement | null;

                if (existing) {
                    // tag exists but hasn't finished loading yet
                    existing.addEventListener("load", () => resolve());
                    existing.addEventListener("error", () =>
                        reject(new Error("Pyodide script failed to load")),
                    );
                    return;
                }

                // no tag -- inject one
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

    return pyodideLoading;
}

export function useCodeExecution(initialCode: string) {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState("python");

    // when the user picks a different language, swap in its starter code
    // so the editor isn't left showing Python syntax for a Rust file
    function switchLanguage(lang: string) {
        setLanguage(lang);
        setCode(getDefaultCode(lang));
    }

    const [lines, setLines] = useState<TerminalLine[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pyodideReady, setPyodideReady] = useState(false);
    const [waitingForInput, setWaitingForInput] = useState(false);

    // queue of pending resolvers -- one per blocked input() call.
    // submitInput() shifts the next one off and resolves it with whatever the user typed.
    const inputQueue = useRef<Array<(value: string) => void>>([]);

    function pushLine(line: TerminalLine) {
        setLines((prev) => [...prev, line]);
    }

    // called by CodeOutput when the user hits Enter in the terminal prompt
    function submitInput(value: string) {
        pushLine({ type: "input", text: value });
        const next = inputQueue.current.shift();
        if (next) next(value);
        if (inputQueue.current.length === 0) setWaitingForInput(false);
    }

    // passed to Python as builtins.input -- pauses execution until submitInput() is called
    const requestInput = useCallback((prompt: string): Promise<string> => {
        if (prompt) pushLine({ type: "output", text: prompt });
        setWaitingForInput(true);
        return new Promise((resolve) => {
            inputQueue.current.push(resolve);
        });
        // pushLine changes identity every render so we exclude it intentionally --
        // requestInput only needs the ref and the state setter, both stable
    }, []);

    // start loading Pyodide in the background so it's ready before the user hits Run
    useEffect(() => {
        getPyodide()
            .then(() => setPyodideReady(true))
            .catch(() => {}); // error surfaces on first Run attempt instead
    }, []);

    async function runPython(src: string): Promise<string> {
        const py = await getPyodide();

        // expose our JS input handler so Python can reach it
        window.__jsInput__ = requestInput;

        // everything stays in Python-land -- io.StringIO captures all stdout/stderr,
        // and _buf.getvalue() as the final expression is what Pyodide hands back to JS.
        // we temporarily swap stdout back to real when input() fires so the prompt
        // doesn't get swallowed into the buffer twice.
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

    function runJavaScript(src: string): string {
        const output: string[] = [];
        const fmt = (...args: unknown[]) => args.map(String).join(" ");

        // shadow console so print-style debugging works the same as in Node
        const console = {
            log: (...args: unknown[]) => output.push(fmt(...args)),
            error: (...args: unknown[]) =>
                output.push("Error: " + fmt(...args)),
            warn: (...args: unknown[]) => output.push("Warn: " + fmt(...args)),
            info: (...args: unknown[]) => output.push(fmt(...args)),
        };

        try {
            new Function("console", src)(console);
        } catch (e) {
            output.push(
                `Runtime Error: ${e instanceof Error ? e.message : String(e)}`,
            );
        }

        return output.join("\n");
    }

    // Wandbox runs code in one shot -- no interactive stdin mid-execution.
    // we scan the source to count how many input values the program needs,
    // ask the user for each one upfront, then send them all as a single stdin block.
    function countInputCalls(src: string, lang: string): number {
        // strip single-line comments so we don't count inputs in commented code
        const stripped = src
            .replace(/\/\/[^\n]*/g, "")
            .replace(/\/\*[\s\S]*?\*\//g, "");

        if (lang === "cpp" || lang === "c++") {
            let count = 0;
            for (const line of stripped.split("\n")) {
                const t = line.trim();
                if (/\bgetline\s*\(/.test(t)) {
                    // getline(cin, var) = 1 read per call
                    count += (t.match(/\bgetline\s*\(/g) ?? []).length;
                } else if (/\bcin\b/.test(t)) {
                    // cin >> a >> b = 2 reads, count each >>
                    count += (t.match(/>>/g) ?? []).length;
                }
            }
            return count;
        }

        if (lang === "c") {
            // count scanf format specifiers like %d, %s, %f
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

        // javascript / typescript use prompt()
        return (stripped.match(/\bprompt\s*\(/g) ?? []).length;
    }

    async function gatherStdin(src: string, lang: string): Promise<string> {
        const count = countInputCalls(src, lang);
        if (count === 0) return "";

        pushLine({
            type: "info",
            text: `program needs ${count} input${count > 1 ? "s" : ""} -- enter them in order:`,
        });

        const values: string[] = [];
        for (let i = 0; i < count; i++) {
            const val = await requestInput(`[${i + 1}/${count}]`);
            values.push(val);
        }
        return values.join("\n");
    }

    async function runViaWandbox(src: string, lang: string): Promise<string> {
        const config = WANDBOX_COMPILERS[lang];
        if (!config) throw new Error(`No compiler configured for: ${lang}`);

        // gather stdin upfront since Wandbox doesn't support interactive input
        const stdin = await gatherStdin(src, lang);

        const proxy = process.env.NEXT_PUBLIC_WANDBOX_PROXY;
        if (!proxy)
            throw new Error(
                "NEXT_PUBLIC_WANDBOX_PROXY is not set. See wandbox-proxy.worker.js.",
            );

        const res = await fetch(proxy, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: src,
                compiler: config.compiler,
                options: config.options ?? "",
                stdin,
            }),
        });

        if (!res.ok)
            throw new Error(`Server error ${res.status}: ${await res.text()}`);

        const data = (await res.json()) as {
            program_output?: string;
            program_error?: string;
            error?: string;
        };

        if (data.error) throw new Error(data.error);

        return [data.program_output, data.program_error]
            .filter(Boolean)
            .join("\n")
            .trim();
    }

    async function handleRunCode() {
        setLines([]);
        inputQueue.current = [];
        setWaitingForInput(false);
        setIsLoading(true);
        pushLine({ type: "info", text: `running ${language}...` });

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
