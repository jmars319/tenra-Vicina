import { DISCOVERY_RADIUS_MILES } from "@vicina/domain";
import { StyleSheet, Text } from "react-native";
import { Screen, Section } from "../src/components/Screen";
import { useAuth } from "../src/lib/auth";
import { theme } from "../src/styles/theme";

export default function SettingsScreen() {
  const auth = useAuth();

  return (
    <Screen eyebrow="Settings" title="Privacy-first defaults">
      <Section>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.body}>
          Vicina requests foreground location permission so it can find nearby
          signals. The app rounds coordinates before sending them and never shows
          exact coordinates publicly.
        </Text>
        <Text style={styles.body}>
          Supported discovery radii: {DISCOVERY_RADIUS_MILES.join(", ")} miles.
        </Text>
      </Section>

      <Section>
        <Text style={styles.sectionTitle}>Social mechanics</Text>
        <Text style={styles.body}>
          Vicina intentionally avoids likes, follower counts, popularity ranking,
          and infinite-scroll engagement loops. Threads live inside signals.
        </Text>
      </Section>

      <Section>
        <Text style={styles.sectionTitle}>Supabase</Text>
        <Text style={styles.body}>
          Live auth and posting require EXPO_PUBLIC_SUPABASE_URL and
          EXPO_PUBLIC_SUPABASE_ANON_KEY.
        </Text>
        <Text style={styles.body}>
          Current mode: {auth.hasSupabaseConfig ? "Supabase configured" : "seed data only"}.
        </Text>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700"
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  }
});
