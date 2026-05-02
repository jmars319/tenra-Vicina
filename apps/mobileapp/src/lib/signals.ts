import {
  type DiscoveryRadiusMiles,
  type SignalComment,
  type VicinaSignal
} from "@vicina/domain";
import type { LatLng } from "@vicina/shared-types";
import type { ParsedCreateSignalRequest } from "@vicina/validation";
import {
  createSeedComments,
  createSeedInterests,
  createSeedSignals
} from "../data/seedSignals";
import type { SignalSummary } from "../components/SignalCard";
import { distanceMiles, isWithinRadius } from "./location";
import { supabase } from "./supabase";
import type { Database } from "../types/supabase";

export type SignalSort = "soonest" | "newest" | "nearest";

type SignalRow = Database["public"]["Tables"]["signals"]["Row"];
type CommentRow = Database["public"]["Tables"]["signal_comments"]["Row"];

interface NearbySignalOptions {
  coordinates: LatLng | null;
  radiusMiles: DiscoveryRadiusMiles;
  sort: SignalSort;
}

interface SignalDetail {
  comments: SignalComment[];
  signal: SignalSummary;
}

export async function fetchNearbySignals({
  coordinates,
  radiusMiles,
  sort
}: NearbySignalOptions): Promise<SignalSummary[]> {
  const nowMs = Date.now();

  if (!supabase) {
    return sortSignals(seedSummaries(nowMs, coordinates, radiusMiles), sort);
  }

  const { data, error } = await supabase
    .from("signals")
    .select("*")
    .eq("status", "active")
    .eq("content_status", "visible")
    .gt("expires_at", new Date(nowMs).toISOString());

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const ids = rows.map((row) => row.id);
  const [interestCounts, commentCounts] = await Promise.all([
    countSignalRows("signal_interests", ids),
    countSignalRows("signal_comments", ids)
  ]);

  const summaries = rows
    .map((row) =>
      toSignalSummary(row, {
        commentCount: commentCounts.get(row.id) ?? 0,
        coordinates,
        interestCount: interestCounts.get(row.id) ?? 0
      })
    )
    .filter((summary) => {
      const publicRadius = Math.min(radiusMiles, summary.visibilityRadiusMiles);
      return isWithinRadius(summary.coordinates, coordinates, publicRadius);
    });

  return sortSignals(summaries, sort);
}

export async function fetchSignalDetail(
  signalId: string,
  coordinates: LatLng | null
): Promise<SignalDetail | null> {
  const seeded = seedDetail(signalId, coordinates);

  if (!supabase) {
    return seeded;
  }

  const { data: signal, error: signalError } = await supabase
    .from("signals")
    .select("*")
    .eq("id", signalId)
    .single();

  if (signalError) {
    throw signalError;
  }

  if (!signal) {
    return seeded;
  }

  const [{ data: interests }, { data: comments, error: commentsError }] =
    await Promise.all([
      supabase.from("signal_interests").select("id").eq("signal_id", signalId),
      supabase
        .from("signal_comments")
        .select("*")
        .eq("signal_id", signalId)
        .eq("content_status", "visible")
        .order("created_at", { ascending: true })
    ]);

  if (commentsError) {
    throw commentsError;
  }

  return {
    signal: toSignalSummary(signal, {
      commentCount: comments?.length ?? 0,
      coordinates,
      interestCount: interests?.length ?? 0
    }),
    comments: (comments ?? []).map(toSignalComment)
  };
}

export async function createSignal(
  input: ParsedCreateSignalRequest,
  userId: string
): Promise<VicinaSignal> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add env vars before posting.");
  }

  const { data, error } = await supabase
    .from("signals")
    .insert({
      author_id: userId,
      title: input.title,
      description: input.description,
      category: input.category,
      approximate_location_label: input.approximateLocationLabel,
      latitude: input.coordinates.lat,
      longitude: input.coordinates.lng,
      starts_at: new Date(input.startsAtMs).toISOString(),
      expires_at: new Date(input.expiresAtMs).toISOString(),
      visibility_radius_miles: input.visibilityRadiusMiles
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return toSignal(data);
}

export async function markInterested(signalId: string, userId: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add env vars before posting.");
  }

  const { error } = await supabase
    .from("signal_interests")
    .upsert({ signal_id: signalId, user_id: userId }, { onConflict: "signal_id,user_id" });

  if (error) {
    throw error;
  }
}

export async function createSignalComment(
  signalId: string,
  userId: string,
  body: string
): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add env vars before posting.");
  }

  const { error } = await supabase.from("signal_comments").insert({
    author_id: userId,
    body,
    signal_id: signalId
  });

  if (error) {
    throw error;
  }
}

