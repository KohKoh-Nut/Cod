import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VisibilitySelector from "@/components/panels/VisibilitySelector";

describe("VisibilitySelector", () => {
    it("renders all three visibility options", () => {
        render(<VisibilitySelector value="public" onChange={() => {}} />);
        expect(screen.getByText("Public")).toBeInTheDocument();
        expect(screen.getByText("Friends")).toBeInTheDocument();
        expect(screen.getByText("Private")).toBeInTheDocument();
    });

    it("shows the hint for the currently selected option", () => {
        render(<VisibilitySelector value="friends" onChange={() => {}} />);
        expect(
            screen.getByText("Only the friends you pick can view it."),
        ).toBeInTheDocument();
    });

    it("updates the hint when a different value is selected via props", () => {
        const { rerender } = render(
            <VisibilitySelector value="public" onChange={() => {}} />,
        );
        expect(screen.getByText("Anyone with the link can view it.")).toBeInTheDocument();

        rerender(<VisibilitySelector value="private" onChange={() => {}} />);
        expect(screen.getByText("Only you can view it.")).toBeInTheDocument();
    });

    it("calls onChange with the clicked option's value", async () => {
        const onChange = vi.fn();
        render(<VisibilitySelector value="public" onChange={onChange} />);

        await userEvent.click(screen.getByText("Friends"));

        expect(onChange).toHaveBeenCalledWith("friends");
    });

    it("highlights the active option differently from the others", () => {
        render(<VisibilitySelector value="private" onChange={() => {}} />);
        const active = screen.getByText("Private");
        const inactive = screen.getByText("Public");

        expect(active.className).toContain("bg-brand");
        expect(inactive.className).not.toContain("bg-brand");
    });
});
