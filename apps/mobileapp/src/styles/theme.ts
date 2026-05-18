import { brandTokens } from "@vicina/ui";

export const theme = {
  colors: {
    ...brandTokens.colors,
    canvasAlt: "#15161d",
    textSoft: "#A0A0A0",
    successSoft: "rgba(16, 185, 129, 0.14)",
    warningSoft: "rgba(245, 158, 11, 0.14)",
    dangerSoft: "rgba(162, 61, 50, 0.16)"
  },
  radii: brandTokens.radii,
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32
  }
} as const;
