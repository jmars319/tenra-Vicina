import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { theme } from "../styles/theme";

interface Option<T extends string | number> {
  label: string;
  value: T;
}

interface OptionChipsProps<T extends string | number> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function OptionChips<T extends string | number>({
  options,
  value,
  onChange
}: OptionChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="button"
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected ? styles.selected : null]}
          >
            <Text style={[styles.label, selected ? styles.selectedLabel : null]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.sm,
    paddingVertical: 2
  },
  chip: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  selected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "600"
  },
  selectedLabel: {
    color: "#ffffff"
  }
});
