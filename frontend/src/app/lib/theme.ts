export type EclTheme = "classic" | "india" | "ai";

export const ECL_THEMES: { id: EclTheme; name: string; blurb: string }[] = [
    {
        id: "classic",
        name: "ECL Classic",
        blurb: "Maroon, gold and paper. The house style.",
    },
    {
        id: "india",
        name: "India",
        blurb: "Lime-wash, sandstone and brass, with a jali lattice.",
    },
    {
        id: "ai",
        name: "AI",
        blurb: "Maroon-black instrument panel with gold signals.",
    },
];

const STORAGE_KEY = "ecl-theme";
let userDarkMode = false;

export function getEclTheme(): EclTheme {
    if (typeof window === "undefined") return "classic";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "india" || stored === "ai" ? stored : "classic";
}

function paint(): void {
    if (typeof document === "undefined") return;
    const theme = getEclTheme();
    const dark = userDarkMode || theme === "ai";
    const root = document.documentElement;
    root.dataset.eclTheme = theme;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
}

export function applyDarkMode(enabled: boolean): void {
    userDarkMode = enabled;
    paint();
}

export function setEclTheme(theme: EclTheme): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, theme);
    paint();
}

export function initEclTheme(): void {
    paint();
}
