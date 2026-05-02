import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  CreateVenueMessageResponse,
  VicinaStateResponse,
  UpsertCheckInResponse
} from "@vicina/api-contracts";
import {
  createCheckInExpiry,
  isCheckInActive,
  PILOT_VENUES,
  type VicinaCheckIn,
  type VenueMessage
} from "@vicina/domain";
import type {
  ParsedCreateVenueMessageRequest,
  ParsedDeleteCheckInRequest,
  ParsedUpsertCheckInRequest
} from "@vicina/validation";

interface VicinaStore {
  checkIns: VicinaCheckIn[];
  messages: VenueMessage[];
}

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(STORE_DIR, "vicina-dev-store.json");
const MAX_MESSAGES_PER_VENUE = 50;

async function readStore(): Promise<VicinaStore> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    return JSON.parse(raw) as VicinaStore;
  } catch (error) {
    if (isMissingFileError(error)) {
      return { checkIns: seedCheckIns(), messages: seedMessages() };
    }

    throw error;
  }
}

async function writeStore(store: VicinaStore): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_FILE, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getVicinaState(): Promise<VicinaStateResponse> {
  const nowMs = Date.now();
  const store = await pruneExpiredCheckIns(await readStore(), nowMs);

  return {
    serverNowMs: nowMs,
    venues: PILOT_VENUES.map((venue) => ({
      ...venue,
      activeCheckIns: store.checkIns
        .filter((checkIn) => checkIn.venueId === venue.id)
        .sort((a, b) => a.expiresAtMs - b.expiresAtMs),
      messages: store.messages
        .filter((message) => message.venueId === venue.id)
        .sort((a, b) => a.createdAtMs - b.createdAtMs)
        .slice(-MAX_MESSAGES_PER_VENUE)
    }))
  };
}

export async function upsertCheckIn(
  request: ParsedUpsertCheckInRequest
): Promise<UpsertCheckInResponse> {
  const nowMs = Date.now();
  const store = await pruneExpiredCheckIns(await readStore(), nowMs);
  const note = request.note?.trim();
  const checkIn: VicinaCheckIn = {
    id: `checkin_${request.userId}_${request.venueId}`,
    venueId: request.venueId,
    userId: request.userId,
    displayName: request.displayName,
    intent: request.intent,
    createdAtMs: nowMs,
    expiresAtMs: createCheckInExpiry(nowMs)
  };

  if (note) {
    checkIn.note = note;
  }

  store.checkIns = [
    ...store.checkIns.filter((existing) => existing.userId !== request.userId),
    checkIn
  ];

  await writeStore(store);
  return { checkIn };
}

export async function deleteCheckIn(
  request: ParsedDeleteCheckInRequest
): Promise<{ removed: boolean }> {
  const store = await pruneExpiredCheckIns(await readStore(), Date.now());
  const nextCheckIns = store.checkIns.filter(
    (checkIn) => checkIn.userId !== request.userId
  );
  const removed = nextCheckIns.length !== store.checkIns.length;

  if (removed) {
    await writeStore({ ...store, checkIns: nextCheckIns });
  }

  return { removed };
}

export async function createVenueMessage(
  request: ParsedCreateVenueMessageRequest
): Promise<CreateVenueMessageResponse> {
  const nowMs = Date.now();
  const store = await pruneExpiredCheckIns(await readStore(), nowMs);
  const message: VenueMessage = {
    id: `msg_${nowMs}_${crypto.randomUUID()}`,
    venueId: request.venueId,
    userId: request.userId,
    displayName: request.displayName,
    body: request.body,
    createdAtMs: nowMs
  };

  const venueMessages = store.messages
    .filter((existing) => existing.venueId === request.venueId)
    .concat(message)
    .slice(-MAX_MESSAGES_PER_VENUE);

  store.messages = [
    ...store.messages.filter((existing) => existing.venueId !== request.venueId),
    ...venueMessages
  ];

  await writeStore(store);
  return { message };
}

async function pruneExpiredCheckIns(
  store: VicinaStore,
  nowMs: number
): Promise<VicinaStore> {
  const activeCheckIns = store.checkIns.filter((checkIn) =>
    isCheckInActive(checkIn, nowMs)
  );

  if (activeCheckIns.length !== store.checkIns.length) {
    const nextStore = { ...store, checkIns: activeCheckIns };
    await writeStore(nextStore);
    return nextStore;
  }

  return store;
}

function seedCheckIns(): VicinaCheckIn[] {
  const nowMs = Date.now();

  return [
    {
      id: "checkin_seed_arden_krankies-factory",
      venueId: "krankies-factory",
      userId: "seed_arden",
      displayName: "Arden",
      note: "Working near the windows for another hour.",
      intent: "open-to-chat",
      createdAtMs: nowMs - 18 * 60 * 1000,
      expiresAtMs: nowMs + 72 * 60 * 1000
    },
    {
      id: "checkin_seed_mina_incendiary",
      venueId: "incendiary",
      userId: "seed_mina",
      displayName: "Mina",
      note: "Open to a small after-work group.",
      intent: "looking-for-group",
      createdAtMs: nowMs - 35 * 60 * 1000,
      expiresAtMs: nowMs + 55 * 60 * 1000
    }
  ];
}

function seedMessages(): VenueMessage[] {
  const nowMs = Date.now();

  return [
    {
      id: "msg_seed_1",
      venueId: "krankies-factory",
      userId: "seed_arden",
      displayName: "Arden",
      body: "I grabbed the long table by the back wall.",
      createdAtMs: nowMs - 12 * 60 * 1000
    },
    {
      id: "msg_seed_2",
      venueId: "krankies-factory",
      userId: "seed_sam",
      displayName: "Sam",
      body: "Heading over after my 2:30 wraps.",
      createdAtMs: nowMs - 8 * 60 * 1000
    },
    {
      id: "msg_seed_3",
      venueId: "incendiary",
      userId: "seed_mina",
      displayName: "Mina",
      body: "Thinking 5:45 if anyone else is nearby.",
      createdAtMs: nowMs - 21 * 60 * 1000
    }
  ];
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
