import {
  addDays,
  bindRuntimeEnv,
  ensureSchema,
  hashSecret,
  monthRange,
  newToken,
  nowIso,
  runtimeEnv,
  type RuntimeEnv,
} from "../_shared/os-db";
import {
  CHAIR_COUNT,
  CLOSE_MIN,
  isPlanKey,
  OPEN_MIN,
  PLANS,
  SLOT_MINUTES,
  type PlanKey,
} from "../_shared/os-plans";

const COOKIE_PATH = "/chair-access-bh";
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;

type SessionUser = {
  id: string;
  name: string;
  access_code: string;
  role: "admin" | "member";
};

type BookingCandidate = {
  id: string;
  userId: string;
  membershipId: string | null;
  chairId: number;
  date: string;
  startMin: number;
  endMin: number;
  planKey: PlanKey;
  amountCents: number;
  createdBy: string;
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
    },
  });
}

function fail(message: string, status = 400): Response {
  return json({ error: message }, status);
}

function cookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

async function sessionUser(request: Request): Promise<SessionUser | null> {
  const token = cookieValue(request, "bh_session");
  if (!token) return null;
  const tokenHash = await hashSecret(token);
  const row = await runtimeEnv().DB.prepare(
    `SELECT u.id, u.name, u.access_code, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1`,
  ).bind(tokenHash, nowIso()).first<SessionUser>();
  return row ?? null;
}

