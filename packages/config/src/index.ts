export const APP_NAME = "Rally";

export const DEFAULT_DISCOVERY_RADIUS_KM = 3;

export const PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_APP_NAME",
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_MAP_PROVIDER",
  "NEXT_PUBLIC_MAP_STYLE_ID",
  "NEXT_PUBLIC_DEFAULT_LAT",
  "NEXT_PUBLIC_DEFAULT_LNG",
  "NEXT_PUBLIC_DEFAULT_RADIUS_KM"
] as const;

export function readPublicConfig(env: Record<string, string | undefined>) {
  return {
    appName: env.NEXT_PUBLIC_APP_NAME ?? APP_NAME,
    apiBaseUrl: env.NEXT_PUBLIC_API_BASE_URL ?? "",
    defaultRadiusKm:
      Number(env.NEXT_PUBLIC_DEFAULT_RADIUS_KM ?? DEFAULT_DISCOVERY_RADIUS_KM) ||
      DEFAULT_DISCOVERY_RADIUS_KM
  };
}
