import { SIGNAL_CATEGORY_LABELS } from "@vicina/domain";
import { createSignalCommentRequestSchema } from "@vicina/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { Screen, Section } from "../../src/components/Screen";
import { TextField } from "../../src/components/TextField";
import { useAuth } from "../../src/lib/auth";
import {
  blockUser,
  createSignalComment,
  fetchSignalDetail,
  markInterested,
  reportSignal
} from "../../src/lib/signals";
import { theme } from "../../src/styles/theme";

export default function SignalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState("");
  const [message, setMessage] = useState("");

  const detailQuery = useQuery({
    queryKey: ["signal-detail", id],
    queryFn: () => fetchSignalDetail(id, null)
  });

  const interestedMutation = useMutation({
    mutationFn: async () => {
      if (!auth.session) {
        throw new Error("Sign in before marking interest.");
      }
      await markInterested(id, auth.session.user.id);
    },
    onSuccess: async () => {
      setMessage("Marked interested.");
      await queryClient.invalidateQueries({ queryKey: ["signal-detail", id] });
      await queryClient.invalidateQueries({ queryKey: ["nearby-signals"] });
    },
    onError: setMutationMessage
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!auth.session) {
        throw new Error("Sign in before replying.");
      }

      const parsed = createSignalCommentRequestSchema.safeParse({
        signalId: id,
        body: commentBody
      });

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Comment is invalid.");
      }

      await createSignalComment(id, auth.session.user.id, parsed.data.body);
    },
    onSuccess: async () => {
      setCommentBody("");
      setMessage("Reply posted.");
      await queryClient.invalidateQueries({ queryKey: ["signal-detail", id] });
    },
    onError: setMutationMessage
  });

  const moderationMutation = useMutation({
    mutationFn: async (action: "report" | "block") => {
      if (!auth.session) {
        throw new Error("Sign in before using safety actions.");
      }

      const signal = detailQuery.data?.signal;
      if (!signal) {
        throw new Error("Signal is not loaded.");
      }

      if (action === "report") {
        await reportSignal(id, auth.session.user.id, "Safety concern");
        return "Report sent.";
      }

      await blockUser(signal.authorId, auth.session.user.id);
      return "User blocked.";
    },
    onSuccess: (nextMessage) => setMessage(nextMessage),
    onError: setMutationMessage
  });

  const detail = detailQuery.data;

  if (detailQuery.isLoading) {
    return (
      <Screen title="Signal">
        <ActivityIndicator color={theme.colors.accent} />
      </Screen>
    );
  }

  if (!detail) {
    return (
      <Screen title="Signal not found">
        <Section>
          <Text style={styles.body}>This signal may have expired or been removed.</Text>
          <Button onPress={() => router.replace("/nearby")}>Back to nearby</Button>
        </Section>
      </Screen>
    );
  }

  return (
    <Screen eyebrow={SIGNAL_CATEGORY_LABELS[detail.signal.category]} title={detail.signal.title}>
      <Section>
        <Text style={styles.description}>{detail.signal.description}</Text>
        <View style={styles.metaGrid}>
          <Meta label="Area" value={detail.signal.approximateLocationLabel} />
          <Meta label="Starts" value={formatTime(detail.signal.startsAtMs)} />
          <Meta label="Expires" value={formatTime(detail.signal.expiresAtMs)} />
          <Meta label="Interest" value={`${detail.signal.interestCount} interested`} />
        </View>
        <Text style={styles.privacy}>
          Exact coordinates are not shown. Vicina only displays approximate nearby
          activity.
        </Text>
        <Button onPress={() => interestedMutation.mutate()}>
          {"I'm interested"}
        </Button>
      </Section>

      <Section>
        <Text style={styles.sectionTitle}>Signal thread</Text>
        {detail.comments.map((comment) => (
          <View key={comment.id} style={styles.comment}>
            <Text style={styles.commentAuthor}>{comment.authorDisplayName}</Text>
            <Text style={styles.body}>{comment.body}</Text>
          </View>
        ))}
        {detail.comments.length === 0 ? (
          <Text style={styles.body}>No replies yet. Threads stay inside each signal.</Text>
        ) : null}
        <TextField
          label="Reply"
          multiline
          onChangeText={setCommentBody}
          placeholder="Ask a quick question or coordinate details."
          value={commentBody}
        />
        <Button onPress={() => commentMutation.mutate()} variant="secondary">
          Post reply
        </Button>
      </Section>

      <Section>
        <Text style={styles.sectionTitle}>Safety</Text>
        <Text style={styles.body}>
          Reports and blocks are private safety actions. They do not create public
          scores or rankings.
        </Text>
        <Button onPress={() => moderationMutation.mutate("report")} variant="danger">
          Report signal
        </Button>
        <Button onPress={() => moderationMutation.mutate("block")} variant="secondary">
          Block user
        </Button>
      </Section>

      {message ? <Text style={styles.message}>{message}</Text> : null}
      {!auth.session ? (
        <Button onPress={() => router.push("/auth")} variant="secondary">
          Sign in to participate
        </Button>
      ) : null}
    </Screen>
  );

  function setMutationMessage(error: Error) {
    setMessage(error.message);
  }
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function formatTime(valueMs: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(valueMs));
}

const styles = StyleSheet.create({
  description: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    lineHeight: 25
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
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  metaItem: {
    backgroundColor: theme.colors.canvasAlt,
    borderRadius: theme.radii.card,
    minWidth: "46%",
    padding: theme.spacing.sm
  },
  metaLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  metaValue: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4
  },
  privacy: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 19
  },
  comment: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    gap: 4,
    paddingTop: theme.spacing.sm
  },
  commentAuthor: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  }
});
