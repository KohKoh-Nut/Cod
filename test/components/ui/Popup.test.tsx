import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Popup from "@/components/ui/Popup";

describe("Popup", () => {
    it("renders nothing when closed", () => {
        render(
            <Popup isOpen={false} onClose={() => {}}>
                content
            </Popup>,
        );
        expect(screen.queryByText("content")).not.toBeInTheDocument();
    });

    it("renders its children when open", () => {
        render(
            <Popup isOpen onClose={() => {}}>
                content
            </Popup>,
        );
        expect(screen.getByText("content")).toBeInTheDocument();
    });

    it("calls onClose when the close button is clicked", async () => {
        const onClose = vi.fn();
        render(
            <Popup isOpen onClose={onClose}>
                content
            </Popup>,
        );

        await userEvent.click(screen.getByRole("button", { name: "Close panel" }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("shows a title when given one", () => {
        render(
            <Popup isOpen onClose={() => {}} title="Share this code">
                content
            </Popup>,
        );
        expect(screen.getByText("Share this code")).toBeInTheDocument();
    });

    it("shows a description when given one", () => {
        render(
            <Popup isOpen onClose={() => {}} description="Anyone with the link can view it">
                content
            </Popup>,
        );
        expect(screen.getByText("Anyone with the link can view it")).toBeInTheDocument();
    });

    it("omits the header block entirely when neither title nor description is given", () => {
        render(
            <Popup isOpen onClose={() => {}}>
                content
            </Popup>,
        );
        expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("defaults to the md max-width class", () => {
        const { container } = render(
            <Popup isOpen onClose={() => {}}>
                content
            </Popup>,
        );
        expect(container.querySelector(".max-w-md")).toBeInTheDocument();
    });

    it("applies a custom max-width when given one", () => {
        const { container } = render(
            <Popup isOpen onClose={() => {}} maxWidth="xl">
                content
            </Popup>,
        );
        expect(container.querySelector(".max-w-xl")).toBeInTheDocument();
    });
});
