import { isSupabaseConfigured, supabase } from './supabaseClient';

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

// --- Global counter (Supabase, the only global provider) ---
// Table `visits_us` holds a single row (id = 1):
//   SELECT total, first_visit, last_visit FROM visits_us WHERE id = 1
// Increments go through the `hit_visits_us()` RPC, which bumps the total,
// stamps last_visit (and first_visit once), and returns the updated row.
// Every helper below falls back to the local cache and never throws: when
// Supabase is unconfigured, offline, or errors (missing table, RLS denial,
// network failure), callers get local stats with source 'local'.
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

// --- Global counter helpers (Supabase only) ---

// Row shape from visits_us / hit_visits_us(). The RPC may return a single
// row object or a one-element array depending on how it is declared.
interface SupabaseVisitRow {
  total?: unknown;
  first_visit?: unknown;
  last_visit?: unknown;
}

// Validate a Supabase row: numeric total plus string-or-null timestamps.
// Maps snake_case columns to the camelCase VisitStats shape.
// Returns null when the row is not a usable global answer.
function parseSupabaseRow(row: unknown): VisitStats | null {
  if (Array.isArray(row)) {
    return row.length > 0 ? parseSupabaseRow(row[0]) : null;
  }
  if (typeof row !== 'object' || row === null) return null;
  const record = row as SupabaseVisitRow;
  const total = Number(record.total);
  if (!Number.isFinite(total) || total < 0) return null;
  return {
    total: Math.floor(total),
    firstVisit: typeof record.first_visit === 'string' ? record.first_visit : null,
    lastVisit: typeof record.last_visit === 'string' ? record.last_visit : null,
  };
}

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

// Read the shared global stats from the visits_us id = 1 row.
// Unconfigured/offline/error (missing table, RLS denial, network failure)
// falls back to local stats. Never throws.
export async function getGlobalStats(): Promise<GlobalStats> {
  const local = getStats();
  try {
    if (!isSupabaseConfigured() || isOffline()) {
      return { ...local, source: 'local' };
    }
    const { data, error } = await supabase
      .from('visits_us')
      .select('total,first_visit,last_visit')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) {
      return { ...local, source: 'local' };
    }
    const server = parseSupabaseRow(data);
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
// (instant feedback + offline cache), then calls hit_visits_us() and merges
// the returned server values over local storage. Deduped per page load.
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
    if (!isSupabaseConfigured() || isOffline()) {
      return { ...local, source: 'local' };
    }
    const { data, error } = await supabase.rpc('hit_visits_us');
    if (error || !data) {
      return { ...local, source: 'local' };
    }
    const server = parseSupabaseRow(data);
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

// Global reset is dashboard-only on purpose: there is no public reset
// endpoint, so this only clears the local cache. Never throws.
export async function resetGlobalStats(): Promise<VisitStats> {
  return resetStats();
}
