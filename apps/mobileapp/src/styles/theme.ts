import { brandTokens } from "@vicina/ui";

export const theme = {
  colors: {
    ...brandTokens.colors,
    canvasAlt: "#eef3ef",
    textSoft: "#6a7471",
    successSoft: "#e8f3ec",
    warningSoft: "#fff4dc",
    dangerSoft: "#fbe8e5"
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
