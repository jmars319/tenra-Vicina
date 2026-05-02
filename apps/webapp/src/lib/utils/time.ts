export function formatSignalWindow(startsAtMs: number, expiresAtMs: number): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${formatter.format(new Date(startsAtMs))} - ${formatter.format(new Date(expiresAtMs))}`;
}

export function formatRelativeStart(startsAtMs: number): string {
  const deltaMinutes = Math.round((startsAtMs - Date.now()) / 60000);

  if (deltaMinutes <= -60) {
    return "Happening now";
  }

  if (deltaMinutes <= 0) {
    return "Starting now";
  }

  if (deltaMinutes < 60) {
    return `Starts in ${deltaMinutes}m`;
  }

  return `Starts in ${Math.round(deltaMinutes / 60)}h`;
}
