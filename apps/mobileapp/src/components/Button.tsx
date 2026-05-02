import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { theme } from "../styles/theme";

interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({
  children,
  onPress,
  disabled = false,
  variant = "primary"
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null
      ]}
    >
      <Text style={[styles.label, styles[`${variant}Label`]]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: theme.radii.card,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  primary: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent
  },
  secondary: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  danger: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: "rgba(162, 61, 50, 0.25)"
  },
  disabled: {
    opacity: 0.45
  },
  pressed: {
    opacity: 0.82
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    textAlign: "center"
  },
  primaryLabel: {
    color: "#ffffff"
  },
  secondaryLabel: {
    color: theme.colors.textPrimary
  },
  ghostLabel: {
    color: theme.colors.accent
  },
  dangerLabel: {
    color: theme.colors.danger
  }
});
