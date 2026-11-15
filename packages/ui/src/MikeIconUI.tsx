"use client";

import React, { useSyncExternalStore } from "react";

/*
 * The ECL AI mark: the Emerging Cities Lawyers "ECL" monogram on a square
 * tile. The export names (MikeIcon, MIKE_ICON_TINTS) are kept so the rest of
 * the app and the upstream code that calls them keep working unchanged.
 *
 * A status (done, error) or a tint recolours the tile. While `spin` is on,
 * the mark breathes instead of turning, since a lettered tile should not
 * rotate. Motion stops under prefers-reduced-motion.
 */

type IconPalette = { tile: string; letters: string };

// ECL brand: maroon #551c27 and paper #f8f2e7.
const ECL_MAROON = "#551c27";
const ECL_PAPER = "#f8f2e7";

const DEFAULT_PALETTE: IconPalette = { tile: ECL_MAROON, letters: ECL_PAPER };
// Inverted for dark surfaces: paper tile, maroon letters.
const WHITE_PALETTE: IconPalette = { tile: ECL_PAPER, letters: ECL_MAROON };
const DONE_PALETTE: IconPalette = { tile: "#4ade80", letters: "#ffffff" };
const ERROR_PALETTE: IconPalette = { tile: "#f87171", letters: "#ffffff" };

// Tints that tell several marks apart, such as subagents working side by
// side. Red and green are left out so a tint never reads as an error or done.
const TINT_PALETTES = {
    sky: { tile: "#0ea5e9", letters: "#ffffff" },
    violet: { tile: "#8b5cf6", letters: "#ffffff" },
    amber: { tile: "#f59e0b", letters: "#ffffff" },
    pink: { tile: "#ec4899", letters: "#ffffff" },
    teal: { tile: "#14b8a6", letters: "#ffffff" },
    indigo: { tile: "#6366f1", letters: "#ffffff" },
} satisfies Record<string, IconPalette>;

export type MikeIconTint = keyof typeof TINT_PALETTES;

/** The tints in the order a list of marks should take them. */
export const MIKE_ICON_TINTS = Object.keys(TINT_PALETTES) as MikeIconTint[];

// The mark is inline SVG, so the dark remapping in globals.css cannot reach
// it; it watches the document theme class itself. One observer serves every
// icon on the page. Targets that never set the class (the Word add-in) always
// read false and keep the maroon mark.
const themeListeners = new Set<() => void>();
let themeObserver: MutationObserver | null = null;

function subscribeToTheme(listener: () => void): () => void {
    themeListeners.add(listener);
    if (!themeObserver && typeof MutationObserver !== "undefined") {
        themeObserver = new MutationObserver(() => {
            themeListeners.forEach((notify) => notify());
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
    }

    return () => {
        themeListeners.delete(listener);
        if (themeListeners.size === 0) {
            themeObserver?.disconnect();
            themeObserver = null;
        }
    };
}

function readDarkTheme(): boolean {
    return (
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark")
    );
}

function readDarkThemeOnServer(): boolean {
    return false;
}

function useDarkTheme(): boolean {
    return useSyncExternalStore(
        subscribeToTheme,
        readDarkTheme,
        readDarkThemeOnServer,
    );
}

/** The ECL monogram, drawn on a 64x64 grid (same paths as the firm favicon). */
export function EclMonogramPaths({ fill }: { fill: string }) {
    return (
        <g fill={fill}>
            <path d="M5,19 H21 V24 H10 V29.6 H19.5 V34.6 H10 V40 H21 V45 H5 Z" />
            <path d="M40.28,24.31 A9.5,13.4 0 1 0 40.28,39.69 L36.60,37.11 A5,8.9 0 1 1 36.60,26.90 Z" />
            <path d="M44,19 H49 V40 H58 V45 H44 Z" />
        </g>
    );
}

export function MikeIcon({
    spin = false,
    done = false,
    error = false,
    mike = false,
    tint,
    size = 24,
    style,
}: {
    spin?: boolean;
    done?: boolean;
    error?: boolean;
    mike?: boolean;
    /** A colour for the mark; the status palettes take precedence. */
    tint?: MikeIconTint;
    size?: number;
    style?: React.CSSProperties;
}) {
    void mike;
    const darkTheme = useDarkTheme();
    const palette = error
        ? ERROR_PALETTE
        : done
          ? DONE_PALETTE
          : tint
            ? TINT_PALETTES[tint]
            : darkTheme
              ? WHITE_PALETTE
              : DEFAULT_PALETTE;

    return (
        <span
            className="shrink-0 inline-block motion-safe:animate-[ecl-mark-breathe_1.6s_ease-in-out_infinite]"
            style={{
                animationPlayState: spin ? "running" : "paused",
                ...style,
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                width={size}
                height={size}
                role="img"
                aria-label="ECL AI"
                style={{ display: "block" }}
            >
                <rect
                    data-ecl-tile=""
                    width="64"
                    height="64"
                    rx="9"
                    style={{ fill: palette.tile, transition: "fill 220ms ease" }}
                />
                <EclMonogramPaths fill={palette.letters} />
            </svg>
        </span>
    );
}
