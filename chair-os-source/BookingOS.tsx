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
  archived: number;
  history_count: number;
  billing_type: "company" | "self_employed" | "individual" | "other";
  legal_name: string;
  registration_number: string;
  legal_address: string;
  email: string;
  phone: string;
  agreement_number: string;
  service_description: string;
  billing_notes: string;
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
  amount_cents: number;
  capacity: number;
  notes: string;
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
  price_cents: number;
  preferred_chair: number | null;
  status: string;
};

type Transaction = {
  id: string;
  user_id: string;
  user_name: string;
  kind: string;
  reference_id: string;
  description: string;
  amount_cents: number;
  base_amount_cents: number;
  adjustment_cents: number;
  net_amount_cents: number;
  pending_adjustment_cents: number;
  status: string;
  due_date: string;
};

type Adjustment = {
  id: string;
  user_id: string;
  user_name: string;
  transaction_id: string;
  transaction_description: string;
  source_user_id: string | null;
  source_user_name: string | null;
  adjustment_type: string;
  calculation_type: string;
  rate_bps: number | null;
  basis_cents: number;
  amount_cents: number;
  description: string;
  effective_date: string;
  status: "active" | "pending";
};

type Settings = {
  monthlyCost: number;
  capacityTarget: number;
  invoiceDueDays: number;
  defaultReferralRate: number;
  supplierName: string;
  supplierRegistrationNumber: string;
  supplierLegalAddress: string;
  supplierServiceAddress: string;
  supplierBankName: string;
  supplierSwift: string;
  supplierIban: string;
  invoicePrefix: string;
  invoiceDefaultDescription: string;
  invoiceLatePenaltyPercent: number;
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
  adjustments?: Adjustment[];
  addons?: Addon[];
  settings?: Settings;
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
  | "edit-member"
  | "assign"
  | "addon"
  | "booking"
  | "edit-booking"
  | "plan-day"
  | "settings"
  | "adjustment"
  | "export"
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

async function downloadWorkbook(parameters: URLSearchParams, fallbackName: string): Promise<void> {
  const response = await fetch(`${API_URL}?${parameters.toString()}`, { cache: "no-store" });
  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const message = contentType.includes("application/json")
      ? String(((await response.json()) as { error?: string }).error ?? "Export failed.")
      : "Export failed.";
    throw new Error(message);
  }
  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const name = match?.[1] ?? fallbackName;
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
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
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
    success: string | ((result: Record<string, unknown>) => string),
  ) {
    setBusy(true);
    setError("");
    try {
      const result = await requestAction(action, payload);
      setModal(null);
      const successMessage = typeof success === "function" ? success(result) : success;
      setToast(
        result.member
          ? `${successMessage} Access code: ${(result.member as { accessCode: string }).accessCode}`
          : successMessage,
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
  const adjustments = state.adjustments ?? [];
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
  const bookableMemberships = (isAdmin ? memberships : myMemberships).filter(
    (membership) =>
      membership.status === "active" && membership.credits_used < membership.credits_total,
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

  function openMemberEditor(member: User) {
    setSelectedMember(member);
    setModal("edit-member");
  }

  function openBookingEditor(booking: Booking) {
    setSelectedBooking(booking);
    setModal("edit-booking");
  }

  async function exportData(parameters: URLSearchParams, fallbackName: string) {
    setBusy(true);
    setError("");
    try {
      await downloadWorkbook(parameters, fallbackName);
      setToast("Excel file downloaded.");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Export failed.");
    } finally {
      setBusy(false);
    }
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

      {isAdmin && (
        <section className="admin-tools">
          <div>
            <span>ADMIN CONTROLS</span>
            <strong>Members, accounting and exports</strong>
            <small>Private controls. Members cannot see or use these actions.</small>
          </div>
          <div className="admin-tool-actions">
            <button className="secondary-button" onClick={() => setModal("settings")}>Settings & invoice details</button>
            <button className="secondary-button" onClick={() => setModal("export")}>Export booking history</button>
            <button className="primary-button" onClick={() => setModal("adjustment")}>+ Discount or commission</button>
          </div>
        </section>
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
          {bookableMemberships.length > 0 && (
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
          onEdit={openBookingEditor}
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
            onEdit={openMemberEditor}
            onDeactivate={(memberId) =>
              void run(
                "deactivate_member",
                { memberId },
                "Member access deactivated. Plans, bookings and payments were kept.",
              )
            }
            onReactivate={(memberId) =>
              void run("reactivate_member", { memberId }, "Member access restored.")
            }
            onArchive={(memberId) =>
              void run("archive_member", { memberId }, "Member archived. All history was preserved.")
            }
            onRestore={(memberId) =>
              void run("restore_member", { memberId }, "Member restored with active access.")
            }
            onDelete={(memberId) =>
              void run("delete_member", { memberId }, "Empty member record permanently deleted.")
            }
            onExport={(memberId, memberName) =>
              void exportData(
                new URLSearchParams({ export: "member-accounting", memberId, month }),
                `barbers-hub-${memberName}-${month}.xlsx`,
              )
            }
            onCancelPlan={(membershipId) =>
              void run(
                "cancel_membership",
                { membershipId },
                (result) =>
                  result.chargeCancelled
                    ? "Plan cancelled. Future bookings were released and the unpaid charge was removed."
                    : `Plan cancelled and future bookings released. ${String(result.chargeRetainedReason ?? "The charge was retained.")}`,
              )
            }
          />
          <TransactionList
            transactions={transactions}
            onPaid={(transactionId) =>
              void run("mark_paid", { transactionId }, "Payment marked as paid.")
            }
            onDue={(transactionId) =>
              void run("mark_due", { transactionId }, "Payment returned to amount due.")
            }
          />
          <AdjustmentList
            adjustments={adjustments}
            onCancel={(adjustmentId) =>
              void run("cancel_adjustment", { adjustmentId }, "Adjustment cancelled.")
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
      {modal === "edit-member" && selectedMember && (
        <EditMemberModal
          member={selectedMember}
          error={error}
          busy={busy}
          close={() => setModal(null)}
          submit={(payload) =>
            void run("update_member", payload, "Member details updated.")
          }
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
      {modal === "edit-booking" && selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          plan={planMap[selectedBooking.plan_key]}
          busy={busy}
          close={() => setModal(null)}
          submit={(payload) =>
            void run("update_booking", payload, "Booking corrected without creating a new charge.")
          }
        />
      )}
      {modal === "plan-day" && (
        <PlanDayModal
          memberships={bookableMemberships}
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
      {modal === "adjustment" && state.settings && (
        <AdjustmentModal
          users={users.filter((item) => item.role === "member" && !item.archived)}
          transactions={transactions.filter((item) => item.status === "due")}
          month={month}
          defaultReferralRate={state.settings.defaultReferralRate}
          busy={busy}
          error={error}
          close={() => setModal(null)}
          submit={(payload) =>
            void run("add_adjustment", payload, (result) =>
              (result.adjustment as { status?: string } | undefined)?.status === "pending"
                ? "Referral commission saved as pending until the new member's first payment is received."
                : "Adjustment applied.",
            )
          }
        />
      )}
      {modal === "export" && (
        <ExportModal
          month={month}
          busy={busy}
          close={() => setModal(null)}
          submit={(parameters) => void exportData(parameters, "barbers-hub-history.xlsx")}
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
  const activeMemberships = memberships.filter((membership) => membership.status === "active");
  const active = activeMemberships[0];
  const priority = addons.find((addon) => addon.status === "active");
  const due = transactions
    .filter((transaction) => transaction.status === "due")
    .reduce((sum, transaction) => sum + transaction.amount_cents, 0);
  return (
    <section className="member-strip">
      <div>
        <span>Active plan</span>
        <strong>
          {activeMemberships.length > 1
            ? `${activeMemberships.length} active plans · contact the owner`
            : active
              ? plans[active.plan_key]?.name
              : "Pay as you go"}
        </strong>
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
  onEdit,
  onCancel,
}: {
  days: string[];
  bookings: Booking[];
  planMap: Record<PlanKey, Plan>;
  isAdmin: boolean;
  currentUserId: string;
  onEmpty: (date: string, chair: number) => void;
  onEdit: (booking: Booking) => void;
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
                          <div className="booking-actions">
                            {isAdmin && (
                              <button onClick={() => onEdit(booking)} aria-label="Edit booking">
                                Edit
                              </button>
                            )}
                            {canCancel && (
                              <button
                                className="danger-link"
                                onClick={() =>
                                  window.confirm(
                                    booking.membership_id
                                      ? "Cancel this plan day? The day will return to the existing plan. This does not cancel the plan charge."
                                      : "Cancel this booking and its unpaid booking charge?",
                                  ) && onCancel(booking.id)
                                }
                                aria-label="Cancel booking"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
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
                      <article
                        key={booking.id}
                        className="mobile-booking"
                        style={{
                          borderColor:
                            isAdmin || !planMap[booking.plan_key]?.hidden
                              ? planMap[booking.plan_key]?.color
                              : "#64748b",
                        }}
                      >
                        <span>{booking.user_name} · {minutesLabel(booking.start_min)}–{minutesLabel(booking.end_min)}</span>
                        <div className="mobile-booking-actions">
                          {isAdmin && <button onClick={() => onEdit(booking)}>Edit</button>}
                          {(isAdmin || booking.user_id === currentUserId) && (
                            <button
                              className="danger-link"
                              onClick={() =>
                                window.confirm(
                                  booking.membership_id
                                    ? "Cancel this plan day? The day will return to the existing plan. This does not cancel the plan charge."
                                    : "Cancel this booking and its unpaid booking charge?",
                                ) && onCancel(booking.id)
                              }
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </article>
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
  onEdit,
  onDeactivate,
  onReactivate,
  onArchive,
  onRestore,
  onDelete,
  onExport,
  onCancelPlan,
}: {
  users: User[];
  memberships: Membership[];
  addons: Addon[];
  planMap: Record<PlanKey, Plan>;
  onEdit: (member: User) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string, name: string) => void;
  onCancelPlan: (id: string) => void;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const members = users.filter(
    (user) => user.role === "member" && (showArchived ? Boolean(user.archived) : !user.archived),
  );
  return (
    <section className="table-card">
      <header>
        <div><span>MEMBERS</span><h2>Access, invoices & plans</h2></div>
        <div className="header-actions">
          <button className="mini-button" onClick={() => setShowArchived((value) => !value)}>
            {showArchived ? "Show current" : `Archived (${users.filter((item) => item.archived).length})`}
          </button>
          <b>{members.length}</b>
        </div>
      </header>
      <div className="data-list">
        {members.map((user) => {
          const activeMemberships = memberships.filter(
            (item) => item.user_id === user.id && item.status === "active",
          );
          const priority = addons.some(
            (item) => item.user_id === user.id && item.status === "active",
          );
          return (
            <article className={user.active && !user.archived ? "member-record" : "member-record inactive"} key={user.id}>
              <div className="member-summary">
                <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <strong>{user.name}</strong>
                  <small>
                    {user.archived ? "Archived · history kept" : `Code ${user.access_code} · ${user.active ? "Active access" : "Access deactivated"}`}
                  </small>
                  <small>{user.legal_name || "Invoice details not completed"}{user.agreement_number ? ` · Agreement ${user.agreement_number}` : ""}</small>
                </div>
                <span className="plan-pill">
                  {activeMemberships.length
                    ? `${activeMemberships.map((item) => planMap[item.plan_key]?.shortName).join(" + ")}${activeMemberships.length > 1 ? " · CHECK DUPLICATE" : ""}`
                    : "PAYG"}
                  {priority ? " · PRIORITY" : ""}
                </span>
                <div className="member-actions">
                  <button className="mini-button" onClick={() => onEdit(user)}>Edit</button>
                  <button className="mini-button" onClick={() => onExport(user.id, user.name)}>Accountant XLSX</button>
                  {user.archived ? (
                    <button className="mini-button" onClick={() => onRestore(user.id)}>Restore</button>
                  ) : user.active ? (
                    <button
                      className="mini-button"
                      onClick={() =>
                        window.confirm(
                          "Deactivate this member's login? Existing plans, bookings and payments will be kept.",
                        ) && onDeactivate(user.id)
                      }
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button className="mini-button" onClick={() => onReactivate(user.id)}>
                      Reactivate
                    </button>
                  )}
                  {!user.archived && user.history_count > 0 && (
                    <button
                      className="mini-button danger-link"
                      onClick={() =>
                        window.confirm(
                          "Archive this member? Login will stop and the member will leave the current list. Booking and accounting history will remain available.",
                        ) && onArchive(user.id)
                      }
                    >
                      Archive
                    </button>
                  )}
                  {!user.archived && user.history_count === 0 && (
                    <button
                      className="mini-button danger-link"
                      onClick={() =>
                        window.confirm(
                          "Permanently delete this empty member record? This cannot be undone.",
                        ) && onDelete(user.id)
                      }
                    >
                      Delete empty record
                    </button>
                  )}
                </div>
              </div>
              {activeMemberships.map((membership) => (
                <div className="member-plan-row" key={membership.id}>
                  <span>
                    <strong>{planMap[membership.plan_key]?.name}</strong>
                    <small>
                      {membership.start_date}–{membership.end_date} · {membership.credits_total - membership.credits_used} days remaining
                    </small>
                  </span>
                  <button
                    className="mini-button danger-link"
                    onClick={() =>
                      window.confirm(
                        "Cancel this plan? Future plan bookings will be released. The unpaid charge is removed only when no past plan days were used.",
                      ) && onCancelPlan(membership.id)
                    }
                  >
                    Cancel plan
                  </button>
                </div>
              ))}
            </article>
          );
        })}
        {members.length === 0 && <p className="empty-copy">{showArchived ? "No archived members." : "Add the first member to begin."}</p>}
      </div>
    </section>
  );
}

function TransactionList({
  transactions,
  onPaid,
  onDue,
}: {
  transactions: Transaction[];
  onPaid: (id: string) => void;
  onDue: (id: string) => void;
}) {
  return (
    <section className="table-card">
      <header><div><span>FINANCE</span><h2>Payments</h2></div><b>{transactions.length}</b></header>
      <div className="data-list">
        {transactions.slice(0, 10).map((transaction) => (
          <article key={transaction.id}>
            <div className={transaction.status === "paid" ? "status-dot paid" : "status-dot"} />
            <div>
              <strong>{transaction.user_name}</strong>
              <small>{transaction.description}</small>
              {transaction.adjustment_cents !== 0 && (
                <small>{money(transaction.base_amount_cents)} base · {money(transaction.adjustment_cents)} adjustment</small>
              )}
              {transaction.pending_adjustment_cents !== 0 && (
                <small className="pending-copy">{money(transaction.pending_adjustment_cents)} commission pending</small>
              )}
            </div>
            <strong>{money(transaction.net_amount_cents)}</strong>
            {transaction.status === "due" ? (
              <button className="mini-button" onClick={() => onPaid(transaction.id)}>Mark paid</button>
            ) : (
              <button
                className="mini-button"
                onClick={() =>
                  window.confirm("Return this payment to amount due?") && onDue(transaction.id)
                }
              >
                Paid · Undo
              </button>
            )}
          </article>
        ))}
        {transactions.length === 0 && <p className="empty-copy">Transactions appear as plans and bookings are added.</p>}
      </div>
    </section>
  );
}

function AdjustmentList({
  adjustments,
  onCancel,
}: {
  adjustments: Adjustment[];
  onCancel: (id: string) => void;
}) {
  return (
    <section className="table-card adjustments-card">
      <header><div><span>ADJUSTMENTS</span><h2>Discounts & commissions</h2></div><b>{adjustments.length}</b></header>
      <div className="data-list">
        {adjustments.map((adjustment) => (
          <article key={adjustment.id}>
            <div className={adjustment.status === "active" ? "status-dot paid" : "status-dot"} />
            <div>
              <strong>{adjustment.user_name} · {adjustment.description}</strong>
              <small>{adjustment.transaction_description}</small>
              {adjustment.source_user_name && <small>Referred member: {adjustment.source_user_name}</small>}
            </div>
            <strong>{money(adjustment.amount_cents)}</strong>
            <button
              className="mini-button danger-link"
              onClick={() => window.confirm("Cancel this adjustment?") && onCancel(adjustment.id)}
            >
              {adjustment.status === "pending" ? "Pending · cancel" : "Remove"}
            </button>
          </article>
        ))}
        {adjustments.length === 0 && <p className="empty-copy">Discounts and referral commissions will appear here.</p>}
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
        <BillingFields />
        <button className="primary-button wide" disabled={busy}>Create member</button>
      </form>
    </Modal>
  );
}

function EditMemberModal({
  member,
  error,
  busy,
  close,
  submit,
}: {
  member: User;
  error: string;
  busy: boolean;
  close: () => void;
  submit: (payload: Record<string, unknown>) => void;
}) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit({ memberId: member.id, ...Object.fromEntries(new FormData(event.currentTarget)) });
  }
  return (
    <Modal
      title="Edit member"
      intro="Correct the name or access code. Set a new PIN only when it needs to be reset."
      close={close}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        {error && <div className="error-banner modal-error">{error}</div>}
        <label>Member name<input name="name" defaultValue={member.name} required /></label>
        <label>Access code<input name="accessCode" defaultValue={member.access_code} required /></label>
        <label>
          New PIN <small>Leave blank to keep the current PIN</small>
          <input name="newPin" inputMode="numeric" pattern="\d{6,8}" minLength={6} maxLength={8} autoComplete="new-password" />
        </label>
        <p className="form-note">Resetting the PIN signs this member out on other devices.</p>
        <BillingFields member={member} />
        <button className="primary-button wide" disabled={busy}>Save member details</button>
      </form>
    </Modal>
  );
}

function BillingFields({ member }: { member?: User }) {
  return (
    <fieldset className="form-section">
      <legend>Invoice and contact details</legend>
      <label>
        Billing type
        <select name="billingType" defaultValue={member?.billing_type ?? "self_employed"}>
          <option value="self_employed">Self-employed person</option>
          <option value="company">Company</option>
          <option value="individual">Individual</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>Legal name / invoice payer<input name="legalName" defaultValue={member?.legal_name ?? ""} /></label>
      <label>Registration number or personal code<input name="registrationNumber" defaultValue={member?.registration_number ?? ""} /></label>
      <label>Legal / declared address<textarea name="legalAddress" rows={2} defaultValue={member?.legal_address ?? ""} /></label>
      <div className="form-row">
        <label>Email<input name="email" type="email" defaultValue={member?.email ?? ""} /></label>
        <label>Phone<input name="phone" defaultValue={member?.phone ?? ""} /></label>
      </div>
      <label>Agreement number<input name="agreementNumber" defaultValue={member?.agreement_number ?? ""} /></label>
      <label>Service description <small>Leave blank to use the default setting</small><textarea name="serviceDescription" rows={2} defaultValue={member?.service_description ?? ""} /></label>
      <label>Notes for accountant <small>Private, never shown to the member</small><textarea name="billingNotes" rows={3} defaultValue={member?.billing_notes ?? ""} /></label>
    </fieldset>
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

function EditBookingModal({
  booking,
  plan,
  busy,
  close,
  submit,
}: {
  booking: Booking;
  plan: Plan;
  busy: boolean;
  close: () => void;
  submit: (payload: Record<string, unknown>) => void;
}) {
  const editableTime = booking.membership_id !== null || booking.plan_key === "hourly";
  const startOptions = Array.from({ length: 24 }, (_, index) => 540 + index * 30).filter(
    (minute) => minute < 1260,
  );
  const endOptions = Array.from({ length: 24 }, (_, index) => 570 + index * 30).filter(
    (minute) => minute <= 1260,
  );
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit({ bookingId: booking.id, ...Object.fromEntries(new FormData(event.currentTarget)) });
  }
  return (
    <Modal
      title="Edit booking"
      intro="Move this existing booking without creating a second plan or charge. Conflicts are checked before saving."
      close={close}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-note strong-note">
          {booking.user_name} · {plan?.name ?? booking.plan_key}
          {booking.membership_id ? " · included plan day" : ` · ${money(booking.amount_cents)}`}
        </div>
        <div className="form-row">
          <label>Date<input name="date" type="date" min={localDate()} defaultValue={booking.date} required /></label>
          <label>Chair<select name="chairId" defaultValue={String(booking.chair_id)}>{[1,2,3,4,5].map((chair) => <option value={chair} key={chair}>Chair {chair}</option>)}</select></label>
        </div>
        {editableTime ? (
          <div className="form-row">
            <label>Start<select name="startMin" defaultValue={String(booking.start_min)}>{startOptions.map((minute)=><option value={minute} key={minute}>{minutesLabel(minute)}</option>)}</select></label>
            <label>End<select name="endMin" defaultValue={String(booking.end_min)}>{endOptions.map((minute)=><option value={minute} key={minute}>{minutesLabel(minute)}</option>)}</select></label>
          </div>
        ) : (
          <p className="form-note">Time stays {minutesLabel(booking.start_min)}–{minutesLabel(booking.end_min)} for this booking type.</p>
        )}
        <label>Internal note<textarea name="notes" defaultValue={booking.notes ?? ""} maxLength={500} rows={3} /></label>
        {booking.membership_id && (
          <p className="form-note">Editing keeps this as the same included plan day. It does not add another amount due.</p>
        )}
        <button className="primary-button wide" disabled={busy}>Save booking correction</button>
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
        <label>Member plan<select name="membershipId">{memberships.map((membership) => <option key={membership.id} value={membership.id}>{membership.user_name} · {planMap[membership.plan_key]?.name} · {membership.credits_total-membership.credits_used} remaining</option>)}</select></label>
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
  settings: Settings;
  busy: boolean;
  close: () => void;
  submit: (payload: Record<string, unknown>) => void;
}) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(Object.fromEntries(new FormData(event.currentTarget)));
  }
  return (
    <Modal title="Business settings" intro="Adjust capacity, costs, referral policy and the supplier details included in accountant exports." close={close}>
      <form className="modal-form" onSubmit={onSubmit}>
        <fieldset className="form-section">
          <legend>Operating dashboard</legend>
          <label>Monthly chair-day target<input name="capacityTarget" type="number" min="1" max="150" defaultValue={settings.capacityTarget} required /></label>
          <label>Monthly operating costs (€)<input name="monthlyCost" type="number" min="0" step="1" defaultValue={settings.monthlyCost / 100} required /></label>
          <label>Default referral commission (%)<input name="defaultReferralRate" type="number" min="0" max="100" step="0.01" defaultValue={settings.defaultReferralRate} required /></label>
        </fieldset>
        <fieldset className="form-section">
          <legend>Supplier details for accountant exports</legend>
          <label>Supplier legal name<input name="supplierName" defaultValue={settings.supplierName} required /></label>
          <label>Registration number<input name="supplierRegistrationNumber" defaultValue={settings.supplierRegistrationNumber} required /></label>
          <label>Legal address<textarea name="supplierLegalAddress" rows={2} defaultValue={settings.supplierLegalAddress} /></label>
          <label>Service address<textarea name="supplierServiceAddress" rows={2} defaultValue={settings.supplierServiceAddress} /></label>
          <label>Bank<input name="supplierBankName" defaultValue={settings.supplierBankName} /></label>
          <div className="form-row">
            <label>SWIFT<input name="supplierSwift" defaultValue={settings.supplierSwift} /></label>
            <label>IBAN<input name="supplierIban" defaultValue={settings.supplierIban} /></label>
          </div>
        </fieldset>
        <fieldset className="form-section">
          <legend>Invoice defaults</legend>
          <div className="form-row">
            <label>Invoice prefix<input name="invoicePrefix" defaultValue={settings.invoicePrefix} required /></label>
            <label>Payment due in days<input name="invoiceDueDays" type="number" min="0" max="60" defaultValue={settings.invoiceDueDays} required /></label>
          </div>
          <label>Default service description<textarea name="invoiceDefaultDescription" rows={2} defaultValue={settings.invoiceDefaultDescription} /></label>
          <label>Late-payment penalty per day (%)<input name="invoiceLatePenaltyPercent" type="number" min="0" max="5" step="0.01" defaultValue={settings.invoiceLatePenaltyPercent} required /></label>
        </fieldset>
        <button className="primary-button wide" disabled={busy}>Save business settings</button>
      </form>
    </Modal>
  );
}

function AdjustmentModal({
  users,
  transactions,
  month,
  defaultReferralRate,
  busy,
  error,
  close,
  submit,
}: {
  users: User[];
  transactions: Transaction[];
  month: string;
  defaultReferralRate: number;
  busy: boolean;
  error: string;
  close: () => void;
  submit: (payload: Record<string, unknown>) => void;
}) {
  const firstUserId = transactions[0]?.user_id ?? users[0]?.id ?? "";
  const [userId, setUserId] = useState(firstUserId);
  const [adjustmentType, setAdjustmentType] = useState("discount");
  const [calculationType, setCalculationType] = useState("percentage");
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const dueTransactions = transactions.filter((item) => item.user_id === userId);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(Object.fromEntries(new FormData(event.currentTarget)));
  }
  return (
    <Modal title="Discount or commission" intro="Apply an auditable adjustment to an open payment. Referral commissions use the referred member's first plan payment as the calculation basis." close={close}>
      <form className="modal-form" onSubmit={onSubmit}>
        {error && <div className="error-banner modal-error">{error}</div>}
        <label>
          Member receiving the adjustment
          <select name="userId" value={userId} onChange={(event) => setUserId(event.target.value)} required>
            {users.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          Open payment to adjust
          <select name="transactionId" required>
            {dueTransactions.map((item) => <option key={item.id} value={item.id}>{item.description} · {money(item.net_amount_cents)}</option>)}
          </select>
        </label>
        {dueTransactions.length === 0 && <p className="form-note strong-note">This member has no open payment in {monthLabel(month)}. Choose another member or month.</p>}
        <label>
          Adjustment type
          <select
            name="adjustmentType"
            value={adjustmentType}
            onChange={(event) => {
              const nextType = event.target.value;
              setAdjustmentType(nextType);
              if (nextType === "referral_commission") setAdjustmentValue(String(defaultReferralRate));
            }}
          >
            <option value="discount">Discount</option>
            <option value="referral_commission">Referral commission</option>
            <option value="manual_credit">Manual credit</option>
            <option value="manual_charge">Additional charge</option>
          </select>
        </label>
        {adjustmentType === "referral_commission" && (
          <label>
            New member who was referred
            <select name="sourceUserId" required>
              <option value="">Choose member</option>
              {users.filter((item) => item.id !== userId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        )}
        <div className="form-row">
          <label>
            Calculation
            <select name="calculationType" value={calculationType} onChange={(event) => setCalculationType(event.target.value)}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed euro amount</option>
            </select>
          </label>
          <label>
            {calculationType === "percentage" ? "Percent (%)" : "Amount (€)"}
            <input name="value" type="number" min="0.01" max={calculationType === "percentage" ? 100 : undefined} step="0.01" value={adjustmentValue} onChange={(event) => setAdjustmentValue(event.target.value)} required />
          </label>
        </div>
        <label>Description<textarea name="description" rows={2} placeholder="Reason shown in the accounting export" /></label>
        <p className="form-note">A referral commission stays pending until the new member's first plan payment is marked paid. Cancelling an adjustment keeps the audit history.</p>
        <button className="primary-button wide" disabled={busy || dueTransactions.length === 0}>Apply adjustment</button>
      </form>
    </Modal>
  );
}

function ExportModal({
  month,
  busy,
  close,
  submit,
}: {
  month: string;
  busy: boolean;
  close: () => void;
  submit: (parameters: URLSearchParams) => void;
}) {
  const [range, setRange] = useState<"month" | "all" | "custom">("month");
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const parameters = new URLSearchParams({ export: "all-history" });
    if (range === "month") parameters.set("month", month);
    if (range === "custom") {
      parameters.set("from", String(values.get("from") ?? ""));
      parameters.set("to", String(values.get("to") ?? ""));
    }
    submit(parameters);
  }
  return (
    <Modal title="Export booking history" intro="Download a clean Excel workbook with summary, bookings, transactions, adjustments and member invoice data." close={close}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>
          Export period
          <select value={range} onChange={(event) => setRange(event.target.value as typeof range)}>
            <option value="month">Current screen: {monthLabel(month)}</option>
            <option value="all">All recorded history</option>
            <option value="custom">Custom date range</option>
          </select>
        </label>
        {range === "custom" && (
          <div className="form-row">
            <label>From<input name="from" type="date" required /></label>
            <label>To<input name="to" type="date" required /></label>
          </div>
        )}
        <p className="form-note">Access codes and PINs are intentionally excluded. Cancelled records remain in the history export so the accounting trail is complete.</p>
        <button className="primary-button wide" disabled={busy}>Download Excel</button>
      </form>
    </Modal>
  );
}
