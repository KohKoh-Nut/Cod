import { useState, useEffect, useCallback, useRef } from "react";
import { getDefaultCode } from "@/constants/codeSample";

export const SUPPORTED_LANGUAGES = [
  "python", "javascript", "typescript",
  "c", "cpp", "rust", "r",
  "go", "ruby", "php", "scala", "perl",
  "bash", "lua", "haskell",
];

// Minimal Pyodide surface we actually use
interface Pyodide {
  globals: { set: (key: string, value: unknown) => void };
  toPy: (value: unknown) => unknown;
  runPythonAsync: (code: string, options?: { globals?: unknown }) => Promise<unknown>;
  pyimport: (mod: string) => unknown;
}

declare global {
  interface Window {
    pyodide?: Pyodide;
    loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide>;
    // Bridge so Python's input() can call back into JS
    __jsInput__?: (prompt: string) => Promise<string>;
  }
}

export type TerminalLine =
  | { type: "output"; text: string }
  | { type: "error"; text: string }
  | { type: "input"; text: string } // echoed user input
  | { type: "info"; text: string };

// Wandbox compiler config — used by the /api/execute proxy route
// Preferred compiler per language — these are tried first.
// If Wandbox doesn't recognise one, resolveCompiler() finds the real name from /runtimes.
// Exact compiler names from wandbox.org/api/list.json
// Check /debug-compilers?lang=X on your worker to find updated names if one breaks.
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

// Maps Wandbox "language" field to our language keys
const LANGUAGE_ALIASES: Record<string, string> = {
  "C":          "c",
  "C++":        "cpp",
  "Java":       "java",
  "Rust":       "rust",
  "Go":         "go",
  "Ruby":       "ruby",
  "PHP":        "php",
  "Scala":      "scala",
  "Perl":       "perl",
  "Bash script":"bash",
  "Lua":        "lua",
  "Haskell":    "haskell",
  "Python":     "python",
  "R":          "r",
  "Kotlin":     "kotlin",
  "JavaScript": "javascript",
  "TypeScript": "typescript",
};

// Cached runtime list — fetched once, then reused
let runtimeCache: Array<{ name: string; language: string }> | null = null;

async function getRuntimes(proxy: string): Promise<Array<{ name: string; language: string }>> {
  if (runtimeCache) return runtimeCache;
  const res = await fetch(`${proxy}/runtimes`);
  if (!res.ok) throw new Error(`Could not fetch runtimes: ${res.status}`);
  runtimeCache = await res.json() as Array<{ name: string; language: string }>;
  return runtimeCache;
}

// Returns the correct compiler name for a language, falling back to live lookup
async function resolveCompiler(lang: string, proxy: string): Promise<{ compiler: string; options?: string; filename?: string }> {
  const preferred = PREFERRED_COMPILERS[lang];
  if (!preferred) throw new Error(`No compiler configured for: ${lang}`);

  // Try the preferred name first — if Wandbox knows it we're done
  // (we find out on first failed call, then cache the real name)
  return preferred;
}

// After a 500 "Unknown compiler", call this to find a working name from the runtime list
async function fallbackCompiler(lang: string, proxy: string): Promise<string> {
  const runtimes = await getRuntimes(proxy);
  const alias = Object.entries(LANGUAGE_ALIASES).find(([, v]) => v === lang)?.[0];
  const match = runtimes.find(r => r.language === alias || r.language === lang);
  if (!match) throw new Error(`No compiler found for ${lang} in Wandbox runtime list`);
  return match.name;
}

// Pyodide is heavy (~10MB), so we load it once and reuse the same instance.
// The promise prevents a second load if the hook mounts while the first is still in flight.
let pyodide: Pyodide | null = null;
let loadingPyodide: Promise<Pyodide> | null = null;

async function loadPyodide(): Promise<Pyodide> {
  if (pyodide) return pyodide;
  if (loadingPyodide) return loadingPyodide;

  loadingPyodide = (async () => {
    // The script tag may already be present (added via next/script in _app or layout)
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector('script[src*="pyodide.js"]') as HTMLScriptElement | null;

        if (existing) {
          // Tag exists but hasn't finished loading yet
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject(new Error("Pyodide script failed to load")));
          return;
        }

        // No tag — inject one ourselves
        const tag = document.createElement("script");
        tag.src = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
        tag.onload = () => resolve();
        tag.onerror = () => reject(new Error("Pyodide script failed to load"));
        document.head.appendChild(tag);
      });
    }

    if (!window.loadPyodide) throw new Error("loadPyodide not found after script load");

    pyodide = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/" });
    window.pyodide = pyodide;
    return pyodide;
  })();

  return loadingPyodide;
}

