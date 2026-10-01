// First-party global visit counter (Vercel Serverless, Node runtime).
//
// Storage: Vercel KV (Redis) keys:
//   visits:total -> int
//   visits:first  -> ISO date string
//   visits:last   -> ISO date string
//
// Endpoints (same origin, JSON only):
//   GET  /api/visits            -> { total, firstVisit, lastVisit }
//   POST /api/visits {action:'hit'}            -> increments and returns updated stats
//   POST /api/visits {action:'reset', password} -> zeroes the counter (admin only)
//
// Fallback contract (the client relies on this):
//   - KV env missing locally (dev mode): GET returns 200 zeros with
//     header X-Counter-Fallback: kv-missing; POST returns 503 { error: 'kv-missing' }.
//   - KV throws at runtime: 503 { error: 'kv-missing' } (never 500).
//   - Wrong reset password: 403 { error: 'forbidden' }.

import { kv } from '@vercel/kv';

const TOTAL_KEY = 'visits:total';
const FIRST_KEY = 'visits:first';
const LAST_KEY = 'visits:last';

const FALLBACK_PASSWORD = 'forever';
const KV_MISSING = 'kv-missing';

interface VisitPayload {
  total: number;
  firstVisit: string | null;
  lastVisit: string | null;
}

const EMPTY_PAYLOAD: VisitPayload = {
  total: 0,
  firstVisit: null,
  lastVisit: null,
};

// Minimal serverless handler types (avoids a @vercel/node dependency).
interface ServerlessRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ServerlessResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ServerlessResponse;
  json: (body: unknown) => void;
}

function hasKvEnv(): boolean {
  const env = process.env as Record<string, string | undefined>;
  // @vercel/kv classic env vars, plus the Upstash-backed equivalents.
  return Boolean(
    (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) ||
      (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  );
}

function sendJson(
  res: ServerlessResponse,
  status: number,
  body: unknown,
  extraHeaders?: Record<string, string>,
): void {
  res.setHeader('Content-Type', 'application/json');
  if (extraHeaders) {
    for (const [name, value] of Object.entries(extraHeaders)) {
      res.setHeader(name, value);
    }
  }
  res.status(status).json(body);
}

function toVisitPayload(total: unknown, first: unknown, last: unknown): VisitPayload {
  const num = Number(total);
  return {
    total: Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0,
    firstVisit: typeof first === 'string' ? first : null,
    lastVisit: typeof last === 'string' ? last : null,
  };
}

function readBody(req: ServerlessRequest): { action?: unknown; password?: unknown } {
  const raw = req.body;
  if (raw && typeof raw === 'object') {
    return raw as { action?: unknown; password?: unknown };
  }
  if (typeof raw === 'string' && raw.length > 0) {
    try {
      return JSON.parse(raw) as { action?: unknown; password?: unknown };
    } catch {
      return {};
    }
  }
  return {};
}

// SETNX semantics for the first-visit timestamp: set only when absent,
// then return the effective value. Uses native setnx when available,
// otherwise falls back to get-then-set (a benign race for a counter).
async function getOrSetFirst(now: string): Promise<string> {
  const client = kv as unknown as Record<string, unknown>;
  try {
    if (typeof client.setnx === 'function') {
      const setnx = client.setnx as (key: string, value: string) => Promise<unknown>;
      await setnx(FIRST_KEY, now);
      const current = await kv.get<string>(FIRST_KEY);
      return typeof current === 'string' ? current : now;
    }
    if (typeof client.set === 'function') {
      const set = client.set as (
        key: string,
        value: string,
        opts?: Record<string, unknown>,
      ) => Promise<unknown>;
      try {
        await set(FIRST_KEY, now, { nx: true });
        const current = await kv.get<string>(FIRST_KEY);
        return typeof current === 'string' ? current : now;
      } catch {
        // Option not supported by this client — fall through to get-then-set.
      }
    }
  } catch {
    // Fall through to get-then-set below.
  }
  const existing = await kv.get<string>(FIRST_KEY);
  if (typeof existing === 'string' && existing.length > 0) return existing;
  await kv.set(FIRST_KEY, now);
  return now;
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse,
): Promise<void> {
  const method = (req.method ?? 'GET').toUpperCase();

  // Dev mode without KV bound: GET stays 200 with zeros so local `vercel dev`
  // and `npm run build` never break; the client treats it as a fallback.
  if (!hasKvEnv()) {
    if (method === 'GET') {
      sendJson(res, 200, { ...EMPTY_PAYLOAD }, { 'X-Counter-Fallback': KV_MISSING });
      return;
    }
    if (method === 'POST') {
      const body = readBody(req);
      if (body.action === 'reset') {
        const expected = process.env.ADMIN_PASSWORD || FALLBACK_PASSWORD;
        if (body.password !== expected) {
          sendJson(res, 403, { error: 'forbidden' });
          return;
        }
      }
      sendJson(
        res,
        503,
        { error: KV_MISSING },
        { 'X-Counter-Fallback': KV_MISSING },
      );
      return;
    }
    sendJson(res, 405, { error: 'method-not-allowed' });
    return;
  }

  try {
    if (method === 'GET') {
      const [total, first, last] = await Promise.all([
        kv.get<number>(TOTAL_KEY),
        kv.get<string>(FIRST_KEY),
        kv.get<string>(LAST_KEY),
      ]);
      if (total === null && first === null && last === null) {
        sendJson(res, 200, { ...EMPTY_PAYLOAD });
        return;
      }
      sendJson(res, 200, toVisitPayload(total, first, last));
      return;
    }

    if (method === 'POST') {
      const body = readBody(req);

      if (body.action === 'hit') {
        // Trust the client per-load guard; the server just increments.
        const now = new Date().toISOString();
        const total = await kv.incr(TOTAL_KEY);
        const first = await getOrSetFirst(now);
        await kv.set(LAST_KEY, now);
        sendJson(res, 200, { total: Number(total) || 0, firstVisit: first, lastVisit: now });
        return;
      }

      if (body.action === 'reset') {
        const expected = process.env.ADMIN_PASSWORD || FALLBACK_PASSWORD;
        if (body.password !== expected) {
          sendJson(res, 403, { error: 'forbidden' });
          return;
        }
        await Promise.all([
          kv.set(TOTAL_KEY, 0),
          kv.del(FIRST_KEY),
          kv.del(LAST_KEY),
        ]);
        sendJson(res, 200, { ...EMPTY_PAYLOAD });
        return;
      }

      sendJson(res, 400, { error: 'bad-request' });
      return;
    }

    sendJson(res, 405, { error: 'method-not-allowed' });
  } catch {
    // KV failure (not bound, unreachable, auth) is a client fallback signal,
    // never a 500. The client falls back to its local cache on 503.
    sendJson(res, 503, { error: KV_MISSING });
  }
}
