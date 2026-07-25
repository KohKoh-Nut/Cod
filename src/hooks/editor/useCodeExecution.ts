import { useState, useEffect, useCallback, useRef } from "react";

import { getDefaultCode } from "@/constants/codeSample";
import { countInputCalls } from "@/utils/inputDetection";

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

// python/js run in a dedicated worker instead of the main thread, so a
// user's infinite loop pegs the worker's thread instead of freezing the
// whole page. If a run doesn't finish within this window we assume it's
// stuck and terminate the worker to reclaim its memory.
const EXECUTION_TIMEOUT_MS = 15000;

type WorkerOutMessage =
    | { type: "pyodide-ready" }
    | { type: "input-request"; id: number; prompt: string }
    | { type: "result"; output: string }
    | { type: "error"; message: string };

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

    // the worker running python/js, created lazily and replaced whenever
    // it has to be terminated (e.g. after a timeout)
    const workerRef = useRef<Worker | null>(null);

    const getWorker = useCallback((): Worker => {
        if (workerRef.current) return workerRef.current;
        const worker = new Worker(
            new URL("../../workers/codeRunner.worker.ts", import.meta.url),
        );
        workerRef.current = worker;
        return worker;
    }, []);

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

    // start warming up pyodide in the worker as soon as the hook mounts,
    // so it's hopefully ready by the time the user first runs python code
    useEffect(() => {
        const worker = getWorker();

        const onMessage = (event: MessageEvent<WorkerOutMessage>) => {
            if (event.data.type === "pyodide-ready") setPyodideReady(true);
        };
        worker.addEventListener("message", onMessage);
        worker.postMessage({ type: "preload" });

        return () => {
            worker.removeEventListener("message", onMessage);
            worker.terminate();
            workerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // runs python or javascript inside the worker, wiring input prompts
    // back to the terminal and enforcing a hard timeout so a runaway
    // loop can't hang the tab
    const runInWorker = useCallback(
        (lang: "python" | "javascript", src: string): Promise<string> => {
            const worker = getWorker();

            return new Promise<string>((resolve, reject) => {
                let settled = false;

                const timeoutId = setTimeout(() => {
                    if (settled) return;
                    settled = true;
                    cleanup();
                    // the worker may still be stuck in the runaway loop --
                    // terminate it and let getWorker() spin up a fresh one
                    // (with pyodide reloaded) on the next run
                    worker.terminate();
                    workerRef.current = null;
                    setPyodideReady(false);
                    reject(
                        new Error(
                            "Execution timed out after 15s (possible infinite loop) — process terminated",
                        ),
                    );
                }, EXECUTION_TIMEOUT_MS);

                const onMessage = (event: MessageEvent<WorkerOutMessage>) => {
                    const msg = event.data;

                    if (msg.type === "input-request") {
                        requestInput(msg.prompt).then((value) => {
                            worker.postMessage({
                                type: "input-response",
                                id: msg.id,
                                value,
                            });
                        });
                        return;
                    }

                    if (msg.type === "result") {
                        if (settled) return;
                        settled = true;
                        cleanup();
                        resolve(msg.output);
                        return;
                    }

                    if (msg.type === "error") {
                        if (settled) return;
                        settled = true;
                        cleanup();
                        reject(new Error(msg.message));
                    }
                };

                const cleanup = () => {
                    clearTimeout(timeoutId);
                    worker.removeEventListener("message", onMessage);
                };

                worker.addEventListener("message", onMessage);
                worker.postMessage({ type: "run", lang, code: src });
            });
        },
        [getWorker, requestInput],
    );

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
        // ignore spam-clicks / re-triggers while a run is already in
        // flight, in addition to the run button being disabled in the UI
        if (isLoading) return;

        setLines([]);
        inputQueue.current = [];
        setWaitingForInput(false);
        setIsLoading(true);
        pushLine({ type: "info", text: `▶ running ${language}…` });

        try {
            let output = "";

            if (language === "python" || language === "javascript") {
                output = await runInWorker(language, code);
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
