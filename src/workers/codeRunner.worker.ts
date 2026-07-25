// Runs python (via pyodide) and javascript off the main thread. Doing
// this in a worker means a user's infinite loop only pegs this worker's
// thread -- the page stays responsive, and the main thread can recover
// by calling worker.terminate(), which also frees whatever memory the
// runaway code was using. See useCodeExecution.ts for the caller side.
//
// This file avoids relying on the ambient "webworker" lib types (the
// app's tsconfig has "dom" in its lib list, and dom + webworker both
// declare a global `self` -- mixing them in one program causes a type
// conflict). Instead we declare just the bits of the worker global
// scope we actually use, and cast `self` to that once at the top.

interface Pyodide {
    globals: { set: (key: string, value: unknown) => void };
    runPythonAsync: (
        code: string,
        options?: { globals?: unknown },
    ) => Promise<unknown>;
}

interface WorkerContext {
    postMessage: (message: OutMessage) => void;
    onmessage: ((event: MessageEvent<InMessage>) => void) | null;
    importScripts: (...urls: string[]) => void;
    loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide>;
    __jsInput__?: (prompt: string) => Promise<string>;
}

// `self` at runtime is the worker's global scope; this cast just gives
// it the shape we need without touching the ambient `self` type
const ctx = self as unknown as WorkerContext;

type InMessage =
    | { type: "preload" }
    | { type: "run"; lang: "python" | "javascript"; code: string }
    | { type: "input-response"; id: number; value: string };

type OutMessage =
    | { type: "pyodide-ready" }
    | { type: "input-request"; id: number; prompt: string }
    | { type: "result"; output: string }
    | { type: "error"; message: string };

let pyodideInstance: Pyodide | null = null;
let pyodideLoaderPromise: Promise<Pyodide> | null = null;

// resolvers waiting on the main thread's reply to an input-request
let nextInputId = 0;
const pendingInputs = new Map<number, (value: string) => void>();

async function loadPyodideRuntime(): Promise<Pyodide> {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoaderPromise) return pyodideLoaderPromise;

    pyodideLoaderPromise = (async () => {
        ctx.importScripts(
            "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js",
        );
        if (!ctx.loadPyodide)
            throw new Error("loadPyodide not found after script load");

        pyodideInstance = await ctx.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
        });
        return pyodideInstance;
    })();

    return pyodideLoaderPromise;
}

// asks the main thread for a line of input and waits for its reply
function requestInput(prompt: string): Promise<string> {
    const id = nextInputId++;
    const message: OutMessage = { type: "input-request", id, prompt };
    ctx.postMessage(message);
    return new Promise((resolve) => {
        pendingInputs.set(id, resolve);
    });
}

async function runPython(src: string): Promise<string> {
    const py = await loadPyodideRuntime();
    ctx.__jsInput__ = requestInput;

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

// runs javascript with a fake console object, so log/error/warn output
// gets captured instead of going to devtools
function runJavaScript(src: string): string {
    const output: string[] = [];
    const format = (...args: unknown[]) => args.map(String).join(" ");

    const customConsole = {
        log: (...args: unknown[]) => output.push(format(...args)),
        error: (...args: unknown[]) => output.push("Error: " + format(...args)),
        warn: (...args: unknown[]) => output.push("Warn: " + format(...args)),
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

ctx.onmessage = async (event: MessageEvent<InMessage>) => {
    const msg = event.data;

    if (msg.type === "input-response") {
        const resolve = pendingInputs.get(msg.id);
        if (resolve) {
            pendingInputs.delete(msg.id);
            resolve(msg.value);
        }
        return;
    }

    if (msg.type === "preload") {
        loadPyodideRuntime()
            .then(() => ctx.postMessage({ type: "pyodide-ready" }))
            .catch(() => {});
        return;
    }

    if (msg.type === "run") {
        try {
            const output =
                msg.lang === "python"
                    ? await runPython(msg.code)
                    : runJavaScript(msg.code);
            ctx.postMessage({ type: "result", output });
        } catch (err) {
            ctx.postMessage({
                type: "error",
                message: err instanceof Error ? err.message : String(err),
            });
        }
    }
};
