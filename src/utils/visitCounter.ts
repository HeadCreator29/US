import { Counter } from 'counterapi';

export interface VisitStats {
  total: number;
  lastVisit: string | null;
  firstVisit: string | null;
}

export type StatsSource = 'global' | 'local';

export interface GlobalStats extends VisitStats {
  source: StatsSource;
}

const STORAGE_KEY = 'privatearchive_visits_v4';

// CounterAPI.dev V2 workspace. Public workspace, no accessToken needed.
// NOTE: if the 'privatearchive' workspace does not exist yet, the first
// counter.up('visits') call auto-creates both the workspace and the counter.
// That is expected behavior, not an error.
const WORKSPACE = 'privatearchive';
const COUNTER_NAME = 'visits';
const TIMEOUT_MS = 5000;

const EMPTY_STATS: VisitStats = {
  total: 0,
  lastVisit: null,
  firstVisit: null,
};

// Read stats from localStorage. Returns empty stats on any failure
// (private mode, disabled storage, corrupted payload).
export function getStats(): VisitStats {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATS };
    const parsed = JSON.parse(raw) as Partial<VisitStats>;
    return {
      total: typeof parsed.total === 'number' && parsed.total >= 0 ? parsed.total : 0,
      lastVisit: typeof parsed.lastVisit === 'string' ? parsed.lastVisit : null,
      firstVisit: typeof parsed.firstVisit === 'string' ? parsed.firstVisit : null,
    };
  } catch {
    return { ...EMPTY_STATS };
  }
}

// Persist stats to localStorage. Silently ignores storage errors.
function saveStats(stats: VisitStats): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage errors (private mode, disabled storage).
  }
}

// Guard against React StrictMode double-effect in dev (mount -> unmount
// -> remount calls recordVisit twice in the same page load). Module state
// resets on every real page load/reload, so legit visits still count once.
let recordedThisLoad = false;

// Record one visit. Increments total once per call, sets lastVisit to now
// and sets firstVisit only when absent. Safe for private mode.
export function recordVisit(): VisitStats {
  if (recordedThisLoad) return getStats();
  recordedThisLoad = true;
  try {
    const current = getStats();
    const now = new Date().toISOString();
    const next: VisitStats = {
      total: current.total + 1,
      lastVisit: now,
      firstVisit: current.firstVisit ?? now,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return { ...EMPTY_STATS };
  }
}

// Clear stored stats. Safe for private mode.
export function resetStats(): VisitStats {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors (private mode, disabled storage).
  }
  return { ...EMPTY_STATS };
}

// --- Global counter (CounterAPI.dev V2) ---

function createClient(): Counter {
  return new Counter({ workspace: WORKSPACE, timeout: TIMEOUT_MS });
}

// The API returns up_count / down_count (no plain "count" field).
// Global total = ups minus downs, clamped at zero.
// The reset response omits both fields, which means total 0.
function extractTotal(data: { up_count?: number; down_count?: number } | undefined): number {
  if (!data) return 0;
  const up = typeof data.up_count === 'number' ? data.up_count : 0;
  const down = typeof data.down_count === 'number' ? data.down_count : 0;
  return Math.max(0, up - down);
}

// Read the shared global total, merged with local first/last dates
// (the global service tracks counts only, no first/last timestamps).
// Falls back to local stats on error, timeout, or offline. Never throws.
export async function getGlobalStats(): Promise<GlobalStats> {
  const local = getStats();
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { ...local, source: 'local' };
    }
    const client = createClient();
    const res = await client.get(COUNTER_NAME);
    const total = extractTotal(res?.data);
    return {
      total,
      firstVisit: local.firstVisit,
      lastVisit: local.lastVisit,
      source: 'global',
    };
  } catch {
    return { ...local, source: 'local' };
  }
}

// Separate per-load guard for the global increment, so the sync local
// recordVisit() call in App.tsx does not consume it (and vice versa).
// Module state resets on every real page load, so legit visits count once.
let recordedGlobalThisLoad = false;

// Record one global visit. Updates the local cache synchronously first
// (instant feedback + first/last timestamps), then increments the shared
// counter and merges the global total over the local dates.
// Deduped per page load. Never throws — returns local stats on failure.
export async function recordGlobalVisit(): Promise<GlobalStats> {
  if (recordedGlobalThisLoad) {
    const current = getStats();
    return { ...current, source: 'local' };
  }
  recordedGlobalThisLoad = true;

  // Sync local update first: keeps firstVisit/lastVisit and offline cache.
  const local = recordVisit();

  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { ...local, source: 'local' };
    }
    const client = createClient();
    const res = await client.up(COUNTER_NAME);
    const total = extractTotal(res?.data);
    const merged: VisitStats = {
      total,
      firstVisit: local.firstVisit,
      lastVisit: local.lastVisit,
    };
    // Store the global total locally so the next instant load shows it.
    saveStats(merged);
    return { ...merged, source: 'global' };
  } catch {
    return { ...local, source: 'local' };
  }
}

// Reset the shared counter, then clear the local cache.
// Falls back to a local-only reset on error. Never throws.
export async function resetGlobalStats(): Promise<VisitStats> {
  try {
    if (typeof navigator === 'undefined' || navigator.onLine !== false) {
      const client = createClient();
      await client.reset(COUNTER_NAME);
    }
  } catch {
    // Fall through to local reset — global reset failed, still clear cache.
  }
  return resetStats();
}
