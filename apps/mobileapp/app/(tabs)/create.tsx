import {
  DEFAULT_SIGNAL_DURATION_HOURS,
  DISCOVERY_RADIUS_MILES,
  SIGNAL_CATEGORIES,
  SIGNAL_CATEGORY_LABELS,
  type DiscoveryRadiusMiles,
  type SignalCategory
} from "@vicina/domain";
import { createSignalRequestSchema } from "@vicina/validation";
import { useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { OptionChips } from "../../src/components/OptionChips";
import { Screen, Section } from "../../src/components/Screen";
import { TextField } from "../../src/components/TextField";
import { useAuth } from "../../src/lib/auth";
import { approximateCoordinates, DEFAULT_COORDINATES } from "../../src/lib/location";
import { createSignal } from "../../src/lib/signals";
import { theme } from "../../src/styles/theme";

const categoryOptions = SIGNAL_CATEGORIES.map((value) => ({
  label: SIGNAL_CATEGORY_LABELS[value],
  value
}));

const radiusOptions = DISCOVERY_RADIUS_MILES.map((value) => ({
  label: `${value} mi`,
  value
}));

const expirationOptions = [
  { label: "4h", value: 4 },
  { label: "8h", value: 8 },
  { label: "24h max", value: 24 }
];

export default function CreateSignalScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const auth = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SignalCategory>("general");
  const [locationLabel, setLocationLabel] = useState("near Downtown");
  const [radiusMiles, setRadiusMiles] = useState<DiscoveryRadiusMiles>(3);
  const [expirationHours, setExpirationHours] = useState(DEFAULT_SIGNAL_DURATION_HOURS);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setMessage("");
    const nowMs = Date.now();
    const coordinates = await readApproximateCoordinates();
    const parsed = createSignalRequestSchema.safeParse({
      title,
      description,
      category,
      approximateLocationLabel: locationLabel,
      coordinates,
      startsAtMs: nowMs,
      expiresAtMs: nowMs + expirationHours * 60 * 60 * 1000,
      visibilityRadiusMiles: radiusMiles
    });

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check the signal details.");
      return;
    }

    if (!auth.session) {
      setMessage("Sign in before posting. Anonymous browsing is allowed; posting is not.");
      return;
    }

    setIsSubmitting(true);
    try {
      const signal = await createSignal(parsed.data, auth.session.user.id);
      await queryClient.invalidateQueries({ queryKey: ["nearby-signals"] });
      router.push({
        pathname: "/signal/[id]",
        params: { id: signal.id }
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create signal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen eyebrow="Create" title="Start a lightweight signal">
      <Section>
        <Text style={styles.warning}>
          Vicina shares approximate nearby activity, not your exact location.
        </Text>
        <TextField
          label="Title"
          onChangeText={setTitle}
          placeholder="Coffee before the next meeting"
          value={title}
        />
        <TextField
          label="Short description"
          multiline
          onChangeText={setDescription}
          placeholder="A low-pressure note about what is happening."
          value={description}
        />
        <TextField
          label="Approximate area"
          onChangeText={setLocationLabel}
          placeholder="near Downtown"
          value={locationLabel}
        />
      </Section>

      <Section>
        <Text style={styles.sectionTitle}>Category</Text>
        <OptionChips onChange={setCategory} options={categoryOptions} value={category} />
      </Section>

      <Section>
        <Text style={styles.sectionTitle}>Visibility radius</Text>
        <OptionChips
          onChange={setRadiusMiles}
          options={radiusOptions}
          value={radiusMiles}
        />
      </Section>

      <Section>
        <Text style={styles.sectionTitle}>Expiration</Text>
        <OptionChips
          onChange={setExpirationHours}
          options={expirationOptions}
          value={expirationHours}
        />
      </Section>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.actions}>
        <Button onPress={() => void submit()} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create signal"}
        </Button>
        {!auth.session ? (
          <Button onPress={() => router.push("/auth")} variant="secondary">
            Sign in
          </Button>
        ) : null}
      </View>
    </Screen>
  );
}

async function readApproximateCoordinates() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    return DEFAULT_COORDINATES;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  return approximateCoordinates({
    lat: position.coords.latitude,
    lng: position.coords.longitude
  });
}

const styles = StyleSheet.create({
  warning: {
    backgroundColor: theme.colors.warningSoft,
    borderColor: "rgba(194, 106, 45, 0.25)",
    borderRadius: theme.radii.card,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    padding: theme.spacing.md
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700"
  },
  message: {
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20
  },
  actions: {
    gap: theme.spacing.sm
  }
});