export async function reportSignal(
  signalId: string,
  userId: string,
  reason: string
): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add env vars before reporting.");
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: userId,
    reason,
    signal_id: signalId
  });

  if (error) {
    throw error;
  }
}

export async function blockUser(blockedUserId: string, userId: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add env vars before blocking.");
  }

  const { error } = await supabase.from("user_blocks").upsert({
    blocked_user_id: blockedUserId,
    blocker_id: userId
  });

  if (error) {
    throw error;
  }
}

export async function fetchMySignals(userId: string): Promise<SignalSummary[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("signals")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    toSignalSummary(row, {
      commentCount: 0,
      coordinates: null,
      interestCount: 0
    })
  );
}

function seedSummaries(
  nowMs: number,
  coordinates: LatLng | null,
  radiusMiles: DiscoveryRadiusMiles
): SignalSummary[] {
  const comments = createSeedComments(nowMs);
  const interests = createSeedInterests(nowMs);

  return createSeedSignals(nowMs)
    .filter((signal) => {
      const publicRadius = Math.min(radiusMiles, signal.visibilityRadiusMiles);
      return isWithinRadius(signal.coordinates, coordinates, publicRadius);
    })
    .map((signal) => {
      const summary: SignalSummary = {
        ...signal,
        commentCount: comments.filter((comment) => comment.signalId === signal.id).length,
        interestCount: interests.filter((interest) => interest.signalId === signal.id).length
      };

      if (coordinates) {
        summary.distanceMiles = distanceMiles(signal.coordinates, coordinates);
      }

      return summary;
    });
}

function seedDetail(signalId: string, coordinates: LatLng | null): SignalDetail | null {
  const nowMs = Date.now();
  const summary = seedSummaries(nowMs, coordinates, 10).find(
    (signal) => signal.id === signalId
  );

  if (!summary) {
    return null;
  }

  return {
    signal: summary,
    comments: createSeedComments(nowMs).filter((comment) => comment.signalId === signalId)
  };
}

async function countSignalRows(
  table: "signal_comments" | "signal_interests",
  signalIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!supabase || signalIds.length === 0) {
    return counts;
  }

  const { data, error } = await supabase.from(table).select("signal_id").in("signal_id", signalIds);

  if (error) {
    throw error;
  }

  for (const row of data ?? []) {
    counts.set(row.signal_id, (counts.get(row.signal_id) ?? 0) + 1);
  }

  return counts;
}

function toSignalSummary(
  row: SignalRow,
  options: {
    commentCount: number;
    coordinates: LatLng | null;
    interestCount: number;
  }
): SignalSummary {
  const signal = toSignal(row);
  const summary: SignalSummary = {
    ...signal,
    commentCount: options.commentCount,
    interestCount: options.interestCount
  };

  if (options.coordinates) {
    summary.distanceMiles = distanceMiles(signal.coordinates, options.coordinates);
  }

  return summary;
}

function toSignal(row: SignalRow): VicinaSignal {
  const createdAtMs = Date.parse(row.created_at);
  const updatedAtMs = Date.parse(row.updated_at);

  return {
    id: row.id,
    authorId: row.author_id,
    authorDisplayName: "Nearby neighbor",
    title: row.title,
    description: row.description,
    category: row.category,
    approximateLocationLabel: row.approximate_location_label,
    coordinates: {
      lat: row.latitude,
      lng: row.longitude
    },
    startsAtMs: Date.parse(row.starts_at),
    expiresAtMs: Date.parse(row.expires_at),
    visibilityRadiusMiles: row.visibility_radius_miles,
    status: row.status,
    contentStatus: row.content_status,
    createdAtMs,
    updatedAtMs
  };
}

function toSignalComment(row: CommentRow): SignalComment {
  return {
    id: row.id,
    signalId: row.signal_id,
    authorId: row.author_id,
    authorDisplayName: "Nearby neighbor",
    body: row.body,
    contentStatus: row.content_status,
    createdAtMs: Date.parse(row.created_at),
    updatedAtMs: Date.parse(row.updated_at)
  };
}

function sortSignals(signals: SignalSummary[], sort: SignalSort): SignalSummary[] {
  return [...signals].sort((a, b) => {
    if (sort === "newest") {
      return b.createdAtMs - a.createdAtMs;
    }

    if (sort === "nearest") {
      return (a.distanceMiles ?? Number.MAX_SAFE_INTEGER) -
        (b.distanceMiles ?? Number.MAX_SAFE_INTEGER);
    }

    return a.startsAtMs - b.startsAtMs;
  });
}
