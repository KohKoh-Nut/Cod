import { describe, it, expect, afterEach, vi } from "vitest";

const ORIGINAL_ENV = process.env.NEXT_PUBLIC_BASE_PATH;

// BASE_PATH reads process.env at import time, so each test needs a
// fresh module load to see a different env value
async function loadBasePath() {
    const mod = await import("@/utils/basePath");
    return mod.BASE_PATH;
}

describe("BASE_PATH", () => {
    afterEach(() => {
        process.env.NEXT_PUBLIC_BASE_PATH = ORIGINAL_ENV;
        vi.resetModules();
    });

    it("falls back to /Cod when the env var isn't set", async () => {
        delete process.env.NEXT_PUBLIC_BASE_PATH;
        vi.resetModules();
        expect(await loadBasePath()).toBe("/Cod");
    });

    it("uses NEXT_PUBLIC_BASE_PATH when it's set", async () => {
        process.env.NEXT_PUBLIC_BASE_PATH = "/custom-path";
        vi.resetModules();
        expect(await loadBasePath()).toBe("/custom-path");
    });
});
