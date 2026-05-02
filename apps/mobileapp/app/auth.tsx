import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Screen, Section } from "../src/components/Screen";
import { TextField } from "../src/components/TextField";
import { useAuth } from "../src/lib/auth";
import { theme } from "../src/styles/theme";

export default function AuthScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function runAuth(action: "magic" | "signin" | "signup") {
    setMessage("");

    if (!email.trim()) {
      setMessage("Email is required.");
      return;
    }

    if (action !== "magic" && password.length < 8) {
      setMessage("Use at least 8 characters for password auth.");
      return;
    }

    if (action === "signup" && displayName.trim().length < 2) {
      setMessage("Display name is required for sign up.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (action === "magic") {
        await auth.sendMagicLink(email.trim());
        setMessage("Magic link sent. Open it on this device to finish sign in.");
      } else if (action === "signin") {
        await auth.signInWithPassword(email.trim(), password);
        router.replace("/nearby");
      } else {
        await auth.signUpWithPassword(email.trim(), password, displayName.trim());
        setMessage("Account created. Confirm your email if Supabase requires it.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to authenticate.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen eyebrow="Vicina" title="Show up, not scroll">
      <Section>
        <Text style={styles.body}>
          Anonymous browsing is available for public nearby signals. Posting,
          replying, reporting, and blocking require Supabase auth.
        </Text>
        {!auth.hasSupabaseConfig ? (
          <Text style={styles.notice}>
            Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to use
            live auth.
          </Text>
        ) : null}
        <TextField label="Email" onChangeText={setEmail} value={email} />
        <TextField
          label="Password"
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />
        <TextField
          label="Display name for sign up"
          onChangeText={setDisplayName}
          value={displayName}
        />
      </Section>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.actions}>
        <Button disabled={isSubmitting} onPress={() => void runAuth("magic")}>
          Send magic link
        </Button>
        <Button
          disabled={isSubmitting}
          onPress={() => void runAuth("signin")}
          variant="secondary"
        >
          Sign in with password
        </Button>
        <Button
          disabled={isSubmitting}
          onPress={() => void runAuth("signup")}
          variant="secondary"
        >
          Create account
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  },
  notice: {
    backgroundColor: theme.colors.warningSoft,
    borderColor: "rgba(194, 106, 45, 0.25)",
    borderRadius: theme.radii.card,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    padding: theme.spacing.md
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  actions: {
    gap: theme.spacing.sm
  }
});
