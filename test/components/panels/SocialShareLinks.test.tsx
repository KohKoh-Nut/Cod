import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SocialShareLinks from "@/components/panels/SocialShareLinks";

describe("SocialShareLinks", () => {
    const shareUrl = "https://example.com/s/abc123";

    it("renders a link for every supported platform", () => {
        render(<SocialShareLinks shareUrl={shareUrl} />);
        for (const name of ["X / Twitter", "Facebook", "LinkedIn", "Reddit", "Telegram", "WhatsApp"]) {
            expect(screen.getByText(name)).toBeInTheDocument();
        }
    });

    it("every link opens in a new tab safely", () => {
        render(<SocialShareLinks shareUrl={shareUrl} />);
        for (const name of ["X / Twitter", "Facebook", "LinkedIn", "Reddit", "Telegram", "WhatsApp"]) {
            const link = screen.getByText(name).closest("a")!;
            expect(link).toHaveAttribute("target", "_blank");
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        }
    });

    it("url-encodes the share link in every platform's href", () => {
        render(<SocialShareLinks shareUrl={shareUrl} />);
        const encoded = encodeURIComponent(shareUrl);
        for (const name of ["X / Twitter", "Facebook", "LinkedIn", "Reddit", "Telegram"]) {
            const link = screen.getByText(name).closest("a")!;
            expect(link.getAttribute("href")).toContain(encoded);
        }
    });

    it("uses the default message when none is given", () => {
        render(<SocialShareLinks shareUrl={shareUrl} />);
        const twitterLink = screen.getByText("X / Twitter").closest("a")!;
        expect(twitterLink.getAttribute("href")).toContain(
            encodeURIComponent("Check out this code snippet on Cod!"),
        );
    });

    it("uses a custom message when one is given", () => {
        render(<SocialShareLinks shareUrl={shareUrl} message="Look what I made!" />);
        const twitterLink = screen.getByText("X / Twitter").closest("a")!;
        expect(twitterLink.getAttribute("href")).toContain(
            encodeURIComponent("Look what I made!"),
        );
    });

    it("points WhatsApp's link at the wa.me share format", () => {
        render(<SocialShareLinks shareUrl={shareUrl} />);
        const link = screen.getByText("WhatsApp").closest("a")!;
        expect(link.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/\?text=/);
    });

    it("points Facebook's link at its sharer endpoint with just the url", () => {
        render(<SocialShareLinks shareUrl={shareUrl} />);
        const link = screen.getByText("Facebook").closest("a")!;
        expect(link.getAttribute("href")).toBe(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        );
    });
});
