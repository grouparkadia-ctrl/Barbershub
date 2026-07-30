"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { minutesLabel, money, type Plan, type PlanKey } from "./plans";

const API_URL = "/chair-access-bh/api";

type Session = {
  id: string;
  name: string;
  access_code: string;
  role: "admin" | "member";
};

type User = {
  id: string;
  name: string;
  access_code: string;
  role: string;
  active: number;
};

type Booking = {
  id: string;
  user_id: string;
  user_name: string;
  membership_id: string | null;
  chair_id: number;
  date: string;
  start_min: number;
  end_min: number;
  plan_key: PlanKey;
  capacity: number;
};

type Membership = {
  id: string;
  user_id: string;
  user_name: string;
  plan_key: PlanKey;
  start_date: string;
  end_date: string;
  credits_total: number;
  credits_used: number;
  status: string;
};

type Transaction = {
  id: string;
  user_id: string;
  user_name: string;
  description: string;
  amount_cents: number;
  status: string;
  due_date: string;
};

type Addon = {
  id: string;
  user_id: string;
  user_name: string;
  addon_key: "priority-calendar";
  start_date: string;
  end_date: string;
  price_cents: number;
  status: string;
};

type State = {
  setupRequired: boolean;
  session: Session | null;
  plans?: Plan[];
  users?: User[];
  memberships?: Membership[];
  bookings?: Booking[];
  transactions?: Transaction[];
  addons?: Addon[];
  settings?: { monthlyCost: number; capacityTarget: number };
  finance?: {
    contracted: number;
    collected: number;
    outstanding: number;
    monthlyCost: number;
    projectedResult: number;
    cashResult: number;
    capacityUsed: number;
    capacityTarget: number;
  } | null;
};

type ModalName =
  | "member"
  | "assign"
  | "addon"
  | "booking"
  | "plan-day"
  | "settings"
  | null;

const weekdayOptions = [
  ["Mon", 1],
  ["Tue", 2],
  ["Wed", 3],
  ["Thu", 4],
  ["Fri", 5],
  ["Sat", 6],
  ["Sun", 0],
] as const;

function localDate(date = new Date()): string {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 10);
}

function currentMonth(): string {
  return localDate().slice(0, 7);
}

function mondayOf(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return localDate(date);
}

function addDate(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDate(date);
}

function monthLabel(month: string): string {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
    new Date(`${month}-01T12:00:00`),
  );
}

function dayLabel(date: string): { weekday: string; day: string } {
  const value = new Date(`${date}T12:00:00`);
  return {
    weekday: new Intl.DateTimeFormat("en", { weekday: "short" }).format(value),
    day: new Intl.DateTimeFormat("en", { day: "2-digit", month: "short" }).format(
      value,
    ),
  };
}

async function requestAction(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await readApiResponse(response);
  if (!response.ok) throw new Error(String(data.error ?? "Request failed."));
  return data;
}

async function fetchState(month: string): Promise<State> {
  const response = await fetch(`${API_URL}?month=${month}`, { cache: "no-store" });
  const data = (await readApiResponse(response)) as State & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Unable to load.");
  return data;
}

async function readApiResponse(response: Response): Promise<Record<string, unknown>> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Member service is temporarily unavailable. Please try again.");
  }
  return (await response.json()) as Record<string, unknown>;
}

