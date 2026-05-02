import { APP_NAME, APP_TAGLINE } from "@vicina/config";
import {
  DEFAULT_DISCOVERY_RADIUS_MILES,
  DISCOVERY_RADIUS_MILES,
  type DiscoveryRadiusMiles
} from "@vicina/domain";
import type { LatLng } from "@vicina/shared-types";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { OptionChips } from "../../src/components/OptionChips";
import { Screen, Section } from "../../src/components/Screen";
import { SignalCard } from "../../src/components/SignalCard";
import {
  fetchNearbySignals,
  type SignalSort
} from "../../src/lib/signals";
import { approximateCoordinates } from "../../src/lib/location";
import { theme } from "../../src/styles/theme";

const radiusOptions = DISCOVERY_RADIUS_MILES.map((value) => ({
  label: `${value} mi`,
  value
}));

const sortOptions: { label: string; value: SignalSort }[] = [
  { label: "Soonest", value: "soonest" },
  { label: "Newest", value: "newest" },
  { label: "Nearest", value: "nearest" }
];

export default function NearbyScreen() {
  const router = useRouter();
  const [coordinates, setCoordinates] = useState<LatLng | null>(null);
  const [locationMessage, setLocationMessage] = useState(
    "Using seed activity until location permission is granted."
  );
  const [radiusMiles, setRadiusMiles] = useState<DiscoveryRadiusMiles>(
    DEFAULT_DISCOVERY_RADIUS_MILES
  );
  const [sort, setSort] = useState<SignalSort>("soonest");

  const signalsQuery = useQuery({
    queryKey: ["nearby-signals", coordinates, radiusMiles, sort],
    queryFn: () => fetchNearbySignals({ coordinates, radiusMiles, sort })
  });

  async function requestLocation() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      setLocationMessage("Location permission was not granted. Showing public seed activity.");
      setCoordinates(null);
      return;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });
    const approximate = approximateCoordinates({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });

    setCoordinates(approximate);
    setLocationMessage(
      "Using an approximate location only. Exact coordinates are not displayed publicly."
    );
  }

  return (
    <Screen
      action={
        <Button onPress={() => router.push("/settings")} variant="secondary">
          Settings
        </Button>
      }
      eyebrow={APP_NAME}
      title={APP_TAGLINE}
    >
      <Section>
        <Text style={styles.sectionTitle}>Discovery radius</Text>
        <OptionChips
          onChange={setRadiusMiles}
          options={radiusOptions}
          value={radiusMiles}
        />
        <Text style={styles.note}>{locationMessage}</Text>
        <Button onPress={() => void requestLocation()} variant="secondary">
          Use approximate location
        </Button>
      </Section>

      <Section>
        <Text style={styles.sectionTitle}>Sort nearby signals</Text>
        <OptionChips onChange={setSort} options={sortOptions} value={sort} />
      </Section>

      <View style={styles.feed}>
        {signalsQuery.isLoading ? <ActivityIndicator color={theme.colors.accent} /> : null}
        {signalsQuery.error ? (
          <Text style={styles.error}>Unable to load nearby signals.</Text>
        ) : null}
        {(signalsQuery.data ?? []).map((signal) => (
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
        {!signalsQuery.isLoading && (signalsQuery.data ?? []).length === 0 ? (
          <Text style={styles.empty}>
            No active nearby signals in this radius. Vicina stays quiet when nothing
            current is happening.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700"
  },
  note: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  feed: {
    gap: theme.spacing.md
  },
  error: {
    color: theme.colors.danger,
    fontSize: 14
  },
  empty: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  }
});
