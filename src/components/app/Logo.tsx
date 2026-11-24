import { useState } from "react";
import btcBrandLogoUrl from "@/assets/images/btc_emblem_logo_1794845537285.jpg";
import { getBrand, isBtcMode } from "@/config/brand";

export function Logo({
  compact,
  showSubtitle = true,
  size = "md",
}: {
  compact?: boolean;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const brand = getBrand();
  const btc = isBtcMode();
  const [imgError, setImgError] = useState(false);

  const boxSizeClass =
    size === "lg"
      ? "size-10 rounded-xl"
      : size === "sm"
        ? "size-7 rounded-lg"
        : "size-8 rounded-lg";

  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div
        className={`relative flex ${boxSizeClass} shrink-0 items-center justify-center overflow-hidden border border-border bg-surface-2 shadow-xs`}
      >
        {btc && !imgError ? (
          <img
            src={btcBrandLogoUrl}
            alt={`${brand.name} — ${brand.fullName}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-center"
          />
        ) : btc ? (
          <svg
            viewBox="0 0 24 24"
            className="size-4.5 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 14l8-7 8 7" />
            <path d="M7 18h10" />
            <path d="M12 7v11" opacity="0.6" />
          </svg>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-primary">
            <svg
              viewBox="0 0 24 24"
              className="size-4.5 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 19V5l14 14V5" />
            </svg>
          </div>
        )}
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display font-bold tracking-[0.08em] text-foreground whitespace-nowrap ${
              size === "sm" ? "text-[0.95rem]" : "text-[1rem]"
            }`}
          >
            {brand.name}
          </span>
          {btc ? (
            <span
              className={`mt-0.5 font-medium tracking-[0.04em] text-muted-foreground whitespace-nowrap ${
                size === "sm" ? "text-[9.5px]" : "text-[10.5px]"
              }`}
            >
              Levelup peers
            </span>
          ) : (
            showSubtitle && (
              <span className="mt-0.5 text-[9px] font-semibold tracking-[0.14em] text-muted-foreground uppercase whitespace-nowrap">
                {brand.fullName}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}
