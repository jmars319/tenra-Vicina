import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, RefObject, SetStateAction } from "react";
import {
  DEFAULT_SIGNAL_DURATION_HOURS,
  type SignalComment,
  type VicinaProfile
} from "@vicina/domain";
import { defaultDraft, defaultFilters, defaultLocalProfile, legacySignalStorageKey, storageKey } from "./data";
import {
  clamp,
  expireSignal,
  filterSignals,
  findArea,
  findClosestAreaId,
  makeSignal,
  parseBoardImport,
  profileDraftFromProfile,
  replaceSignal,
  seedSignals
} from "./signalModel";
import type {
  DraftSignal,
  LocalProfileDraft,
  SignalFilters,
  SignalRecord,
  SignalViewMode,
  VicinaBoardExport,
  VicinaDesktopBoard
} from "./types";
import { readDesktopStore, readLegacyLocalStorage, writeDesktopStore } from "../lib/desktopStore";

export interface VicinaDesktopBoardState {
  blockedAuthorIds: string[];
  boardNotice: string;
  commentBody: string;
  draft: DraftSignal;
  editingSignalId: string | null;
  filters: SignalFilters;
  isEditingSignal: boolean;
  localProfile: VicinaProfile;
  profileDraft: LocalProfileDraft;
  reportedSignalIds: string[];
  reportedSignals: SignalRecord[];
  selectedArea: ReturnType<typeof findArea>;
  selectedSignal: SignalRecord | undefined;
  signals: SignalRecord[];
  viewMode: SignalViewMode;
  visibleSignals: SignalRecord[];
}

export interface VicinaDesktopBoardActions {
  exportBoard: () => void;
  handleAddComment: (event: FormEvent<HTMLFormElement>) => void;
  handleBlockAuthor: (signal: SignalRecord) => void;
  handleCancelSignalEdit: () => void;
  handleClearReport: (signalId: string) => void;
  handleDeleteSignal: (signal: SignalRecord) => void;
  handleEditSignal: (signal: SignalRecord) => void;
  handleReportSignal: (signal: SignalRecord) => void;
  handleSaveProfile: (event: FormEvent<HTMLFormElement>) => void;
  handleSaveSignal: (event: FormEvent<HTMLFormElement>) => void;
  handleToggleInterest: (signal: SignalRecord) => void;
  importBoard: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  selectReportedSignal: (signal: SignalRecord) => void;
  setCommentBody: Dispatch<SetStateAction<string>>;
  setDraft: Dispatch<SetStateAction<DraftSignal>>;
  setFilters: Dispatch<SetStateAction<SignalFilters>>;
  setProfileDraft: Dispatch<SetStateAction<LocalProfileDraft>>;
  setSelectedSignalId: Dispatch<SetStateAction<string>>;
  setViewMode: Dispatch<SetStateAction<SignalViewMode>>;
}

export interface VicinaDesktopBoardRefs {
  importInputRef: RefObject<HTMLInputElement | null>;
}

