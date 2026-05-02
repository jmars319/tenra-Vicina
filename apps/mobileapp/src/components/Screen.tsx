import type { ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

interface ScreenProps {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function Screen({ children, title, eyebrow, action }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {(title || eyebrow || action) && (
          <View style={styles.header}>
            <View style={styles.headerText}>
              {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
              {title ? <Text style={styles.title}>{title}</Text> : null}
            </View>
            {action}
          </View>
        )}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Section({ children }: { children: ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.canvas
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between"
  },
  headerText: {
    flex: 1,
    gap: 4
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.panel,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md
  }
});
