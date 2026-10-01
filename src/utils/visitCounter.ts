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

// --- Global counter (countapi.mileshilliard.com, keyless) ---
// CounterAPI.dev V2 was abandoned: it requires signup + a dashboard
// workspace + API key and does NOT auto-create workspaces, so every
// request failed with 404 "Workspace not found" and the counter silently
// fell back to local-only. This provider needs no signup, no keys, no SDK:
// GET /hit/<key> creates the key on first use and increments it.
const GLOBAL_BASE = 'https://countapi.mileshilliard.com/api/v1';
const GLOBAL_KEY = 'privatearchive-us-visits';
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

// --- Global counter helpers ---

// Fetch JSON with a timeout. Throws on network error, timeout, or bad HTTP.
// The thrown Error carries a numeric `status` property when the server
// responded (e.g. 404 for a key that was never created).
async function fetchJson(path: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${GLOBAL_BASE}${path}`, { signal: controller.signal });
    if (!res.ok) {
      const err = new Error(`Global counter HTTP ${res.status}`) as Error & {
        status: number;
      };
      err.status = res.status;
      throw err;
    }
    return (await res.json()) as unknown;
  } finally {
    window.clearTimeout(timer);
  }
}

// The API returns { key, value } where value may be a number or a numeric
// string. Anything else (missing, NaN, infinite) means 0.
function parseValue(json: unknown): number {
  if (typeof json !== 'object' || json === null) return 0;
  const value = (json as { value?: unknown }).value;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : 0;
}

// Read the shared global total, merged with local first/last dates
// (the global service tracks counts only, no first/last timestamps).
// A missing key (404 or { error: 'Key not found' }) means the counter was
// never created yet — report 0 with source 'global', not a local fallback.
// Network/timeout errors fall back to local stats. Never throws.
export async function getGlobalStats(): Promise<GlobalStats> {
  const local = getStats();
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { ...local, source: 'local' };
    }
    const json = await fetchJson(`/get/${GLOBAL_KEY}`);
    if (
      typeof json === 'object' &&
      json !== null &&
      'error' in json &&
      !('value' in json)
    ) {
      // Key does not exist yet — legit zero, still a global answer.
      return {
        total: 0,
        firstVisit: local.firstVisit,
        lastVisit: local.lastVisit,
        source: 'global',
      };
    }
    return {
      total: parseValue(json),
      firstVisit: local.firstVisit,
      lastVisit: local.lastVisit,
      source: 'global',
    };
  } catch (err) {
    // 404 = key never created yet — legit zero, still a global answer.
    // Anything else (timeout, offline, CORS, adblock) falls back to local.
    if (
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      (err as { status: unknown }).status === 404
    ) {
      return {
        total: 0,
        firstVisit: local.firstVisit,
        lastVisit: local.lastVisit,
        source: 'global',
      };
    }
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
    const json = await fetchJson(`/hit/${GLOBAL_KEY}`);
    const merged: VisitStats = {
      total: parseValue(json),
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
      await fetchJson(`/set/${GLOBAL_KEY}?value=0`);
    }
  } catch {
    // Fall through to local reset — global reset failed, still clear cache.
  }
  return resetStats();
}