export function useVicinaDesktopBoard(): {
  actions: VicinaDesktopBoardActions;
  refs: VicinaDesktopBoardRefs;
  state: VicinaDesktopBoardState;
} {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [signals, setSignals] = useState<SignalRecord[]>(() => seedSignals(Date.now()));
  const [filters, setFilters] = useState<SignalFilters>(defaultFilters);
  const [selectedSignalId, setSelectedSignalId] = useState<string>(() => signals[0]?.id ?? "");
  const [draft, setDraft] = useState<DraftSignal>(defaultDraft);
  const [editingSignalId, setEditingSignalId] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [localProfile, setLocalProfile] = useState<VicinaProfile>(defaultLocalProfile);
  const [profileDraft, setProfileDraft] = useState<LocalProfileDraft>(() =>
    profileDraftFromProfile(defaultLocalProfile)
  );
  const [reportedSignalIds, setReportedSignalIds] = useState<string[]>([]);
  const [blockedAuthorIds, setBlockedAuthorIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<SignalViewMode>("list");
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [boardNotice, setBoardNotice] = useState("Local board saved on this device.");

  const selectedArea = findArea(filters.areaId);

  useEffect(() => {
    let cancelled = false;

    readDesktopStore<VicinaDesktopBoard>(storageKey)
      .then((storedBoard) => {
        if (cancelled) return;

        const legacySignals = readLegacyLocalStorage<SignalRecord[]>(legacySignalStorageKey);
        const nowMs = Date.now();

        if (storedBoard?.localProfile) {
          setLocalProfile(storedBoard.localProfile);
          setProfileDraft(profileDraftFromProfile(storedBoard.localProfile));
        }

        if (storedBoard?.signals.length) {
          const nextSignals = storedBoard.signals.map((signal) => expireSignal(signal, nowMs));
          setSignals(nextSignals);
          setReportedSignalIds(Array.isArray(storedBoard.reportedSignalIds) ? storedBoard.reportedSignalIds : []);
          setBlockedAuthorIds(Array.isArray(storedBoard.blockedAuthorIds) ? storedBoard.blockedAuthorIds : []);
          setSelectedSignalId(nextSignals[0]?.id ?? "");
        } else if (Array.isArray(legacySignals) && legacySignals.length > 0) {
          const nextSignals = legacySignals.map((signal) => expireSignal(signal, nowMs));
          setSignals(nextSignals);
          setSelectedSignalId(nextSignals[0]?.id ?? "");
        }

        setIsStoreReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setIsStoreReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isStoreReady) return;

    void writeDesktopStore(storageKey, {
      blockedAuthorIds,
      localProfile,
      reportedSignalIds,
      signals
    } satisfies VicinaDesktopBoard);
  }, [blockedAuthorIds, isStoreReady, localProfile, reportedSignalIds, signals]);

  const visibleSignals = useMemo(
    () =>
      filterSignals(signals, filters, selectedArea.coordinates).filter(
        (signal) => !blockedAuthorIds.includes(signal.authorId)
      ),
    [blockedAuthorIds, filters, selectedArea.coordinates, signals]
  );

  const selectedSignal =
    visibleSignals.find((signal) => signal.id === selectedSignalId) ?? visibleSignals[0];
  const reportedSignals = signals.filter((signal) => reportedSignalIds.includes(signal.id));
  const isEditingSignal = Boolean(editingSignalId);

  function persistSignals(nextSignals: SignalRecord[]) {
    setSignals(nextSignals);
  }

  function handleSaveSignal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = draft.title.trim();
    const description = draft.description.trim();
    if (!title || !description) {
      return;
    }

    const area = findArea(draft.areaId);
    const nowMs = Date.now();
    const durationHours = clamp(Number(draft.durationHours) || DEFAULT_SIGNAL_DURATION_HOURS, 1, 24);
    const existingSignal = editingSignalId
      ? signals.find((signal) => signal.id === editingSignalId && signal.authorId === localProfile.id)
      : null;

    if (existingSignal) {
      const nextSignal = makeSignal({
        ...existingSignal,
        title,
        description,
        category: draft.category,
        approximateLocationLabel: area.approximateLocationLabel,
        coordinates: area.coordinates,
        expiresAtMs: nowMs + durationHours * 60 * 60 * 1000,
        visibilityRadiusMiles: draft.radiusMiles,
        updatedAtMs: nowMs
      });
      const nextSignals = replaceSignal(signals, nextSignal);
      persistSignals(nextSignals);
      setSelectedSignalId(nextSignal.id);
      setEditingSignalId(null);
      setDraft(defaultDraft);
      return;
    }

    const signal = makeSignal({
      id: `desktop-signal-${nowMs}`,
      authorId: localProfile.id,
      authorDisplayName: localProfile.displayName,
      title,
      description,
      category: draft.category,
      approximateLocationLabel: area.approximateLocationLabel,
      coordinates: area.coordinates,
      startsAtMs: nowMs,
      expiresAtMs: nowMs + durationHours * 60 * 60 * 1000,
      visibilityRadiusMiles: draft.radiusMiles,
      createdAtMs: nowMs,
      updatedAtMs: nowMs
    });

    const nextSignals = [signal, ...signals];
    persistSignals(nextSignals);
    setSelectedSignalId(signal.id);
    setFilters((current) => ({ ...current, areaId: draft.areaId, category: "all", time: "all" }));
    setDraft(defaultDraft);
  }

  function handleEditSignal(signal: SignalRecord) {
    if (signal.authorId !== localProfile.id) {
      return;
    }

    setEditingSignalId(signal.id);
    setDraft({
      areaId: findClosestAreaId(signal.coordinates),
      category: signal.category,
      description: signal.description,
      durationHours: String(
        clamp(Math.ceil((signal.expiresAtMs - Date.now()) / (60 * 60 * 1000)), 1, 24)
      ),
      radiusMiles: signal.visibilityRadiusMiles,
      title: signal.title
    });
  }

  function handleCancelSignalEdit() {
    setEditingSignalId(null);
    setDraft(defaultDraft);
  }

  function handleDeleteSignal(signal: SignalRecord) {
    if (signal.authorId !== localProfile.id || !window.confirm("Delete this signal?")) {
      return;
    }

    const nextSignals = signals.filter((candidate) => candidate.id !== signal.id);
    persistSignals(nextSignals);
    setReportedSignalIds((current) => current.filter((id) => id !== signal.id));
    setSelectedSignalId(nextSignals[0]?.id ?? "");
    if (editingSignalId === signal.id) {
      handleCancelSignalEdit();
    }
  }

  function handleToggleInterest(signal: SignalRecord) {
    const hasInterest = signal.interestedUserIds.includes(localProfile.id);
    const nextSignal: SignalRecord = {
      ...signal,
      interestedUserIds: hasInterest
        ? signal.interestedUserIds.filter((id) => id !== localProfile.id)
        : [...signal.interestedUserIds, localProfile.id],
      updatedAtMs: Date.now()
    };

    persistSignals(replaceSignal(signals, nextSignal));
  }

  function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSignal) {
      return;
    }

    const body = commentBody.trim();
    if (!body) {
      return;
    }

    const nowMs = Date.now();
    const comment: SignalComment = {
      id: `desktop-comment-${nowMs}`,
      signalId: selectedSignal.id,
      authorId: localProfile.id,
      authorDisplayName: localProfile.displayName,
      body,
      contentStatus: "visible",
      createdAtMs: nowMs,
      updatedAtMs: nowMs
    };

    const nextSignal: SignalRecord = {
      ...selectedSignal,
      comments: [...selectedSignal.comments, comment],
      updatedAtMs: nowMs
    };

    persistSignals(replaceSignal(signals, nextSignal));
    setCommentBody("");
  }

  function handleReportSignal(signal: SignalRecord) {
    setReportedSignalIds((current) => (current.includes(signal.id) ? current : [...current, signal.id]));
  }

  function handleClearReport(signalId: string) {
    setReportedSignalIds((current) => current.filter((id) => id !== signalId));
  }

  function handleBlockAuthor(signal: SignalRecord) {
    if (signal.authorId === localProfile.id || blockedAuthorIds.includes(signal.authorId)) {
      return;
    }

    setBlockedAuthorIds((current) => (current.includes(signal.authorId) ? current : [...current, signal.authorId]));
  }

  function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const displayName = profileDraft.displayName.trim();
    if (!displayName) {
      return;
    }

    const nowMs = Date.now();
    const bio = profileDraft.bio.trim();
    const nextProfile: VicinaProfile = {
      id: localProfile.id,
      createdAtMs: localProfile.createdAtMs,
      ...(bio ? { bio } : {}),
      displayName,
      updatedAtMs: nowMs
    };

    setLocalProfile(nextProfile);
    setSignals((currentSignals) =>
      currentSignals.map((signal) =>
        signal.authorId === nextProfile.id
          ? {
              ...signal,
              authorDisplayName: nextProfile.displayName,
              comments: signal.comments.map((comment) =>
                comment.authorId === nextProfile.id
                  ? { ...comment, authorDisplayName: nextProfile.displayName }
                  : comment
              ),
              updatedAtMs: nowMs
            }
          : signal
      )
    );
  }

  function exportBoard() {
    const payload: VicinaBoardExport = {
      blockedAuthorIds,
      exportedAtMs: Date.now(),
      localProfile,
      reportedSignalIds,
      schema: "vicina-desktop-board:v1",
      signals
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `vicina-board-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBoardNotice("Board export created.");
  }

  async function importBoard(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const board = parseBoardImport(JSON.parse(await file.text()));
      const nowMs = Date.now();
      const nextSignals = board.signals.map((signal) => expireSignal(signal, nowMs));
      const nextProfile = board.localProfile ?? defaultLocalProfile;

      setSignals(nextSignals);
      setSelectedSignalId(nextSignals[0]?.id ?? "");
      setReportedSignalIds(board.reportedSignalIds);
      setBlockedAuthorIds(board.blockedAuthorIds);
      setLocalProfile(nextProfile);
      setProfileDraft(profileDraftFromProfile(nextProfile));
      setBoardNotice(`Imported ${nextSignals.length} signal(s).`);
    } catch (error) {
      setBoardNotice(error instanceof Error ? error.message : "Board import failed.");
    }
  }

  function selectReportedSignal(signal: SignalRecord) {
    setFilters((current) => ({
      ...current,
      areaId: findClosestAreaId(signal.coordinates),
      category: "all",
      time: "all"
    }));
    setSelectedSignalId(signal.id);
  }

  return {
    actions: {
      exportBoard,
      handleAddComment,
      handleBlockAuthor,
      handleCancelSignalEdit,
      handleClearReport,
      handleDeleteSignal,
      handleEditSignal,
      handleReportSignal,
      handleSaveProfile,
      handleSaveSignal,
      handleToggleInterest,
      importBoard,
      selectReportedSignal,
      setCommentBody,
      setDraft,
      setFilters,
      setProfileDraft,
      setSelectedSignalId,
      setViewMode
    },
    refs: {
      importInputRef
    },
    state: {
      blockedAuthorIds,
      boardNotice,
      commentBody,
      draft,
      editingSignalId,
      filters,
      isEditingSignal,
      localProfile,
      profileDraft,
      reportedSignalIds,
      reportedSignals,
      selectedArea,
      selectedSignal,
      signals,
      viewMode,
      visibleSignals
    }
  };
}
