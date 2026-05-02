import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { Button } from "../../src/components/Button";
import { Screen, Section } from "../../src/components/Screen";
import { SignalCard } from "../../src/components/SignalCard";
import { useAuth } from "../../src/lib/auth";
import { fetchMySignals } from "../../src/lib/signals";
import { theme } from "../../src/styles/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const auth = useAuth();
  const mySignals = useQuery({
    enabled: Boolean(auth.session),
    queryKey: ["my-signals", auth.session?.user.id],
    queryFn: () => fetchMySignals(auth.session?.user.id ?? "")
  });

  return (
    <Screen
      action={
        <Button onPress={() => router.push("/settings")} variant="secondary">
          Settings
        </Button>
      }
      eyebrow="Profile"
      title={auth.session ? auth.displayName : "Your Vicina profile"}
    >
      <Section>
        {auth.session ? (
          <>
            <Text style={styles.label}>Signed in</Text>
            <Text style={styles.body}>{auth.session.user.email}</Text>
            <Text style={styles.body}>
              Profiles use a display name and optional short bio. Vicina does not
              show follower counts or exact public location.
            </Text>
            <Button onPress={() => void auth.signOut()} variant="secondary">
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Text style={styles.body}>
              Browse public nearby signals anonymously, then sign in when you want
              to post, reply, report, or block.
            </Text>
            <Button onPress={() => router.push("/auth")}>Sign in</Button>
          </>
        )}
      </Section>

      <Section>
        <Text style={styles.sectionTitle}>Your active signals</Text>
        {mySignals.isLoading ? <ActivityIndicator color={theme.colors.accent} /> : null}
        {(mySignals.data ?? []).map((signal) => (
          <SignalCard
            key={signal.id}
            onPress={() =>
              router.push({
                pathname: "/signal/[id]",
                params: { id: signal.id }
              })
            }
            signal={signal}
          />
        ))}
        {auth.session && !mySignals.isLoading && (mySignals.data ?? []).length === 0 ? (
          <Text style={styles.body}>No active signals yet.</Text>
        ) : null}
        {!auth.session ? (
          <Text style={styles.body}>Sign in to see the signals you have created.</Text>
        ) : null}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700"
  }
});