export function useCodeExecution(initialCode: string) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState("python");

  // When the user picks a different language, swap in its starter code
  // so the editor isn't left showing Python syntax for a Rust file
  function switchLanguage(lang: string) {
    setLanguage(lang);
    setCode(getDefaultCode(lang));
  }
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);

  // Queue of pending resolvers — one per blocked input() call.
  // submitInput() shifts the next one off and resolves it with whatever the user typed.
  const inputQueue = useRef<Array<(value: string) => void>>([]);

  function pushLine(line: TerminalLine) {
    setLines(prev => [...prev, line]);
  }

  // Called by CodeOutput when the user hits Enter in the terminal prompt
  function submitInput(value: string) {
    pushLine({ type: "input", text: value });
    const next = inputQueue.current.shift();
    if (next) next(value);
    if (inputQueue.current.length === 0) setWaitingForInput(false);
  }

  // Passed to Python as builtins.input — pauses execution until submitInput() is called
  const requestInput = useCallback((prompt: string): Promise<string> => {
    if (prompt) pushLine({ type: "output", text: prompt });
    setWaitingForInput(true);
    return new Promise(resolve => {
      inputQueue.current.push(resolve);
    });
  // pushLine changes identity every render so we exclude it intentionally —
  // requestInput only needs the ref and the state setter, both stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start loading Pyodide in the background so it's ready before the user hits Run
  useEffect(() => {
    loadPyodide()
      .then(() => setPyodideReady(true))
      .catch(() => {}); // error surfaces on first Run attempt instead
  }, []);

  async function runPython(src: string): Promise<string> {
    const py = await loadPyodide();

    // Expose our JS input handler so Python can reach it
    window.__jsInput__ = requestInput;

    // Everything stays in Python-land — io.StringIO captures all stdout/stderr,
    // and _buf.getvalue() as the final expression is what Pyodide hands back to JS.
    // We temporarily swap stdout back to real when input() fires so the prompt
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

    // Shadow console so print-style debugging works the same as in Node
    const console = {
      log:   (...args: unknown[]) => output.push(fmt(...args)),
      error: (...args: unknown[]) => output.push("Error: " + fmt(...args)),
      warn:  (...args: unknown[]) => output.push("Warn: "  + fmt(...args)),
      info:  (...args: unknown[]) => output.push(fmt(...args)),
    };

    try {
      // eslint-disable-next-line no-new-func
      new Function("console", src)(console);
    } catch (e) {
      output.push(`Runtime Error: ${e instanceof Error ? e.message : String(e)}`);
    }

    return output.join("\n");
  }

  // Wandbox runs code in one shot — no interactive stdin mid-execution.
  // We scan the source to count how many input values the program needs,
  // ask the user for each one upfront, then send them all as a single stdin block.
  function countInputCalls(src: string, lang: string): number {
    // Strip single-line comments so we don't count inputs in commented code
    const stripped = src.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

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
      // Count scanf format specifiers like %d, %s, %f
      return (stripped.match(/%[diouxXeEfgGcs]/g) ?? []).length;
    }

    if (lang === "java") {
      return (stripped.match(/\.(nextLine|nextInt|nextDouble|nextFloat|nextLong|next)\s*\(/g) ?? []).length;
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

    pushLine({ type: "info", text: `program needs ${count} input${count > 1 ? "s" : ""} — enter them in order:` });

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
    filename?: string
  ) {
    // Wandbox needs the filename to match the public class name for Java
    const body = filename
      ? { compiler, options, stdin, codes: [{ file: filename, code: src }] }
      : { compiler, options, stdin, code: src };

    const res = await fetch(proxy, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Server error ${res.status}: ${await res.text()}`);
    return await res.json() as { program_output?: string; program_error?: string; error?: string };
  }

  async function runViaWandbox(src: string, lang: string): Promise<string> {
    if (lang === "kotlin" || lang === "java") throw new Error(`${lang} is not supported. Try a different language.`);

    const proxy = process.env.NEXT_PUBLIC_WANDBOX_PROXY;
    if (!proxy) throw new Error("NEXT_PUBLIC_WANDBOX_PROXY is not set. See wandbox-proxy.worker.js.");

    const stdin = await gatherStdin(src, lang);
    const config = await resolveCompiler(lang, proxy);
    let data = await callWandbox(proxy, config.compiler, config.options ?? "", src, stdin, config.filename);

    // Auto-fallback if the compiler name is outdated
    if (data.error?.includes("Unknown compiler")) {
      const realCompiler = await fallbackCompiler(lang, proxy);
      data = await callWandbox(proxy, realCompiler, config.options ?? "", src, stdin, config.filename);
      PREFERRED_COMPILERS[lang] = { ...config, compiler: realCompiler };
    }

    if (data.error) throw new Error(data.error);
    return [data.program_output, data.program_error].filter(Boolean).join("\n").trim();
  }

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
      pushLine({ type: "error", text: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsLoading(false);
      setWaitingForInput(false);
    }
  }

  return {
    code, setCode,
    language, setLanguage: switchLanguage,
    lines,
    isLoading,
    waitingForInput,
    submitInput,
    handleRunCode,
    pyodideReady,
  };
}