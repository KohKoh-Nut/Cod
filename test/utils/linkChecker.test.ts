import { describe, it, expect } from "vitest";
import { isExternalLink } from "@/utils/linkChecker";

describe("isExternalLink", () => {
    it("treats http links as external", () => {
        expect(isExternalLink("http://example.com")).toBe(true);
    });

    it("treats https links as external", () => {
        expect(isExternalLink("https://example.com/page")).toBe(true);
    });

    it("treats protocol-relative links as external", () => {
        expect(isExternalLink("//example.com")).toBe(true);
    });

    it("treats a bare domain with no protocol as internal", () => {
        // no leading http(s):// or // means we don't treat it as a link
        // to navigate away from the app
        expect(isExternalLink("example.com")).toBe(false);
    });

    it("treats root-relative paths as internal", () => {
        expect(isExternalLink("/friends")).toBe(false);
    });

    it("treats nested root-relative paths as internal", () => {
        expect(isExternalLink("/editor/settings")).toBe(false);
    });

    it("treats relative paths as internal", () => {
        expect(isExternalLink("settings")).toBe(false);
    });

    it("treats an empty string as internal", () => {
        expect(isExternalLink("")).toBe(false);
    });

    it("treats a hash link as internal", () => {
        expect(isExternalLink("#section")).toBe(false);
    });
});