function normalizeCode(value: unknown): string {
  return String(value ?? "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

function randomAccessCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return [...bytes].map((byte) => alphabet[byte % alphabet.length]).join("");
}

function requirePin(value: unknown): string {
  const pin = String(value ?? "").trim();
  if (!/^\d{6,8}$/.test(pin)) throw new Error("PIN must contain 6–8 digits.");
  return pin;
}

async function loginAttemptKey(request: Request, accessCode: string): Promise<string> {
  const clientAddress =
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown";
  return hashSecret(`login:${clientAddress}:${accessCode}`);
}

async function assertLoginAllowed(attemptKey: string): Promise<void> {
  const row = await runtimeEnv().DB.prepare(
    `SELECT failed_count, window_started_at, locked_until
     FROM login_attempts WHERE attempt_key = ?`,
  ).bind(attemptKey).first<{
    failed_count: number;
    window_started_at: string;
    locked_until: string | null;
  }>();
  if (!row) return;

  const now = Date.now();
  if (row.locked_until && Date.parse(row.locked_until) > now) {
    throw new Error("LOGIN_LOCKED");
  }
  if (Date.parse(row.window_started_at) + LOGIN_WINDOW_MS <= now) {
    await runtimeEnv().DB.prepare(
      "DELETE FROM login_attempts WHERE attempt_key = ?",
    ).bind(attemptKey).run();
  }
}

async function recordLoginFailure(attemptKey: string): Promise<boolean> {
  const db = runtimeEnv().DB;
  const row = await db.prepare(
    "SELECT failed_count, window_started_at FROM login_attempts WHERE attempt_key = ?",
  ).bind(attemptKey).first<{ failed_count: number; window_started_at: string }>();
  const now = Date.now();
  const inWindow =
    Boolean(row) && Date.parse(row!.window_started_at) + LOGIN_WINDOW_MS > now;
  const failedCount = inWindow ? Number(row!.failed_count) + 1 : 1;
  const windowStartedAt = inWindow ? row!.window_started_at : new Date(now).toISOString();
  const lockedUntil =
    failedCount >= LOGIN_MAX_FAILURES
      ? new Date(now + LOGIN_LOCK_MS).toISOString()
      : null;

  await db.prepare(
    `INSERT INTO login_attempts(
       attempt_key, failed_count, window_started_at, locked_until, updated_at
     ) VALUES(?, ?, ?, ?, ?)
     ON CONFLICT(attempt_key) DO UPDATE SET
       failed_count = excluded.failed_count,
       window_started_at = excluded.window_started_at,
       locked_until = excluded.locked_until,
       updated_at = excluded.updated_at`,
  ).bind(
    attemptKey,
    failedCount,
    windowStartedAt,
    lockedUntil,
    new Date(now).toISOString(),
  ).run();

  return Boolean(lockedUntil);
}

async function clearLoginFailures(attemptKey: string): Promise<void> {
  await runtimeEnv().DB.prepare(
    "DELETE FROM login_attempts WHERE attempt_key = ?",
  ).bind(attemptKey).run();
}

function validDate(value: unknown): string {
  const date = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Choose a valid date.");
  return date;
}

function validChair(value: unknown, allowAuto = false): number {
  const chair = Number(value);
  if (allowAuto && chair === 0) return 0;
  if (!Number.isInteger(chair) || chair < 1 || chair > CHAIR_COUNT) {
    throw new Error("Choose a chair from 1 to 5.");
  }
  return chair;
}

function slotNumbers(startMin: number, endMin: number): number[] {
  if (
    startMin < OPEN_MIN ||
    endMin > CLOSE_MIN ||
    startMin >= endMin ||
    startMin % SLOT_MINUTES !== 0 ||
    endMin % SLOT_MINUTES !== 0
  ) {
    throw new Error("Bookings must use 30-minute steps between 09:00 and 21:00.");
  }
  const slots: number[] = [];
  for (let minute = startMin; minute < endMin; minute += SLOT_MINUTES) {
    slots.push(minute);
  }
  return slots;
}

function keyFor(chair: number, date: string, slot: number): string {
  return `${chair}|${date}|${slot}`;
}

async function occupiedSlots(start: string, end: string): Promise<Set<string>> {
  const result = await runtimeEnv().DB.prepare(
    "SELECT chair_id, date, slot FROM booking_slots WHERE date >= ? AND date <= ?",
  ).bind(start, end).all<{ chair_id: number; date: string; slot: number }>();
  return new Set(
    (result.results ?? []).map((row) => keyFor(row.chair_id, row.date, row.slot)),
  );
}

function chairIsFree(
  occupied: Set<string>,
  chair: number,
  date: string,
  startMin: number,
  endMin: number,
): boolean {
  return slotNumbers(startMin, endMin).every(
    (slot) => !occupied.has(keyFor(chair, date, slot)),
  );
}

function reserveCandidate(occupied: Set<string>, candidate: BookingCandidate): void {
  for (const slot of slotNumbers(candidate.startMin, candidate.endMin)) {
    occupied.add(keyFor(candidate.chairId, candidate.date, slot));
  }
}

function bookingStatements(candidate: BookingCandidate): D1PreparedStatement[] {
  const db = runtimeEnv().DB;
  const createdAt = nowIso();
  const slots = slotNumbers(candidate.startMin, candidate.endMin);
  const slotValues = slots.map(() => "(?, ?, ?, ?)").join(", ");
  const slotParams = slots.flatMap((slot) => [
    candidate.id,
    candidate.chairId,
    candidate.date,
    slot,
  ]);
  return [
    db.prepare(
      `INSERT INTO bookings(
        id, user_id, membership_id, chair_id, date, start_min, end_min,
        plan_key, amount_cents, capacity, status, notes, created_by, created_at
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', '', ?, ?)`,
    ).bind(
      candidate.id,
      candidate.userId,
      candidate.membershipId,
      candidate.chairId,
      candidate.date,
      candidate.startMin,
      candidate.endMin,
      candidate.planKey,
      candidate.amountCents,
      (candidate.endMin - candidate.startMin) / 720,
      candidate.createdBy,
      createdAt,
    ),
    db.prepare(
      `INSERT INTO booking_slots(booking_id, chair_id, date, slot) VALUES ${slotValues}`,
    ).bind(...slotParams),
  ];
}

function auditStatement(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  detail: unknown,
): D1PreparedStatement {
  return runtimeEnv().DB.prepare(
    `INSERT INTO audit_log(id, actor_id, action, entity_type, entity_id, detail, created_at)
     VALUES(?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    crypto.randomUUID(),
    actorId,
    action,
    entityType,
    entityId,
    JSON.stringify(detail),
    nowIso(),
  );
}

async function appState(request: Request, user: SessionUser, month: string) {
  const { start, end } = monthRange(month);
  const db = runtimeEnv().DB;
  const [usersResult, membershipsResult, bookingResult, settingsResult, transactionResult] =
    await Promise.all([
      user.role === "admin"
        ? db.prepare(
            "SELECT id, name, access_code, role, active, created_at FROM users ORDER BY active DESC, name",
          ).all()
        : Promise.resolve({ results: [] }),
      db.prepare(
        `SELECT m.*, u.name AS user_name
         FROM memberships m JOIN users u ON u.id = m.user_id
         WHERE m.end_date >= ? AND m.start_date < ?
           AND (? = 'admin' OR m.user_id = ?)
         ORDER BY m.start_date DESC`,
      ).bind(start, end, user.role, user.id).all(),
      db.prepare(
        `SELECT b.*, u.name AS user_name
         FROM bookings b JOIN users u ON u.id = b.user_id
         WHERE b.date >= ? AND b.date < ? AND b.status = 'confirmed'
         ORDER BY b.date, b.chair_id, b.start_min`,
      ).bind(start, end).all<Record<string, unknown>>(),
      db.prepare("SELECT key, value FROM settings").all<{ key: string; value: string }>(),
      db.prepare(
        `SELECT t.*, u.name AS user_name
         FROM transactions t JOIN users u ON u.id = t.user_id
         WHERE t.due_date >= ? AND t.due_date < ?
           AND t.status != 'cancelled'
           AND (? = 'admin' OR t.user_id = ?)
         ORDER BY t.created_at DESC`,
      ).bind(start, end, user.role, user.id).all(),
    ]);

  const settings = Object.fromEntries(
    (settingsResult.results ?? []).map((row) => [row.key, row.value]),
  );
  const bookings = (bookingResult.results ?? []).map((booking) => ({
    ...booking,
    user_name:
      user.role === "admin" || booking.user_id === user.id
        ? booking.user_name
        : "Reserved",
  }));
  const transactions = transactionResult.results ?? [];
  const contracted = transactions.reduce(
    (sum, item) => sum + Number((item as Record<string, unknown>).amount_cents ?? 0),
    0,
  );
  const collected = transactions.reduce(
    (sum, item) =>
      sum +
      ((item as Record<string, unknown>).status === "paid"
        ? Number((item as Record<string, unknown>).amount_cents ?? 0)
        : 0),
    0,
  );
  const capacityUsed = bookings.reduce(
    (sum, booking) =>
      sum + Number((booking as Record<string, unknown>).capacity ?? 0),
    0,
  );
  const monthlyCost = Number(settings.monthly_cost_cents ?? "200000");
  const capacityTarget = Number(settings.capacity_target ?? "128");

  return {
    session: user,
    plans: Object.values(PLANS),
    users: usersResult.results ?? [],
    memberships: membershipsResult.results ?? [],
    bookings,
    transactions,
    settings: { monthlyCost, capacityTarget },
    finance:
      user.role === "admin"
        ? {
            contracted,
            collected,
            outstanding: contracted - collected,
            monthlyCost,
            projectedResult: contracted - monthlyCost,
            cashResult: collected - monthlyCost,
            capacityUsed,
            capacityTarget,
          }
        : null,
  };
}

export async function GET(request: Request) {
  try {
    await ensureSchema();
    const count = await runtimeEnv().DB.prepare(
      "SELECT COUNT(*) AS count FROM users",
    ).first<{ count: number }>();
    const setupRequired = Number(count?.count ?? 0) === 0;
    const user = setupRequired ? null : await sessionUser(request);
    if (!user) return json({ setupRequired, session: null });
    const month =
      new URL(request.url).searchParams.get("month") ??
      new Date().toISOString().slice(0, 7);
    return json({ setupRequired: false, ...(await appState(request, user, month)) });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load the system.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");
    const db = runtimeEnv().DB;

    if (action === "setup") {
      const count = await db.prepare("SELECT COUNT(*) AS count FROM users").first<{
        count: number;
      }>();
      if (Number(count?.count ?? 0) !== 0) return fail("Owner account already exists.");
      if (!runtimeEnv().SETUP_KEY || body.setupKey !== runtimeEnv().SETUP_KEY) {
        return fail("The setup key is not correct.", 403);
      }
      const name = String(body.name ?? "").trim();
      if (name.length < 2) return fail("Enter the owner name.");
      const accessCode = normalizeCode(body.accessCode);
      if (accessCode.length < 4) return fail("Access code must contain at least 4 characters.");
      const pin = requirePin(body.pin);
      const id = crypto.randomUUID();
      await db.prepare(
        `INSERT INTO users(id, name, access_code, pin_hash, role, active, created_at)
         VALUES(?, ?, ?, ?, 'admin', 1, ?)`,
      ).bind(id, name, accessCode, await hashSecret(pin), nowIso()).run();
      return json({ ok: true });
    }

    if (action === "login") {
      const accessCode = normalizeCode(body.accessCode);
      const pin = requirePin(body.pin);
      const attemptKey = await loginAttemptKey(request, accessCode);
      try {
        await assertLoginAllowed(attemptKey);
      } catch (error) {
        if (error instanceof Error && error.message === "LOGIN_LOCKED") {
          const response = fail(
            "Too many unsuccessful attempts. Try again in 15 minutes.",
            429,
          );
          response.headers.set("Retry-After", "900");
          return response;
        }
        throw error;
      }
      const account = await db.prepare(
        "SELECT id, pin_hash FROM users WHERE access_code = ? AND active = 1",
      ).bind(accessCode).first<{ id: string; pin_hash: string }>();
      if (!account || account.pin_hash !== (await hashSecret(pin))) {
        const locked = await recordLoginFailure(attemptKey);
        if (locked) {
          const response = fail(
            "Too many unsuccessful attempts. Try again in 15 minutes.",
            429,
          );
          response.headers.set("Retry-After", "900");
          return response;
        }
        return fail("Access code or PIN is incorrect.", 401);
      }
      await clearLoginFailures(attemptKey);
      const token = newToken();
      const expires = new Date(Date.now() + 30 * 86400000).toISOString();
      await db.prepare(
        "INSERT INTO sessions(token_hash, user_id, expires_at, created_at) VALUES(?, ?, ?, ?)",
      ).bind(await hashSecret(token), account.id, expires, nowIso()).run();
      const response = json({ ok: true });
      response.headers.set(
        "Set-Cookie",
        `bh_session=${token}; Path=${COOKIE_PATH}; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`,
      );
      return response;
    }

    if (action === "logout") {
      const token = cookieValue(request, "bh_session");
      if (token) {
        await db.prepare("DELETE FROM sessions WHERE token_hash = ?")
          .bind(await hashSecret(token))
          .run();
      }
      const response = json({ ok: true });
      response.headers.set(
        "Set-Cookie",
        `bh_session=; Path=${COOKIE_PATH}; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
      );
      return response;
    }

    const user = await sessionUser(request);
    if (!user) return fail("Sign in again.", 401);

    if (action === "create_member") {
      if (user.role !== "admin") return fail("Administrator access required.", 403);
      const name = String(body.name ?? "").trim();
      if (name.length < 2) return fail("Enter the member name.");
      const pin = requirePin(body.pin);
      let accessCode = normalizeCode(body.accessCode);
      if (!accessCode) accessCode = randomAccessCode();
      const id = crypto.randomUUID();
      await db.batch([
        db.prepare(
          `INSERT INTO users(id, name, access_code, pin_hash, role, active, created_at)
           VALUES(?, ?, ?, ?, 'member', 1, ?)`,
        ).bind(id, name, accessCode, await hashSecret(pin), nowIso()),
        auditStatement(user.id, "create", "user", id, { name, accessCode }),
      ]);
      return json({ ok: true, member: { id, name, accessCode } });
    }

    if (action === "assign_plan") {
      if (user.role !== "admin") return fail("Administrator access required.", 403);
      const userId = String(body.userId ?? "");
      const planKey = body.planKey;
      if (!isPlanKey(planKey) || PLANS[planKey].kind !== "membership") {
        return fail("Choose a monthly plan.");
      }
      const plan = PLANS[planKey];
      const startDate = validDate(body.startDate);
      const endDate = addDays(startDate, 29);
      const preferredChair = validChair(body.preferredChair ?? 0, true);
      const weekdays = Array.isArray(body.weekdays)
        ? body.weekdays.map(Number).filter((value) => value >= 0 && value <= 6)
        : [];
      const shiftKey = isPlanKey(body.shiftKey) ? body.shiftKey : "day-pass";
      const shift = PLANS[shiftKey];
      const startMin = plan.dedicated ? OPEN_MIN : shift.startMin;
      const endMin = plan.dedicated ? CLOSE_MIN : shift.endMin;
      if (!plan.dedicated && weekdays.length === 0) {
        return fail("Choose at least one working day.");
      }
      const candidateDates: string[] = [];
      for (let offset = 0; offset < 30; offset += 1) {
        const date = addDays(startDate, offset);
        if (
          plan.dedicated ||
          weekdays.includes(new Date(`${date}T12:00:00Z`).getUTCDay())
        ) {
          candidateDates.push(date);
        }
      }
      const dates = candidateDates.slice(0, plan.credits);
      if (dates.length < plan.credits) {
        return fail(`The selected weekdays provide only ${dates.length} of ${plan.credits} required days.`);
      }

      const occupied = await occupiedSlots(startDate, endDate);
      const membershipId = crypto.randomUUID();
      const candidates: BookingCandidate[] = [];

      if (plan.dedicated) {
        const chairs = preferredChair ? [preferredChair] : [1, 2, 3, 4, 5];
        const chair = chairs.find((chairId) =>
          dates.every((date) => chairIsFree(occupied, chairId, date, startMin, endMin)),
        );
        if (!chair) return fail("No single chair is free for the complete Pro term.");
        for (const date of dates) {
          const candidate: BookingCandidate = {
            id: crypto.randomUUID(),
            userId,
            membershipId,
            chairId: chair,
            date,
            startMin,
            endMin,
            planKey,
            amountCents: 0,
            createdBy: user.id,
          };
          reserveCandidate(occupied, candidate);
          candidates.push(candidate);
        }
      } else {
        const chairLoads = new Map<number, number>();
        for (const date of dates) {
          const chairs = preferredChair
            ? [preferredChair]
            : [1, 2, 3, 4, 5].sort(
                (a, b) => (chairLoads.get(a) ?? 0) - (chairLoads.get(b) ?? 0),
              );
          const chair = chairs.find((chairId) =>
            chairIsFree(occupied, chairId, date, startMin, endMin),
          );
          if (!chair) {
            return fail(`No chair is available on ${date} for the complete selected shift.`);
          }
          chairLoads.set(chair, (chairLoads.get(chair) ?? 0) + 1);
          const candidate: BookingCandidate = {
            id: crypto.randomUUID(),
            userId,
            membershipId,
            chairId: chair,
            date,
            startMin,
            endMin,
            planKey,
            amountCents: 0,
            createdBy: user.id,
          };
          reserveCandidate(occupied, candidate);
          candidates.push(candidate);
        }
      }

      const transactionId = crypto.randomUUID();
      const statements: D1PreparedStatement[] = [
        db.prepare(
          `INSERT INTO memberships(
            id, user_id, plan_key, start_date, end_date, credits_total,
            credits_used, price_cents, preferred_chair, status, created_at
          ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
        ).bind(
          membershipId,
          userId,
          planKey,
          startDate,
          endDate,
          plan.credits,
          plan.credits,
          plan.priceCents,
          preferredChair || null,
          nowIso(),
        ),
        db.prepare(
          `INSERT INTO transactions(
            id, user_id, kind, reference_id, description, amount_cents,
            status, due_date, paid_at, created_at
          ) VALUES(?, ?, 'membership', ?, ?, ?, 'due', ?, NULL, ?)`,
        ).bind(
          transactionId,
          userId,
          membershipId,
          plan.name,
          plan.priceCents,
          startDate,
          nowIso(),
        ),
      ];
      for (const candidate of candidates) statements.push(...bookingStatements(candidate));
      statements.push(
        auditStatement(user.id, "assign", "membership", membershipId, {
          userId,
          planKey,
          bookings: candidates.length,
        }),
      );
      await db.batch(statements);
      return json({ ok: true, membershipId, scheduled: candidates.length });
    }

    if (action === "create_booking") {
      const requestedUserId =
        user.role === "admin" ? String(body.userId ?? user.id) : user.id;
      const planKey = body.planKey;
      if (!isPlanKey(planKey) || PLANS[planKey].kind !== "payg") {
        return fail("Choose Hourly, Morning, Evening or Day Pass.");
      }
      const plan = PLANS[planKey];
      const date = validDate(body.date);
      const requestedChair = validChair(body.chairId ?? 0, true);
      let startMin = plan.startMin;
      let endMin = plan.endMin;
      let amountCents = plan.priceCents;
      if (planKey === "hourly") {
        startMin = Number(body.startMin);
        endMin = Number(body.endMin);
        const duration = endMin - startMin;
        slotNumbers(startMin, endMin);
        if (duration < 120 || duration > 240) {
          return fail("Hourly access must be between 2 and 4 hours.");
        }
        amountCents = Math.round((duration / 60) * plan.priceCents);
      }
      const occupied = await occupiedSlots(date, date);
      const chairs = requestedChair ? [requestedChair] : [1, 2, 3, 4, 5];
      const chair = chairs.find((chairId) =>
        chairIsFree(occupied, chairId, date, startMin, endMin),
      );
      if (!chair) return fail("No chair is free for that time.");
      const bookingId = crypto.randomUUID();
      const transactionId = crypto.randomUUID();
      const candidate: BookingCandidate = {
        id: bookingId,
        userId: requestedUserId,
        membershipId: null,
        chairId: chair,
        date,
        startMin,
        endMin,
        planKey,
        amountCents,
        createdBy: user.id,
      };
      await db.batch([
        ...bookingStatements(candidate),
        db.prepare(
          `INSERT INTO transactions(
            id, user_id, kind, reference_id, description, amount_cents,
            status, due_date, paid_at, created_at
          ) VALUES(?, ?, 'booking', ?, ?, ?, 'due', ?, NULL, ?)`,
        ).bind(
          transactionId,
          requestedUserId,
          bookingId,
          `${plan.name} · Chair ${chair}`,
          amountCents,
          date,
          nowIso(),
        ),
        auditStatement(user.id, "create", "booking", bookingId, {
          requestedUserId,
          planKey,
          date,
          chair,
        }),
      ]);
      return json({ ok: true, bookingId, chair });
    }

    if (action === "book_membership_day") {
      const membershipId = String(body.membershipId ?? "");
      const membership = await db.prepare(
        `SELECT * FROM memberships
         WHERE id = ? AND status = 'active' AND (? = 'admin' OR user_id = ?)`,
      ).bind(membershipId, user.role, user.id).first<Record<string, unknown>>();
      if (!membership) return fail("Active membership not found.", 404);
      if (Number(membership.credits_used) >= Number(membership.credits_total)) {
        return fail("No plan days remain.");
      }
      const date = validDate(body.date);
      if (date < String(membership.start_date) || date > String(membership.end_date)) {
        return fail("Date is outside this plan term.");
      }
      const requestedChair = validChair(body.chairId ?? 0, true);
      const occupied = await occupiedSlots(date, date);
      const chairs = requestedChair ? [requestedChair] : [1, 2, 3, 4, 5];
      const chair = chairs.find((chairId) =>
        chairIsFree(occupied, chairId, date, OPEN_MIN, CLOSE_MIN),
      );
      if (!chair) return fail("No chair is free for that day.");
      const bookingId = crypto.randomUUID();
      const candidate: BookingCandidate = {
        id: bookingId,
        userId: String(membership.user_id),
        membershipId,
        chairId: chair,
        date,
        startMin: OPEN_MIN,
        endMin: CLOSE_MIN,
        planKey: String(membership.plan_key) as PlanKey,
        amountCents: 0,
        createdBy: user.id,
      };
      await db.batch([
        ...bookingStatements(candidate),
        db.prepare(
          "UPDATE memberships SET credits_used = credits_used + 1 WHERE id = ?",
        ).bind(membershipId),
        auditStatement(user.id, "create", "booking", bookingId, {
          membershipId,
          date,
          chair,
        }),
      ]);
      return json({ ok: true, bookingId, chair });
    }

    if (action === "cancel_booking") {
      const bookingId = String(body.bookingId ?? "");
      const booking = await db.prepare(
        "SELECT * FROM bookings WHERE id = ? AND status = 'confirmed'",
      ).bind(bookingId).first<Record<string, unknown>>();
      if (!booking) return fail("Booking not found.", 404);
      if (user.role !== "admin" && booking.user_id !== user.id) {
        return fail("You can cancel only your own booking.", 403);
      }
      if (user.role !== "admin" && String(booking.date) < new Date().toISOString().slice(0, 10)) {
        return fail("Past bookings cannot be cancelled.");
      }
      const statements: D1PreparedStatement[] = [
        db.prepare("DELETE FROM booking_slots WHERE booking_id = ?").bind(bookingId),
        db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").bind(bookingId),
        db.prepare(
          "UPDATE transactions SET status = 'cancelled' WHERE kind = 'booking' AND reference_id = ? AND status = 'due'",
        ).bind(bookingId),
      ];
      if (booking.membership_id) {
        statements.push(
          db.prepare(
            "UPDATE memberships SET credits_used = MAX(credits_used - 1, 0) WHERE id = ?",
          ).bind(booking.membership_id),
        );
      }
      statements.push(
        auditStatement(user.id, "cancel", "booking", bookingId, {
          date: booking.date,
          chair: booking.chair_id,
        }),
      );
      await db.batch(statements);
      return json({ ok: true });
    }

    if (action === "mark_paid") {
      if (user.role !== "admin") return fail("Administrator access required.", 403);
      const transactionId = String(body.transactionId ?? "");
      await db.batch([
        db.prepare(
          "UPDATE transactions SET status = 'paid', paid_at = ? WHERE id = ? AND status = 'due'",
        ).bind(nowIso(), transactionId),
        auditStatement(user.id, "mark_paid", "transaction", transactionId, {}),
      ]);
      return json({ ok: true });
    }

    if (action === "update_settings") {
      if (user.role !== "admin") return fail("Administrator access required.", 403);
      const capacityTarget = Number(body.capacityTarget);
      const monthlyCost = Number(body.monthlyCost);
      if (!Number.isFinite(capacityTarget) || capacityTarget < 1 || capacityTarget > 150) {
        return fail("Capacity target must be between 1 and 150.");
      }
      if (!Number.isFinite(monthlyCost) || monthlyCost < 0) {
        return fail("Monthly cost must be zero or more.");
      }
      await db.batch([
        db.prepare(
          "INSERT INTO settings(key, value) VALUES('capacity_target', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        ).bind(String(capacityTarget)),
        db.prepare(
          "INSERT INTO settings(key, value) VALUES('monthly_cost_cents', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        ).bind(String(Math.round(monthlyCost * 100))),
        auditStatement(user.id, "update", "settings", "finance", {
          capacityTarget,
          monthlyCost,
        }),
      ]);
      return json({ ok: true });
    }

    if (action === "deactivate_member") {
      if (user.role !== "admin") return fail("Administrator access required.", 403);
      const memberId = String(body.memberId ?? "");
      await db.batch([
        db.prepare("UPDATE users SET active = 0 WHERE id = ? AND role = 'member'").bind(memberId),
        db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(memberId),
        auditStatement(user.id, "deactivate", "user", memberId, {}),
      ]);
      return json({ ok: true });
    }

    return fail("Unknown action.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "The request failed.";
    if (/UNIQUE|constraint/i.test(message)) {
      return fail("That chair was booked moments ago. Choose another time.", 409);
    }
    const status = /^(PIN must|Choose|Enter|Access code must|Capacity target|Monthly cost)/.test(
      message,
    )
      ? 400
      : 500;
    return fail(message, status);
  }
}

export const onRequestGet: PagesFunction<RuntimeEnv> = ({ request, env }) => {
  bindRuntimeEnv(env);
  return GET(request);
};

export const onRequestPost: PagesFunction<RuntimeEnv> = ({ request, env }) => {
  bindRuntimeEnv(env);
  return POST(request);
};
