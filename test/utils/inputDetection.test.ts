import { describe, it, expect } from "vitest";
import { countInputCalls } from "@/utils/inputDetection";

describe("countInputCalls", () => {
    it("counts python input() calls", () => {
        const src = `name = input("name: ")\nage = input()\n`;
        expect(countInputCalls(src, "python")).toBe(2);
    });

    it("ignores commented-out python input() calls", () => {
        const src = `# name = input()\nage = input()\n`;
        expect(countInputCalls(src, "python")).toBe(1);
    });

    it("counts c scanf-style format specifiers", () => {
        const src = `scanf("%d %s", &n, s);`;
        expect(countInputCalls(src, "c")).toBe(2);
    });

    it("counts cpp cin >> chains as one value per >>", () => {
        const src = `int a, b;\ncin >> a >> b;`;
        expect(countInputCalls(src, "cpp")).toBe(2);
    });

    it("counts cpp getline calls separately from cin", () => {
        const src = `std::getline(std::cin, line);\ncin >> x;`;
        expect(countInputCalls(src, "cpp")).toBe(2);
    });

    it("counts java scanner methods", () => {
        const src = `int n = sc.nextInt();\nString s = sc.nextLine();`;
        expect(countInputCalls(src, "java")).toBe(2);
    });

    it("counts rust read_line calls", () => {
        const src = `io::stdin().read_line(&mut input).unwrap();`;
        expect(countInputCalls(src, "rust")).toBe(1);
    });

    it("returns 0 for code with no input calls", () => {
        const src = `print("hello world")`;
        expect(countInputCalls(src, "python")).toBe(0);
    });

    it("strips block comments before counting", () => {
        const src = `/* val = input() */\nval2 = input()`;
        expect(countInputCalls(src, "python")).toBe(1);
    });

    it("falls back to prompt() detection for unlisted languages", () => {
        const src = `let x = prompt("value?");`;
        expect(countInputCalls(src, "lua")).toBe(1);
    });
});

describe("countInputCalls: more edge cases", () => {
    it("counts multiple separate cin statements", () => {
        const src = `cin >> a;\ncin >> b >> c;`;
        expect(countInputCalls(src, "cpp")).toBe(3);
    });

    it("counts c scanf with a single specifier", () => {
        const src = `scanf("%d", &n);`;
        expect(countInputCalls(src, "c")).toBe(1);
    });

    it("counts java scanner calls mixed across lines", () => {
        const src = `int n = sc.nextInt();\ndouble d = sc.nextDouble();\nString s = sc.next();`;
        expect(countInputCalls(src, "java")).toBe(3);
    });

    it("counts multiple rust read_line calls", () => {
        const src = `stdin().read_line(&mut a).unwrap();\nstdin().read_line(&mut b).unwrap();`;
        expect(countInputCalls(src, "rust")).toBe(2);
    });

    it("returns 0 for prompt() fallback when there's no prompt call", () => {
        const src = `console.log("hello");`;
        expect(countInputCalls(src, "javascript")).toBe(0);
    });

    it("counts multiple prompt() calls for the generic fallback", () => {
        const src = `let a = prompt("a?");\nlet b = prompt("b?");`;
        expect(countInputCalls(src, "bash")).toBe(2);
    });

    it("returns 0 for an empty source string regardless of language", () => {
        expect(countInputCalls("", "python")).toBe(0);
        expect(countInputCalls("", "cpp")).toBe(0);
    });

    it("does not count getline or cin appearing inside a line comment", () => {
        const src = `// cin >> x;\nint y; cin >> y;`;
        expect(countInputCalls(src, "cpp")).toBe(1);
    });
});
