import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Text from "@/components/ui/Text";

describe("Text: rendering as different tags", () => {
    it("renders a paragraph type as a <p>", () => {
        render(<Text type="paragraph" label="hello" />);
        expect(screen.getByText("hello").tagName).toBe("P");
    });

    it("renders header level 1 as an <h1>", () => {
        render(<Text type="header" level={1} label="Title" />);
        expect(screen.getByText("Title").tagName).toBe("H1");
    });

    it("renders header level 2 as an <h2>", () => {
        render(<Text type="header" level={2} label="Subtitle" />);
        expect(screen.getByText("Subtitle").tagName).toBe("H2");
    });

    it("renders header level 3 as an <h3>", () => {
        render(<Text type="header" level={3} label="Small heading" />);
        expect(screen.getByText("Small heading").tagName).toBe("H3");
    });

    it("falls back to <p> when level is 'none' for a header type", () => {
        render(<Text type="header" level="none" label="Untyped header" />);
        expect(screen.getByText("Untyped header").tagName).toBe("P");
    });

    it("lets an explicit `as` prop override the default tag", () => {
        render(<Text type="paragraph" as="span" label="inline text" />);
        expect(screen.getByText("inline text").tagName).toBe("SPAN");
    });

    it("renders date type as a <time> element", () => {
        render(<Text type="date" label="2026-01-01" />);
        expect(screen.getByText("2026-01-01").tagName).toBe("TIME");
    });
});

describe("Text: url links", () => {
    it("renders an internal link as a navigable <a> with the right href", () => {
        render(<Text type="url" link="/friends" label="see friends" />);
        expect(screen.getByText("see friends").closest("a")).toHaveAttribute(
            "href",
            "/friends",
        );
    });

    it("does not open an internal link in a new tab", () => {
        render(<Text type="url" link="/friends" label="see friends" />);
        expect(
            screen.getByText("see friends").closest("a"),
        ).not.toHaveAttribute("target");
    });

    it("renders an external link with target=_blank and rel=noopener", () => {
        render(
            <Text
                type="url"
                link="https://example.com"
                label="external site"
            />,
        );
        const anchor = screen.getByText("external site").closest("a")!;
        expect(anchor).toHaveAttribute("href", "https://example.com");
        expect(anchor).toHaveAttribute("target", "_blank");
        expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("uses children over label when both are given", () => {
        render(
            <Text type="paragraph" label="label text">
                child text
            </Text>,
        );
        expect(screen.getByText("child text")).toBeInTheDocument();
        expect(screen.queryByText("label text")).not.toBeInTheDocument();
    });

    it("still renders as a plain tag (not a link) when `as` overrides a url type", () => {
        render(
            <Text type="url" as="span" link="/friends" label="see friends" />,
        );
        expect(screen.getByText("see friends").tagName).toBe("SPAN");
    });
});
