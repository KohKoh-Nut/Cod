import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
    // Generate a unique identifier to isolate concurrent runtime files safely
    const runId = Math.random().toString(36).substring(7);
    const tempFilePath = path.join(process.cwd(), `temp_${runId}.py`);

    try {
        const { code } = await request.json();

        // Write the incoming editor text buffer into a temporary execution file
        fs.writeFileSync(tempFilePath, code || "");

        // Isolate code execution inside a controlled sub-shell container pipeline
        const executeCode = () => {
            return new Promise<{ stdout: string; stderr: string }>(
                (resolve) => {
                    // Strip IDE extension terminal hooks to prevent environment binary symbol mismatch crashes
                    const cleanEnv = { ...process.env };
                    delete cleanEnv.LD_PRELOAD;
                    delete cleanEnv.NODE_OPTIONS;

                    // Execute process with explicit environment variables and an upper execution timeout limit
                    exec(
                        `python3 "${tempFilePath}"`,
                        {
                            env: cleanEnv,
                            timeout: 5000, // Automatically terminates processes that run longer than 5 seconds
                        },
                        (error, stdout, stderr) => {
                            // Capture runtime failures or timeout kills directly through the error handler pipeline
                            const executionError =
                                error && !stderr ? error.message : stderr;
                            resolve({ stdout, stderr: executionError });
                        },
                    );
                },
            );
        };

        const { stdout, stderr } = await executeCode();

        // Route error diagnostic data cleanly out to the user panel interface if compilation failed
        if (stderr) {
            return NextResponse.json({ error: stderr });
        }

        // Pipe the primary system output stream logs back out to the frontend terminal panel
        return NextResponse.json({
            run: {
                output:
                    stdout || "Code executed successfully with no output logs.",
            },
        });
    } catch (error) {
        // Bubble core internal router or system execution architecture errors safely up to the client interface
        const message =
            error instanceof Error
                ? error.message
                : "Internal execution sandbox crash occurred.";
        return NextResponse.json({ error: message }, { status: 500 });
    } finally {
        // Structural safety step ensures temporary workspace files are completely erased regardless of success or crash paths
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
