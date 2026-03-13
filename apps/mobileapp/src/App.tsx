import { APP_NAME } from "@rally/config";
import { PILOT_VENUES } from "@rally/domain";
import { brandTokens } from "@rally/ui";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const previewVenues = PILOT_VENUES.slice(0, 3);

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Rally mobileapp scaffold</Text>
        <Text style={styles.title}>{APP_NAME} mobileapp is wired.</Text>
        <Text style={styles.copy}>
          This Expo-style placeholder is part of the shared workspace and keeps
          future iOS and Android work inside the standard Rally repo cycle.
        </Text>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Translated pilot venues</Text>
          {previewVenues.map((venue) => (
            <View key={venue.id} style={styles.venueRow}>
              <Text style={styles.venueName}>{venue.name}</Text>
              <Text style={styles.venueMeta}>{venue.address}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: brandTokens.colors.canvas
  },
  container: {
    padding: 24,
    gap: 16
  },
  eyebrow: {
    color: "#6b4f2b",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  title: {
    color: brandTokens.colors.textPrimary,
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 38
  },
  copy: {
    color: "#324849",
    fontSize: 16,
    lineHeight: 24
  },
  panel: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#fffdf8",
    borderColor: "rgba(16, 59, 64, 0.12)",
    borderWidth: 1
  },
  panelTitle: {
    marginBottom: 12,
    color: brandTokens.colors.textPrimary,
    fontSize: 18,
    fontWeight: "700"
  },
  venueRow: {
    paddingVertical: 10,
    borderTopColor: "rgba(16, 59, 64, 0.08)",
    borderTopWidth: 1
  },
  venueName: {
    color: brandTokens.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600"
  },
  venueMeta: {
    marginTop: 4,
    color: "#5d6767",
    fontSize: 14
  }
});
