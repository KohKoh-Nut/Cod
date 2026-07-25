import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavBar from "@/components/panels/NavBar";

describe("NavBar", () => {
    it("starts closed, showing only the menu button", () => {
        render(<NavBar />);
        expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
        expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    });

    it("opens to show all nav links when the menu button is clicked", async () => {
        render(<NavBar />);
        await userEvent.click(screen.getByRole("button", { name: "Menu" }));

        expect(screen.getByText("Code")).toBeInTheDocument();
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
        expect(screen.getByText("Friends")).toBeInTheDocument();
    });

    it("links each item to the right route", async () => {
        render(<NavBar />);
        await userEvent.click(screen.getByRole("button", { name: "Menu" }));

        expect(screen.getByText("Code").closest("a")).toHaveAttribute("href", "/");
        expect(screen.getByText("Profile").closest("a")).toHaveAttribute("href", "/profile");
        expect(screen.getByText("Settings").closest("a")).toHaveAttribute("href", "/settings");
        expect(screen.getByText("Friends").closest("a")).toHaveAttribute("href", "/friends");
    });

    it("closes again when the menu button is clicked a second time", async () => {
        render(<NavBar />);
        const menuButton = screen.getByRole("button", { name: "Menu" });

        await userEvent.click(menuButton);
        expect(screen.getByText("Profile")).toBeInTheDocument();

        await userEvent.click(menuButton);
        expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    });

    it("closes when a nav link is clicked", async () => {
        render(<NavBar />);
        await userEvent.click(screen.getByRole("button", { name: "Menu" }));

        await userEvent.click(screen.getByText("Profile"));

        expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });

    it("closes when clicking outside the menu", async () => {
        render(
            <div>
                <div data-testid="outside">elsewhere on the page</div>
                <NavBar />
            </div>,
        );
        await userEvent.click(screen.getByRole("button", { name: "Menu" }));
        expect(screen.getByText("Profile")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("outside"));

        expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    });

    it("does not close when clicking inside the menu itself", async () => {
        render(<NavBar />);
        await userEvent.click(screen.getByRole("button", { name: "Menu" }));

        // clicking the menu's own wrapper, not a link, shouldn't close it
        const menu = screen.getByText("Profile").closest("div")!;
        await userEvent.click(menu);

        expect(screen.getByText("Profile")).toBeInTheDocument();
    });
});
