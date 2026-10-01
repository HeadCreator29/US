export interface VisitStats {
  total: number;
  lastVisit: string | null;
  firstVisit: string | null;
}

const STORAGE_KEY = 'privatearchive_visits_v4';

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
