import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        setupFiles: ["./test/setup.ts"],
        globals: true,
    },
    resolve: {
        alias: {
            // mirrors the "@/*" -> "src/*" path in tsconfig.json
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
