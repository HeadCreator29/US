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

// --- Global counter (first-party Vercel Serverless + KV) ---
// Same-origin endpoint, no keys or signup needed on the client:
//   GET  /api/visits                    -> { total, firstVisit, lastVisit }
//   POST /api/visits { action: 'hit' }  -> increments, returns updated stats
// Server timestamps are truly global (shared by every visitor). When the
// API is unreachable or KV is not bound yet (503 kv-missing), every helper
// below falls back to the local cache and never throws.
const GLOBAL_ENDPOINT = '/api/visits';
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

// Server payload shape from /api/visits.
interface ServerStats {
  total?: unknown;
  firstVisit?: unknown;
  lastVisit?: unknown;
  error?: unknown;
}

// Fetch JSON with a timeout. Throws on network error, timeout, or bad HTTP.
// The thrown Error carries a numeric `status` property when the server
// responded (e.g. 503 when KV is not bound yet).
async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
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

// Validate a server payload: numeric total plus string-or-null timestamps.
// Returns null when the payload is not a usable global answer.
function parseServerStats(json: unknown): VisitStats | null {
  if (typeof json !== 'object' || json === null) return null;
  const payload = json as ServerStats;
  const total = Number(payload.total);
  if (!Number.isFinite(total) || total < 0) return null;
  return {
    total: Math.floor(total),
    firstVisit: typeof payload.firstVisit === 'string' ? payload.firstVisit : null,
    lastVisit: typeof payload.lastVisit === 'string' ? payload.lastVisit : null,
  };
}

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

// Read the shared global stats. Uses the server first/last timestamps,
// which are now truly global (one counter for every visitor).
// Missing KV, network, or timeout errors fall back to local stats.
// Never throws.
export async function getGlobalStats(): Promise<GlobalStats> {
  const local = getStats();
  try {
    if (isOffline()) {
      return { ...local, source: 'local' };
    }
    const json = await fetchJson(GLOBAL_ENDPOINT);
    const server = parseServerStats(json);
    if (!server) {
      return { ...local, source: 'local' };
    }
    return { ...server, source: 'global' };
  } catch {
    return { ...local, source: 'local' };
  }
}

// Separate per-load guard for the global increment, so the sync local
// recordVisit() call in App.tsx does not consume it (and vice versa).
// Module state resets on every real page load, so legit visits count once.
let recordedGlobalThisLoad = false;

// Record one global visit. Updates the local cache synchronously first
// (instant feedback + offline cache), then POSTs a hit and merges the
// server values over local storage. Deduped per page load.
// Never throws — returns local stats on failure.
export async function recordGlobalVisit(): Promise<GlobalStats> {
  if (recordedGlobalThisLoad) {
    const current = getStats();
    return { ...current, source: 'local' };
  }
  recordedGlobalThisLoad = true;

  // Sync local update first: keeps firstVisit/lastVisit and offline cache.
  const local = recordVisit();

  try {
    if (isOffline()) {
      return { ...local, source: 'local' };
    }
    const json = await fetchJson(GLOBAL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'hit' }),
    });
    const server = parseServerStats(json);
    if (!server) {
      return { ...local, source: 'local' };
    }
    // Store the server values locally so the next instant load shows them.
    saveStats(server);
    return { ...server, source: 'global' };
  } catch {
    return { ...local, source: 'local' };
  }
}

// Reset the shared counter (password-protected server side), then clear
// the local cache. A 403 (wrong password) leaves the local cache intact
// so a rejected reset does not desync the admin view; network/KV failures
// fall back to a local-only reset. Never throws.
export async function resetGlobalStats(password?: string): Promise<VisitStats> {
  try {
    if (!isOffline()) {
      await fetchJson(GLOBAL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', password }),
      });
    }
  } catch (err) {
    // Wrong password: keep the local cache so the UI still shows the
    // server state on next load instead of a misleading zero.
    if (
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      (err as { status: unknown }).status === 403
    ) {
      return getStats();
    }
    // Fall through to local reset — global reset failed, still clear cache.
  }
  return resetStats();
}
