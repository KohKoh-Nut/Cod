// starter "hello world" style snippet shown when a language is selected
export const CODE_SAMPLES: Record<string, string> = {
    python: [
        "def greet(name: str) -> str:",
        '    return f"Hello, {name}!"',
        "",
        'print(greet("World"))',
    ].join("\n"),

    javascript: [
        "function greet(name) {",
        "  return `Hello, ${name}!`;",
        "}",
        "",
        'console.log(greet("World"));',
    ].join("\n"),

    typescript: [
        "function greet(name: string): string {",
        "  return `Hello, ${name}!`;",
        "}",
        "",
        'console.log(greet("World"));',
    ].join("\n"),

    c: [
        "#include <stdio.h>",
        "",
        "int main() {",
        '    printf("Hello, World!\\n");',
        "    return 0;",
        "}",
    ].join("\n"),

    cpp: [
        "#include <iostream>",
        "",
        "int main() {",
        '    std::cout << "Hello, World!" << std::endl;',
        "    return 0;",
        "}",
    ].join("\n"),

    rust: ["fn main() {", '    println!("Hello, World!");', "}"].join("\n"),

    java: [
        "public class Main {",
        "    public static void main(String[] args) {",
        '        System.out.println("Hello, World!");',
        "    }",
        "}",
    ].join("\n"),

    r: [
        "greet <- function(name) {",
        '  paste("Hello,", name)',
        "}",
        "",
        'cat(greet("World"), "\\n")',
    ].join("\n"),

    go: [
        "package main",
        "",
        'import "fmt"',
        "",
        "func main() {",
        '    fmt.Println("Hello, World!")',
        "}",
    ].join("\n"),

    swift: ['print("Hello, World!")'].join("\n"),

    php: ["<?php", 'echo "Hello, World!\\n";'].join("\n"),

    ruby: [
        "def greet(name)",
        '  "Hello, #{name}!"',
        "end",
        "",
        'puts greet("World")',
    ].join("\n"),

    scala: [
        "object HelloWorld {",
        "   def main(args: Array[String]): Unit = {",
        '       println("Hello, World!")',
        "   }",
        "}",
    ].join("\n"),

    perl: [
        "use strict;",
        "use warnings;",
        "",
        'print "Hello, World!\\n";',
    ].join("\n"),

    bash: [
        "#!/bin/bash",
        "greet() {",
        '  echo "Hello, $1!"',
        "}",
        "",
        'greet "World"',
    ].join("\n"),

    lua: [
        "local function greet(name)",
        '  return "Hello, " .. name .. "!"',
        "end",
        "",
        'print(greet("World"))',
    ].join("\n"),

    haskell: [
        "greet :: String -> String",
        'greet name = "Hello, " ++ name ++ "!"',
        "",
        "main :: IO ()",
        'main = putStrLn (greet "World")',
    ].join("\n"),

    kotlin: ["fun main() {", '    println("Hello, World!")', "}"].join("\n"),
};

// used when a language has no sample defined above
export const DEFAULT_CODE = "// No sample available for this language\n";

// gets the starter code for a language, falling back to the default message
export function getDefaultCode(language: string): string {
    return CODE_SAMPLES[language] ?? DEFAULT_CODE;
}

// python is the editor's default language on first load
export const INITIAL_PYTHON_CODE = CODE_SAMPLES.python;
