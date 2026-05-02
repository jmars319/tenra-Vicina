import { SIGNAL_CATEGORY_LABELS, type VicinaSignal } from "@vicina/domain";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

export interface SignalSummary extends VicinaSignal {
  commentCount: number;
  distanceMiles?: number;
  interestCount: number;
}

interface SignalCardProps {
  signal: SignalSummary;
  onPress: () => void;
}

export function SignalCard({ signal, onPress }: SignalCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.row}>
        <Text style={styles.category}>{SIGNAL_CATEGORY_LABELS[signal.category]}</Text>
        <Text style={styles.meta}>{formatRelativeWindow(signal)}</Text>
      </View>
      <Text style={styles.title}>{signal.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {signal.description}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>{signal.approximateLocationLabel}</Text>
        <Text style={styles.meta}>{formatDistance(signal.distanceMiles)}</Text>
      </View>
      <Text style={styles.quietMeta}>
        {signal.interestCount} interested - {signal.commentCount} replies
      </Text>
    </Pressable>
  );
}

function formatRelativeWindow(signal: VicinaSignal): string {
  const nowMs = Date.now();
  if (signal.startsAtMs > nowMs) {
    const minutes = Math.max(1, Math.round((signal.startsAtMs - nowMs) / 60000));
    return `Starts in ${minutes}m`;
  }

  const minutesLeft = Math.max(1, Math.round((signal.expiresAtMs - nowMs) / 60000));
  if (minutesLeft >= 60) {
    return `${Math.round(minutesLeft / 60)}h left`;
  }

  return `${minutesLeft}m left`;
}

function formatDistance(distanceMiles: number | undefined): string {
  if (distanceMiles === undefined) {
    return "nearby";
  }

  if (distanceMiles < 0.2) {
    return "within a short walk";
  }

  return `within ${Math.max(1, Math.round(distanceMiles))} miles`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.panel,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md
  },
  pressed: {
    opacity: 0.84
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between"
  },
  category: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "700"
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 21
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    justifyContent: "space-between"
  },
  meta: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: "600"
  },
  quietMeta: {
    color: theme.colors.textSoft,
    fontSize: 12
  }
});
