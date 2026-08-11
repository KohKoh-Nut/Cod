import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "@/components/ui/Button";

describe("Button: click behavior", () => {
    it("calls onClick when enabled", async () => {
        const onClick = vi.fn();
        render(<Button label="run" onClick={onClick} />);

        await userEvent.click(screen.getByRole("button", { name: "run" }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
        const onClick = vi.fn();
        render(<Button label="running..." onClick={onClick} disabled />);

        const button = screen.getByRole("button", { name: "running..." });
        expect(button).toBeDisabled();

        await userEvent.click(button);

        expect(onClick).not.toHaveBeenCalled();
    });

    it("ignores rapid repeated clicks once disabled mid-run", async () => {
        // mirrors page.tsx switching the run button to disabled via isLoading
        const onClick = vi.fn();
        const { rerender } = render(
            <Button label="run" onClick={onClick} disabled={false} />,
        );

        const button = screen.getByRole("button", { name: "run" });
        await userEvent.click(button);
        rerender(<Button label="running..." onClick={onClick} disabled />);

        await userEvent.click(
            screen.getByRole("button", { name: "running..." }),
        );
        await userEvent.click(
            screen.getByRole("button", { name: "running..." }),
        );

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("fires onMouseEnter and onMouseLeave", async () => {
        const onMouseEnter = vi.fn();
        const onMouseLeave = vi.fn();
        render(
            <Button
                label="run"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            />,
        );

        const button = screen.getByRole("button", { name: "run" });
        await userEvent.hover(button);
        await userEvent.unhover(button);

        expect(onMouseEnter).toHaveBeenCalledTimes(1);
        expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });
});

describe("Button: rendering", () => {
    it("defaults to type=button so it can't submit a form by accident", () => {
        render(<Button label="run" />);
        expect(screen.getByRole("button", { name: "run" })).toHaveAttribute(
            "type",
            "button",
        );
    });

    it("respects an explicit type prop", () => {
        render(<Button label="save" type="submit" />);
        expect(screen.getByRole("button", { name: "save" })).toHaveAttribute(
            "type",
            "submit",
        );
    });

    it("applies a custom className alongside the built-in ones", () => {
        render(<Button label="run" className="my-custom-class" />);
        expect(screen.getByRole("button", { name: "run" })).toHaveClass(
            "my-custom-class",
        );
    });

    it("sets aria-label from the aria prop", () => {
        render(<Button label="✕" aria="close dialog" />);
        expect(
            screen.getByRole("button", { name: "close dialog" }),
        ).toBeInTheDocument();
    });
});

describe("Button: link variant", () => {
    it("renders as a link when a url is given", () => {
        render(<Button label="fork" link="/friends" />);
        expect(screen.getByText("fork").closest("a")).toHaveAttribute(
            "href",
            "/friends",
        );
    });

    it("renders a disabled link as non-navigable", () => {
        render(<Button label="fork" link="/friends" disabled />);
        const link = screen.getByText("fork");
        expect(link).toHaveAttribute("aria-disabled", "true");
        expect(link.closest("a")).toHaveAttribute("href", "#");
    });

    it("prefers the link variant over the button variant when both apply", () => {
        // link is present, so this should not render a <button> at all
        render(<Button label="fork" link="/friends" onClick={() => {}} />);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
