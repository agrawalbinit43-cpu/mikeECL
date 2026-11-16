import Link from "next/link";
import { MikeIcon } from "@mike/ui";

interface SiteLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    iconClassName?: string;
    animate?: boolean;
    asLink?: boolean;
}

export function SiteLogo({
    size = "md",
    className = "",
    iconClassName = "",
    animate = false,
    asLink = false,
}: SiteLogoProps) {
    const landingHref =
        process.env.NODE_ENV === "production"
            ? "https://emergingcitieslawyers.com"
            : "http://localhost:3000";
    // Mark tile, then ECL and AI separated by a gold hairline.
    const spec = {
        sm: { mark: 24, text: "text-[12px]", gap: "gap-2.5" },
        md: { mark: 28, text: "text-[13px]", gap: "gap-2.5" },
        lg: { mark: 36, text: "text-[17px]", gap: "gap-3" },
        xl: { mark: 56, text: "text-[26px]", gap: "gap-4" },
    }[size];

    const logo = (
        <div
            role="img"
            aria-label="ECL AI"
            className={`flex items-center ${spec.gap} font-sans leading-none ${
                animate ? "sidebar-fade-in" : ""
            } ${className}`}
        >
            <span
                className={`inline-flex shrink-0 items-center leading-none ${iconClassName}`}
            >
                <MikeIcon size={spec.mark} />
            </span>
            <span
                aria-hidden="true"
                className={`flex items-center gap-2 ${spec.text} uppercase tracking-[0.14em] text-ecl-ink dark:text-ecl-paper`}
            >
                <span className="font-semibold">ECL</span>
                <span className="h-[14px] w-px bg-ecl-gold" />
                <span className="font-medium text-ecl-gold-deep dark:text-ecl-gold">
                    AI
                </span>
            </span>
        </div>
    );

    if (asLink) {
        return (
            <Link
                href={landingHref}
                className="cursor-pointer hover:opacity-80 transition-opacity"
            >
                {logo}
            </Link>
        );
    }

    return logo;
}