export default function BookingOS() {
  const [state, setState] = useState<State>({
    setupRequired: false,
    session: null,
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [month, setMonth] = useState(currentMonth());
  const [weekStart, setWeekStart] = useState(mondayOf(localDate()));
  const [modal, setModal] = useState<ModalName>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [prefill, setPrefill] = useState<{ date?: string; chair?: number }>({});

  const load = useCallback(async () => {
    try {
      const data = await fetchState(month);
      setState(data);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load.");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    let active = true;
    void fetchState(month)
      .then((data) => {
        if (!active) return;
        setState(data);
        setError("");
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [month]);

  async function run(
    action: string,
    payload: Record<string, unknown>,
    success: string,
  ) {
    setBusy(true);
    setError("");
    try {
      const result = await requestAction(action, payload);
      setModal(null);
      setToast(
        result.member
          ? `${success} Access code: ${(result.member as { accessCode: string }).accessCode}`
          : success,
      );
      await load();
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !state.session) {
    return (
      <main className="center-page">
        <div className="loading-mark">BH</div>
        <p>Opening the chair calendar…</p>
      </main>
    );
  }

  if (state.setupRequired) {
    return <SetupScreen busy={busy} error={error} run={run} />;
  }

  if (!state.session) {
    return <LoginScreen busy={busy} error={error} run={run} />;
  }

  const plans = state.plans ?? [];
  const users = state.users ?? [];
  const memberships = state.memberships ?? [];
  const bookings = state.bookings ?? [];
  const transactions = state.transactions ?? [];
  const addons = state.addons ?? [];
  const isAdmin = state.session.role === "admin";
  const planMap = Object.fromEntries(plans.map((plan) => [plan.key, plan])) as Record<
    PlanKey,
    Plan
  >;
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDate(weekStart, index),
  );
  const myMemberships = memberships.filter(
    (membership) => membership.user_id === state.session?.id,
  );

  async function logout() {
    setBusy(true);
    await requestAction("logout");
    setState({ setupRequired: false, session: null });
    setBusy(false);
  }

  function changeMonth(offset: number) {
    const date = new Date(`${month}-01T12:00:00`);
    date.setMonth(date.getMonth() + offset);
    const nextMonth = localDate(date).slice(0, 7);
    setMonth(nextMonth);
    setWeekStart(mondayOf(`${nextMonth}-01`));
  }

  function openBooking(date?: string, chair?: number) {
    setPrefill({ date, chair });
    setModal("booking");
  }

  return (
    <main className="os-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-block">BH</span>
          <div>
            <strong>Booking OS</strong>
            <small>5 chairs · 7 days · live finance</small>
          </div>
        </div>
        <div className="account">
          <span>
            {state.session.name}
            <small>{isAdmin ? "Administrator" : "Member"}</small>
          </span>
          <button className="quiet-button" onClick={() => void logout()} disabled={busy}>
            Sign out
          </button>
        </div>
      </header>

      {toast && (
        <button className="toast" onClick={() => setToast("")}>
          {toast}
        </button>
      )}
      {error && <div className="error-banner">{error}</div>}

      {isAdmin && state.finance && (
        <FinanceStrip
          finance={state.finance}
          onSettings={() => setModal("settings")}
        />
      )}

      {!isAdmin && (
        <MemberStrip
          memberships={myMemberships}
          transactions={transactions}
          addons={addons.filter((addon) => addon.user_id === state.session?.id)}
          plans={planMap}
        />
      )}

      <section className="action-row">
        <div className="month-nav">
          <button className="icon-button" onClick={() => changeMonth(-1)} aria-label="Previous month">
            ←
          </button>
          <strong>{monthLabel(month)}</strong>
          <button className="icon-button" onClick={() => changeMonth(1)} aria-label="Next month">
            →
          </button>
        </div>
        <div className="primary-actions">
          {isAdmin && (
            <>
              <button className="secondary-button" onClick={() => setModal("member")}>
                + Member
              </button>
              <button className="secondary-button" onClick={() => setModal("assign")}>
                Assign plan
              </button>
              <button className="secondary-button" onClick={() => setModal("addon")}>
                + Priority
              </button>
            </>
          )}
          {!isAdmin && myMemberships.some((item) => item.credits_used < item.credits_total) && (
            <button className="secondary-button" onClick={() => setModal("plan-day")}>
              Book plan day
            </button>
          )}
          <button className="primary-button" onClick={() => openBooking()}>
            + Quick booking
          </button>
        </div>
      </section>

      <section className="calendar-card">
        <div className="week-toolbar">
          <button className="quiet-button" onClick={() => setWeekStart(addDate(weekStart, -7))}>
            ← Previous
          </button>
          <span>
            Week of <strong>{dayLabel(weekStart).day}</strong>
          </span>
          <button className="quiet-button" onClick={() => setWeekStart(addDate(weekStart, 7))}>
            Next →
          </button>
        </div>
        <Calendar
          days={weekDays}
          bookings={bookings}
          planMap={planMap}
          isAdmin={isAdmin}
          currentUserId={state.session.id}
          onEmpty={openBooking}
          onCancel={(bookingId) =>
            void run("cancel_booking", { bookingId }, "Booking cancelled.")
          }
        />
      </section>

      {isAdmin && (
        <section className="admin-grid">
          <MemberList
            users={users}
            memberships={memberships}
            addons={addons}
            planMap={planMap}
          />
          <TransactionList
            transactions={transactions}
            onPaid={(transactionId) =>
              void run("mark_paid", { transactionId }, "Payment marked as paid.")
            }
          />
        </section>
      )}

      <PlanLegend plans={isAdmin ? plans : plans.filter((plan) => !plan.hidden)} />

      {modal === "member" && (
        <MemberModal
          busy={busy}
          close={() => setModal(null)}
          submit={(payload) => void run("create_member", payload, "Member created.")}
        />
      )}
      {modal === "assign" && (
        <AssignModal
          users={users.filter((user) => user.active && user.role === "member")}
          plans={plans.filter((plan) => plan.kind === "membership")}
          busy={busy}
          close={() => setModal(null)}
          submit={(payload) => void run("assign_plan", payload, "Plan assigned and calendar filled.")}
        />
      )}
      {modal === "addon" && (
        <AddonModal
          users={users.filter((user) => user.active && user.role === "member")}
          busy={busy}
          close={() => setModal(null)}
          submit={(payload) =>
            void run("assign_addon", payload, "Priority Calendar assigned.")
          }
        />
      )}
      {modal === "booking" && (
        <BookingModal
          users={isAdmin ? users.filter((user) => user.active) : [state.session as unknown as User]}
          plans={plans.filter((plan) => plan.kind === "payg")}
          prefill={prefill}
          busy={busy}
          close={() => setModal(null)}
          submit={(payload) => void run("create_booking", payload, "Booking created.")}
        />
      )}
      {modal === "plan-day" && (
        <PlanDayModal
          memberships={myMemberships.filter(
            (item) => item.credits_used < item.credits_total,
          )}
          planMap={planMap}
          busy={busy}
          close={() => setModal(null)}
          submit={(payload) =>
            void run("book_membership_day", payload, "Plan day booked.")
          }
        />
      )}
      {modal === "settings" && state.settings && (
        <SettingsModal
          settings={state.settings}
          busy={busy}
          close={() => setModal(null)}
          submit={(payload) =>
            void run("update_settings", payload, "Financial settings updated.")
          }
        />
      )}
    </main>
  );
}

function SetupScreen({
  busy,
  error,
  run,
}: {
  busy: boolean;
  error: string;
  run: (action: string, payload: Record<string, unknown>, success: string) => Promise<void>;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    void run("setup", values, "Owner account created. Sign in.");
  }
  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="eyebrow">FIRST-TIME SETUP</span>
        <h1>Start the BARBERS HUB booking system.</h1>
        <p>Create the owner login. The setup key is supplied separately and works once.</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={submit} className="stack-form">
          <label>Owner name<input name="name" required autoComplete="name" /></label>
          <label>Access code<input name="accessCode" required placeholder="EDGARS" /></label>
          <label>PIN<input name="pin" required inputMode="numeric" pattern="\d{6,8}" minLength={6} maxLength={8} autoComplete="new-password" /></label>
          <label>One-time setup key<input name="setupKey" required autoComplete="off" /></label>
          <button className="primary-button wide" disabled={busy}>Create owner access</button>
        </form>
      </section>
    </main>
  );
}

function LoginScreen({
  busy,
  error,
  run,
}: {
  busy: boolean;
  error: string;
  run: (action: string, payload: Record<string, unknown>, success: string) => Promise<void>;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    void run("login", values, "Signed in.");
  }
  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="eyebrow">MEMBER ACCESS</span>
        <h1>Your chair. Your schedule.</h1>
        <p>Use the private access code and PIN provided by BARBERS HUB.</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={submit} className="stack-form">
          <label>Access code<input name="accessCode" required autoCapitalize="characters" /></label>
          <label>PIN<input name="pin" required inputMode="numeric" pattern="\d{6,8}" minLength={6} maxLength={8} autoComplete="current-password" /></label>
          <button className="primary-button wide" disabled={busy}>Open calendar</button>
        </form>
        <small className="privacy-note">No paid account or external app is required.</small>
      </section>
    </main>
  );
}

function FinanceStrip({
  finance,
  onSettings,
}: {
  finance: NonNullable<State["finance"]>;
  onSettings: () => void;
}) {
  const occupancy = Math.min(
    100,
    Math.round((finance.capacityUsed / finance.capacityTarget) * 100),
  );
  const cards = [
    ["Chair days", `${finance.capacityUsed.toFixed(1)} / ${finance.capacityTarget}`, `${occupancy}% reserved`],
    ["Contracted", money(finance.contracted), "Paid + due"],
    ["Collected", money(finance.collected), `${money(finance.outstanding)} outstanding`],
    ["Projected result", money(finance.projectedResult), `${money(finance.monthlyCost)} monthly costs`],
    ["Cash result", money(finance.cashResult), "Collected minus monthly costs"],
  ];
  return (
    <section className="finance-strip">
      {cards.map(([label, value, note], index) => (
        <article className={index === 3 ? "metric-card highlight" : "metric-card"} key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <small>{note}</small>
          {index === 0 && (
            <div className="progress"><i style={{ width: `${occupancy}%` }} /></div>
          )}
        </article>
      ))}
      <button className="settings-button" onClick={onSettings} aria-label="Financial settings">⚙</button>
    </section>
  );
}

function MemberStrip({
  memberships,
  transactions,
  addons,
  plans,
}: {
  memberships: Membership[];
  transactions: Transaction[];
  addons: Addon[];
  plans: Record<PlanKey, Plan>;
}) {
  const active = memberships.find((membership) => membership.status === "active");
  const priority = addons.find((addon) => addon.status === "active");
  const due = transactions
    .filter((transaction) => transaction.status === "due")
    .reduce((sum, transaction) => sum + transaction.amount_cents, 0);
  return (
    <section className="member-strip">
      <div>
        <span>Active plan</span>
        <strong>{active ? plans[active.plan_key]?.name : "Pay as you go"}</strong>
      </div>
      <div>
        <span>Remaining plan days</span>
        <strong>{active ? active.credits_total - active.credits_used : "—"}</strong>
      </div>
      <div>
        <span>Calendar access</span>
        <strong>{priority ? "Priority · 30 days" : "Standard · 21 days"}</strong>
      </div>
      <div>
        <span>Amount due</span>
        <strong>{money(due)}</strong>
      </div>
    </section>
  );
}

function Calendar({
  days,
  bookings,
  planMap,
  isAdmin,
  currentUserId,
  onEmpty,
  onCancel,
}: {
  days: string[];
  bookings: Booking[];
  planMap: Record<PlanKey, Plan>;
  isAdmin: boolean;
  currentUserId: string;
  onEmpty: (date: string, chair: number) => void;
  onCancel: (bookingId: string) => void;
}) {
  return (
    <>
      <div className="calendar-grid desktop-calendar">
        <div className="corner-cell">CHAIR</div>
        {days.map((day) => {
          const label = dayLabel(day);
          return (
            <div className={day === localDate() ? "day-head today" : "day-head"} key={day}>
              <span>{label.weekday}</span><strong>{label.day}</strong>
            </div>
          );
        })}
        {[1, 2, 3, 4, 5].map((chair) => (
          <div className="calendar-row" key={chair}>
            <div className="chair-label"><span>{chair}</span><small>Chair</small></div>
            {days.map((day) => {
              const items = bookings.filter(
                (booking) => booking.date === day && booking.chair_id === chair,
              );
              return (
                <div
                  className="calendar-cell"
                  key={`${chair}-${day}`}
                  onDoubleClick={() => isAdmin && onEmpty(day, chair)}
                >
                  {items.length === 0 ? (
                    <button
                      className="empty-slot"
                      onClick={() => isAdmin && onEmpty(day, chair)}
                      aria-label={`Book chair ${chair} on ${day}`}
                    >
                      {isAdmin ? "+" : "Free"}
                    </button>
                  ) : (
                    items.map((booking) => {
                      const plan = planMap[booking.plan_key];
                      const visiblePlan = isAdmin || !plan?.hidden ? plan : undefined;
                      const canCancel = isAdmin || booking.user_id === currentUserId;
                      return (
                        <article
                          className="booking-chip"
                          key={booking.id}
                          style={{ borderLeftColor: visiblePlan?.color ?? "#64748b" }}
                        >
                          <strong>{booking.user_name}</strong>
                          <span>{minutesLabel(booking.start_min)}–{minutesLabel(booking.end_min)}</span>
                          <small>{visiblePlan?.shortName ?? (isAdmin ? booking.plan_key : "Reserved")}</small>
                          {canCancel && (
                            <button
                              onClick={() =>
                                window.confirm("Cancel this booking and release the chair?") &&
                                onCancel(booking.id)
                              }
                              aria-label="Cancel booking"
                            >
                              ×
                            </button>
                          )}
                        </article>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mobile-calendar">
        {days.map((day) => {
          const label = dayLabel(day);
          const dayBookings = bookings.filter((booking) => booking.date === day);
          return (
            <section className="mobile-day" key={day}>
              <header><strong>{label.weekday}, {label.day}</strong><span>{dayBookings.length} bookings</span></header>
              {[1, 2, 3, 4, 5].map((chair) => {
                const items = dayBookings.filter((booking) => booking.chair_id === chair);
                return (
                  <div className="mobile-chair" key={chair}>
                    <b>Chair {chair}</b>
                    {items.length ? items.map((booking) => (
                      <button
                        key={booking.id}
                        className="mobile-booking"
                        style={{
                          borderColor:
                            isAdmin || !planMap[booking.plan_key]?.hidden
                              ? planMap[booking.plan_key]?.color
                              : "#64748b",
                        }}
                        onClick={() =>
                          (isAdmin || booking.user_id === currentUserId) &&
                          window.confirm("Cancel this booking and release the chair?") &&
                          onCancel(booking.id)
                        }
                      >
                        {booking.user_name} · {minutesLabel(booking.start_min)}–{minutesLabel(booking.end_min)}
                      </button>
                    )) : (
                      <button className="mobile-free" onClick={() => isAdmin && onEmpty(day, chair)}>
                        Free
                      </button>
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </>
  );
}

function MemberList({
  users,
  memberships,
  addons,
  planMap,
}: {
  users: User[];
  memberships: Membership[];
  addons: Addon[];
  planMap: Record<PlanKey, Plan>;
}) {
  return (
    <section className="table-card">
      <header><div><span>MEMBERS</span><h2>Access & plans</h2></div><b>{users.filter((u) => u.active).length}</b></header>
      <div className="data-list">
        {users.filter((user) => user.role === "member").map((user) => {
          const membership = memberships.find(
            (item) => item.user_id === user.id && item.status === "active",
          );
          const priority = addons.some(
            (item) => item.user_id === user.id && item.status === "active",
          );
          return (
            <article key={user.id}>
              <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
              <div><strong>{user.name}</strong><small>Code {user.access_code}</small></div>
              <span className="plan-pill">
                {membership ? planMap[membership.plan_key]?.shortName : "PAYG"}
                {priority ? " · PRIORITY" : ""}
              </span>
            </article>
          );
        })}
        {!users.some((user) => user.role === "member") && <p className="empty-copy">Add the first member to begin.</p>}
      </div>
    </section>
  );
}

function TransactionList({
  transactions,
  onPaid,
}: {
  transactions: Transaction[];
  onPaid: (id: string) => void;
}) {
  return (
    <section className="table-card">
      <header><div><span>FINANCE</span><h2>Payments</h2></div><b>{transactions.length}</b></header>
      <div className="data-list">
        {transactions.slice(0, 10).map((transaction) => (
          <article key={transaction.id}>
            <div className={transaction.status === "paid" ? "status-dot paid" : "status-dot"} />
            <div><strong>{transaction.user_name}</strong><small>{transaction.description}</small></div>
            <strong>{money(transaction.amount_cents)}</strong>
            {transaction.status === "due" ? (
              <button className="mini-button" onClick={() => onPaid(transaction.id)}>Mark paid</button>
            ) : <span className="paid-label">Paid</span>}
          </article>
        ))}
        {transactions.length === 0 && <p className="empty-copy">Transactions appear as plans and bookings are added.</p>}
      </div>
    </section>
  );
}

function PlanLegend({ plans }: { plans: Plan[] }) {
  return (
    <section className="plan-legend">
      {plans.map((plan) => (
        <div key={plan.key}><i style={{ background: plan.color }} /><span>{plan.name}</span><strong>{plan.key === "hourly" ? "€10/h" : money(plan.priceCents)}</strong></div>
      ))}
    </section>
  );
}

function Modal({
  title,
  intro,
  close,
  children,
}: {
  title: string;
  intro: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={close}>
      <section className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span>BOOKING OS</span><h2>{title}</h2><p>{intro}</p></div><button onClick={close} aria-label="Close">×</button></header>
        {children}
      </section>
    </div>
  );
}

function MemberModal({
  busy,
  close,
  submit,
}: {
  busy: boolean;
  close: () => void;
  submit: (payload: Record<string, unknown>) => void;
}) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(Object.fromEntries(new FormData(event.currentTarget)));
  }
  return (
    <Modal title="Add member" intro="Create the private access code and PIN you will send to the barber." close={close}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>Member name<input name="name" required /></label>
        <label>Access code <small>Leave blank to generate</small><input name="accessCode" /></label>
        <label>Temporary PIN<input name="pin" required inputMode="numeric" pattern="\d{6,8}" minLength={6} maxLength={8} autoComplete="new-password" /></label>
        <button className="primary-button wide" disabled={busy}>Create member</button>
      </form>
    </Modal>
  );
}

function AssignModal({
  users,
  plans,
  busy,
  close,
  submit,
}: {
  users: User[];
  plans: Plan[];
  busy: boolean;
  close: () => void;
  submit: (payload: Record<string, unknown>) => void;
}) {
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit({ ...Object.fromEntries(new FormData(event.currentTarget)), weekdays: selectedDays });
  }
  return (
    <Modal title="Assign plan" intro="Choose once. The system finds free chairs and fills the complete 30-day schedule." close={close}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>Member<select name="userId" required>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
        <label>Plan<select name="planKey" required>{plans.map((plan) => <option key={plan.key} value={plan.key}>{plan.name} · {money(plan.priceCents)}</option>)}</select></label>
        <div className="form-row">
          <label>Start date<input name="startDate" type="date" defaultValue={localDate()} required /></label>
          <label>Chair<select name="preferredChair" defaultValue="0"><option value="0">Auto assign</option>{[1,2,3,4,5].map((chair) => <option value={chair} key={chair}>Chair {chair}</option>)}</select></label>
        </div>
        <label>Daily time<select name="shiftKey" defaultValue="day-pass"><option value="day-pass">09:00–21:00</option><option value="morning">09:00–15:00</option><option value="evening">15:00–21:00</option></select></label>
        <fieldset><legend>Working days</legend><div className="weekday-picker">{weekdayOptions.map(([label, value]) => <button type="button" key={value} className={selectedDays.includes(value) ? "selected" : ""} onClick={() => setSelectedDays((days) => days.includes(value) ? days.filter((day) => day !== value) : [...days, value])}>{label}</button>)}</div></fieldset>
        <button className="primary-button wide" disabled={busy || users.length === 0}>Assign and fill calendar</button>
      </form>
    </Modal>
  );
}

function AddonModal({
  users,
  busy,
  close,
  submit,
}: {
  users: User[];
  busy: boolean;
  close: () => void;
  submit: (payload: Record<string, unknown>) => void;
}) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(Object.fromEntries(new FormData(event.currentTarget)));
  }
  return (
    <Modal
      title="Assign Priority Calendar"
      intro="Adds a 30-day booking window for €50. Standard members can book 21 days ahead. Maximum three active Priority members."
      close={close}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <label>
          Member
          <select name="userId" required>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </label>
        <label>
          Start date
          <input name="startDate" type="date" defaultValue={localDate()} required />
        </label>
        <p className="form-note">
          Priority gives earlier access to the same available calendar. It does not add plan
          days, reserve a specific chair, or override confirmed bookings.
        </p>
        <button className="primary-button wide" disabled={busy || users.length === 0}>
          Add Priority · €50
        </button>
      </form>
    </Modal>
  );
}

function BookingModal({
  users,
  plans,
  prefill,
  busy,
  close,
  submit,
}: {
  users: User[];
  plans: Plan[];
  prefill: { date?: string; chair?: number };
  busy: boolean;
  close: () => void;
  submit: (payload: Record<string, unknown>) => void;
}) {
  const [planKey, setPlanKey] = useState<PlanKey>("day-pass");
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(Object.fromEntries(new FormData(event.currentTarget)));
  }
  return (
    <Modal
      title="Quick booking"
      intro="Book hourly access, a shift, a Day Pass or an extension. Extensions need a regular booking on the same day and 24 hours' notice."
      close={close}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <label>Member<select name="userId" required>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
        <label>Model<select name="planKey" value={planKey} onChange={(event) => setPlanKey(event.target.value as PlanKey)}>{plans.map((plan) => <option key={plan.key} value={plan.key}>{plan.name} · {plan.key === "hourly" ? "€10/hour" : money(plan.priceCents)}</option>)}</select></label>
        <div className="form-row">
          <label>Date<input name="date" type="date" defaultValue={prefill.date ?? localDate()} required /></label>
          <label>Chair<select name="chairId" defaultValue={String(prefill.chair ?? 0)}><option value="0">Auto assign</option>{[1,2,3,4,5].map((chair) => <option value={chair} key={chair}>Chair {chair}</option>)}</select></label>
        </div>
        {planKey === "hourly" && (
          <div className="form-row">
            <label>Start<select name="startMin" defaultValue="540">{Array.from({length:17},(_,i)=>540+i*30).map((minute)=><option value={minute} key={minute}>{minutesLabel(minute)}</option>)}</select></label>
            <label>End<select name="endMin" defaultValue="660">{Array.from({length:17},(_,i)=>660+i*30).filter((minute)=>minute<=1260).map((minute)=><option value={minute} key={minute}>{minutesLabel(minute)}</option>)}</select></label>
          </div>
        )}
        {(planKey === "early-extension" || planKey === "late-extension") && (
          <p className="form-note">
            The extension automatically uses the chair from the member&apos;s existing
            booking. Book early and late separately when both are needed (€40 total).
          </p>
        )}
        <button className="primary-button wide" disabled={busy}>Book and add payment</button>
      </form>
    </Modal>
  );
}

function PlanDayModal({
  memberships,
  planMap,
  busy,
  close,
  submit,
}: {
  memberships: Membership[];
  planMap: Record<PlanKey, Plan>;
  busy: boolean;
  close: () => void;
  submit: (payload: Record<string, unknown>) => void;
}) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(Object.fromEntries(new FormData(event.currentTarget)));
  }
  return (
    <Modal
      title="Book a plan day"
      intro="Choose a date and the system will assign an available chair. Standard access opens 21 days ahead; Priority opens 30 days ahead."
      close={close}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <label>Plan<select name="membershipId">{memberships.map((membership) => <option key={membership.id} value={membership.id}>{planMap[membership.plan_key]?.name} · {membership.credits_total-membership.credits_used} remaining</option>)}</select></label>
        <div className="form-row">
          <label>Date<input name="date" type="date" defaultValue={localDate()} required /></label>
          <label>Chair<select name="chairId" defaultValue="0"><option value="0">Auto assign</option>{[1,2,3,4,5].map((chair) => <option value={chair} key={chair}>Chair {chair}</option>)}</select></label>
        </div>
        <button className="primary-button wide" disabled={busy}>Book plan day</button>
      </form>
    </Modal>
  );
}

function SettingsModal({
  settings,
  busy,
  close,
  submit,
}: {
  settings: { monthlyCost: number; capacityTarget: number };
  busy: boolean;
  close: () => void;
  submit: (payload: Record<string, unknown>) => void;
}) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(Object.fromEntries(new FormData(event.currentTarget)));
  }
  return (
    <Modal title="Financial controls" intro="These two numbers drive the live occupancy and operating-result cards." close={close}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>Monthly chair-day target<input name="capacityTarget" type="number" min="1" max="150" defaultValue={settings.capacityTarget} required /></label>
        <label>Monthly operating costs (€)<input name="monthlyCost" type="number" min="0" step="1" defaultValue={settings.monthlyCost / 100} required /></label>
        <button className="primary-button wide" disabled={busy}>Save controls</button>
      </form>
    </Modal>
  );
}
