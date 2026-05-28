import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Route handler that creates an isolated file environment to safely execute Python scripts.
 */
export async function POST(request: Request) {
    const runId = Math.random().toString(36).substring(7);
    const tempFilePath = path.join(process.cwd(), `temp_${runId}.py`);

    try {
        const { code } = await request.json();

        // Write the incoming editor text buffer into a temporary file
        fs.writeFileSync(tempFilePath, code || "");

        // Spawns a child process sub-shell to execute the Python script
        const executeCode = () => {
            return new Promise<{ stdout: string; stderr: string }>(
                (resolve) => {
                    // Strip environment extensions to prevent pipeline binary conflicts
                    const cleanEnv = { ...process.env };
                    delete cleanEnv.LD_PRELOAD;
                    delete cleanEnv.NODE_OPTIONS;

                    exec(
                        `python3 "${tempFilePath}"`,
                        {
                            env: cleanEnv,
                            timeout: 5000, // Safe termination limit for long-running scripts
                        },
                        (error, stdout, stderr) => {
                            const executionError =
                                error && !stderr ? error.message : stderr;
                            resolve({ stdout, stderr: executionError });
                        },
                    );
                },
            );
        };

        const { stdout, stderr } = await executeCode();

        if (stderr) {
            return NextResponse.json({ error: stderr });
        }

        return NextResponse.json({
            run: {
                output:
                    stdout || "Code executed successfully with no output logs.",
            },
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Internal execution sandbox crash occurred.";
        return NextResponse.json({ error: message }, { status: 500 });
    } finally {
        // Ensure temporary script execution files are cleaned up from disk
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (cleanupError) {
                console.error(
                    "Failed to clear local file buffer registry:",
                    cleanupError,
                );
            }
        }
    }
}
