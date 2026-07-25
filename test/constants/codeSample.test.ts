import { describe, it, expect } from "vitest";
import {
    CODE_SAMPLES,
    DEFAULT_CODE,
    INITIAL_PYTHON_CODE,
    getDefaultCode,
} from "@/constants/codeSample";
import { SUPPORTED_LANGUAGES } from "@/hooks/editor/useCodeExecution";

describe("getDefaultCode", () => {
    it("returns the matching sample for a known language", () => {
        expect(getDefaultCode("python")).toBe(CODE_SAMPLES.python);
        expect(getDefaultCode("rust")).toBe(CODE_SAMPLES.rust);
    });

    it("falls back to DEFAULT_CODE for an unknown language", () => {
        expect(getDefaultCode("brainfuck")).toBe(DEFAULT_CODE);
    });

    it("falls back to DEFAULT_CODE for an empty language string", () => {
        expect(getDefaultCode("")).toBe(DEFAULT_CODE);
    });

    it("every language the editor lists has a sample defined", () => {
        // catches someone adding a language to the dropdown without
        // adding a matching starter snippet
        for (const lang of SUPPORTED_LANGUAGES) {
            expect(getDefaultCode(lang)).not.toBe(DEFAULT_CODE);
        }
    });
});

describe("CODE_SAMPLES", () => {
    it("every sample is non-empty", () => {
        for (const [lang, code] of Object.entries(CODE_SAMPLES)) {
            expect(code.trim().length, `${lang} sample should not be empty`).toBeGreaterThan(0);
        }
    });

    it("python sample is used as the initial code", () => {
        expect(INITIAL_PYTHON_CODE).toBe(CODE_SAMPLES.python);
    });

    it("python sample prints a greeting", () => {
        expect(CODE_SAMPLES.python).toContain("Hello");
    });
});
