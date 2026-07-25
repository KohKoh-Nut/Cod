import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InputField from "@/components/ui/Input";

describe("InputField", () => {
    it("renders as a plain text input by default", () => {
        render(<InputField placeholder="username" />);
        expect(screen.getByPlaceholderText("username")).toHaveAttribute("type", "text");
    });

    it("renders a label when given one", () => {
        render(<InputField label="Email" />);
        expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("renders no label when none is given", () => {
        const { container } = render(<InputField placeholder="x" />);
        // only the input's own wrapper divs, no label text node
        expect(container.textContent).toBe("");
    });

    it("renders an error message when given one", () => {
        render(<InputField error="Passwords don't match" />);
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });

    it("renders no error message when none is given", () => {
        render(<InputField placeholder="x" />);
        expect(screen.queryByText(/don't match/)).not.toBeInTheDocument();
    });

    it("does not show a password toggle for a plain text input", () => {
        render(<InputField type="text" placeholder="x" />);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("shows a password toggle for a password input", () => {
        render(<InputField type="password" placeholder="x" />);
        expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
    });

    it("starts a password field masked", () => {
        render(<InputField type="password" placeholder="secret" />);
        expect(screen.getByPlaceholderText("secret")).toHaveAttribute("type", "password");
    });

    it("reveals the password as plain text when the toggle is clicked", async () => {
        render(<InputField type="password" placeholder="secret" />);

        await userEvent.click(screen.getByRole("button", { name: "Show password" }));

        expect(screen.getByPlaceholderText("secret")).toHaveAttribute("type", "text");
        expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
    });

    it("masks the password again on a second toggle click", async () => {
        render(<InputField type="password" placeholder="secret" />);
        const toggle = () => screen.getByRole("button", { name: /password/ });

        await userEvent.click(toggle());
        await userEvent.click(toggle());

        expect(screen.getByPlaceholderText("secret")).toHaveAttribute("type", "password");
    });

    it("passes through arbitrary input props like value and onChange", async () => {
        const handleChange = vi.fn();
        render(
            <InputField placeholder="x" value="" onChange={handleChange} />,
        );

        await userEvent.type(screen.getByPlaceholderText("x"), "a");

        expect(handleChange).toHaveBeenCalled();
    });
});
