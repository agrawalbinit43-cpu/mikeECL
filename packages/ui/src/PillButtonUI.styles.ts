import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
    LIQUID_GLASS_FLAT_CLASS,
    LIQUID_GLASS_HOVER_CLASS,
} from "./LiquidGlassUI";

export type PillButtonUITone = "black" | "white" | "blue" | "danger";
export type PillButtonUISize = "xs" | "icon-xs" | "sm" | "normal";

const toneClasses: Record<PillButtonUITone, string> = {
    black: "bg-ecl-maroon text-white hover:bg-ecl-maroon-ink disabled:hover:bg-ecl-maroon",
    white: `${LIQUID_GLASS_FLAT_CLASS} ${LIQUID_GLASS_HOVER_CLASS} text-gray-700`,
    blue: "bg-blue-600/90 text-white hover:bg-blue-600 disabled:hover:bg-blue-600/90",
    danger: "bg-red-600/90 text-white hover:bg-red-600 disabled:hover:bg-red-600/90",
};

const sizeClasses: Record<PillButtonUISize, string> = {
    xs: "h-6 px-2.5 text-[11px] leading-none has-[svg]:pl-1.5 has-[img]:pl-1.5",
    "icon-xs": "h-6 w-6 p-0 text-[11px] leading-none",
    sm: "h-7 px-3 text-xs leading-none has-[svg]:pl-2 has-[img]:pl-2",
    normal: "h-8 px-4 text-sm leading-none has-[svg]:pl-3 has-[img]:pl-3",
};

/**
 * `transition`, not `transition-all`: `all` includes `visibility`, which is
 * inherited. The assistant side panel keeps inactive tabs mounted and hides
 * them with `invisible`, so a pill inside one animated that inherited change
 * and stayed on screen for the transition's full duration after the user
 * switched tabs. Tailwind's default property list covers every visual property
 * these tones declare — color, background, border, box-shadow, opacity,
 * transform/scale, filter — and leaves visibility alone.
 */
export function pillButtonUIClassName({
    tone,
    size = "sm",
    className,
}: {
    tone: PillButtonUITone;
    size?: PillButtonUISize;
    className?: string;
}) {
    return twMerge(
        clsx(
            "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecl-gold/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
            toneClasses[tone],
            sizeClasses[size],
            className,
        ),
    );
}
