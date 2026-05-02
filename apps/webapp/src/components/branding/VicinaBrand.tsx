import { APP_NAME, APP_TAGLINE } from "@vicina/config";

interface VicinaBrandProps {
  className?: string;
  mode?: "icon" | "wordmark" | "lockup";
  tone?: "light" | "dark";
}

export function VicinaBrand({
  className,
  mode = "wordmark",
  tone = "light"
}: VicinaBrandProps) {
  const classes = ["brand", `brand--${mode}`, `brand--${tone}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <VicinaMark />
      {mode !== "icon" ? (
        <div className="brand__text">
          <span className="brand__name">{APP_NAME}</span>
          {mode === "lockup" ? <span className="brand__tagline">{APP_TAGLINE}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export function VicinaMark() {
  return (
    <svg
      aria-hidden="true"
      className="brand-mark"
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="brand-mark__pin"
        d="M32 4C19.8 4 10 13.7 10 25.8c0 15 17.2 30 20.5 32.7a2.4 2.4 0 0 0 3 0C36.8 55.8 54 40.8 54 25.8 54 13.7 44.2 4 32 4Z"
      />
      <path
        className="brand-mark__field brand-mark__field--rear"
        d="M16.8 40.8c6-8 15.7-12.8 26.5-12.8 1.7 0 3.4.1 5 .4"
      />
      <path
        className="brand-mark__field brand-mark__field--front"
        d="M20.2 47.3c5-6.4 12.8-10.5 21.7-10.5 2.4 0 4.8.3 7 .9"
      />
      <circle className="brand-mark__person brand-mark__person--main" cx="32" cy="22" r="5.8" />
      <path
        className="brand-mark__person brand-mark__person--main"
        d="M21.8 37.2c1.6-6 5.1-9.2 10.2-9.2s8.6 3.2 10.2 9.2"
      />
      <circle className="brand-mark__person brand-mark__person--side" cx="21.8" cy="25.2" r="4.4" />
      <path
        className="brand-mark__person brand-mark__person--side"
        d="M14.8 38.2c1.1-4.8 3.5-7.2 7-7.2 2.4 0 4.3 1.1 5.7 3.3"
      />
      <circle className="brand-mark__person brand-mark__person--side" cx="42.2" cy="25.2" r="4.4" />
      <path
        className="brand-mark__person brand-mark__person--side"
        d="M36.5 34.3c1.4-2.2 3.3-3.3 5.7-3.3 3.5 0 5.9 2.4 7 7.2"
      />
    </svg>
  );
}
