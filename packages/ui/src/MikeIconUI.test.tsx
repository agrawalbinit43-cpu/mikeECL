import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MikeIcon } from "./MikeIconUI";

function firstBladeFill(container: HTMLElement) {
    const tile = container.querySelector("rect[data-ecl-tile]");
    return (tile as SVGRectElement | null)?.style.fill.replace(/\s/g, "");
}

afterEach(() => {
    document.documentElement.classList.remove("dark");
});

describe("MikeIcon", () => {
    it("renders the maroon mark on the light theme", () => {
        const { container } = render(<MikeIcon />);

        expect(firstBladeFill(container)).toBe("rgb(85,28,39)");
    });

    it("renders the paper mark when the document is in dark mode", () => {
        document.documentElement.classList.add("dark");
        const { container } = render(<MikeIcon />);

        expect(firstBladeFill(container)).toBe("rgb(248,242,231)");
    });

    it("swaps palettes when the theme class changes while mounted", async () => {
        const { container } = render(<MikeIcon />);
        expect(firstBladeFill(container)).toBe("rgb(85,28,39)");

        document.documentElement.classList.add("dark");

        await waitFor(() =>
            expect(firstBladeFill(container)).toBe("rgb(248,242,231)"),
        );
    });

    it("colours a tinted mark in both themes, under the status palettes", () => {
        const { container, rerender } = render(<MikeIcon tint="violet" />);
        expect(firstBladeFill(container)).toBe("rgb(139,92,246)");

        document.documentElement.classList.add("dark");
        rerender(<MikeIcon tint="violet" />);
        expect(firstBladeFill(container)).toBe("rgb(139,92,246)");

        rerender(<MikeIcon tint="violet" error />);
        expect(firstBladeFill(container)).toBe("rgb(248,113,113)");
    });

    it("keeps the status palettes in dark mode", () => {
        document.documentElement.classList.add("dark");
        const { container } = render(<MikeIcon done />);

        expect(firstBladeFill(container)).toBe("rgb(74,222,128)");
    });
});
