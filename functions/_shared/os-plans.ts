export type PlanKey =
  | "hourly"
  | "morning"
  | "evening"
  | "day-pass"
  | "early-extension"
  | "late-extension"
  | "flex-10"
  | "flex-15"
  | "flex-20"
  | "pro";

export type Plan = {
  key: PlanKey;
  name: string;
  shortName: string;
  priceCents: number;
  color: string;
  kind: "payg" | "membership";
  credits: number;
  startMin: number;
  endMin: number;
  dedicated?: boolean;
  hidden?: boolean;
  requiresBaseBooking?: boolean;
};

export const EARLY_OPEN_MIN = 6 * 60;
export const OPEN_MIN = 9 * 60;
export const CLOSE_MIN = 21 * 60;
export const LATE_CLOSE_MIN = 23 * 60;
export const SLOT_MINUTES = 30;
export const CHAIR_COUNT = 5;

export const PLANS: Record<PlanKey, Plan> = {
  hourly: {
    key: "hourly",
    name: "Hourly access",
    shortName: "Hourly",
    priceCents: 1000,
    color: "#f59e0b",
    kind: "payg",
    credits: 0,
    startMin: OPEN_MIN,
    endMin: OPEN_MIN + 120,
  },
  morning: {
    key: "morning",
    name: "Morning shift",
    shortName: "09–15",
    priceCents: 3500,
    color: "#f97316",
    kind: "payg",
    credits: 0,
    startMin: 9 * 60,
    endMin: 15 * 60,
  },
  evening: {
    key: "evening",
    name: "Evening shift",
    shortName: "15–21",
    priceCents: 3500,
    color: "#8b5cf6",
    kind: "payg",
    credits: 0,
    startMin: 15 * 60,
    endMin: 21 * 60,
  },
  "day-pass": {
    key: "day-pass",
    name: "Day Pass",
    shortName: "Day",
    priceCents: 5000,
    color: "#ef4444",
    kind: "payg",
    credits: 0,
    startMin: OPEN_MIN,
    endMin: CLOSE_MIN,
  },
  "early-extension": {
    key: "early-extension",
    name: "Early access extension",
    shortName: "06–09",
    priceCents: 2000,
    color: "#eab308",
    kind: "payg",
    credits: 0,
    startMin: EARLY_OPEN_MIN,
    endMin: OPEN_MIN,
    requiresBaseBooking: true,
  },
  "late-extension": {
    key: "late-extension",
    name: "Late access extension",
    shortName: "21–23",
    priceCents: 2000,
    color: "#a855f7",
    kind: "payg",
    credits: 0,
    startMin: CLOSE_MIN,
    endMin: LATE_CLOSE_MIN,
    requiresBaseBooking: true,
  },
  "flex-10": {
    key: "flex-10",
    name: "Flex 10",
    shortName: "F10",
    priceCents: 40000,
    color: "#06b6d4",
    kind: "membership",
    credits: 10,
    startMin: OPEN_MIN,
    endMin: CLOSE_MIN,
  },
  "flex-15": {
    key: "flex-15",
    name: "Flex 15",
    shortName: "F15",
    priceCents: 52500,
    color: "#0ea5e9",
    kind: "membership",
    credits: 15,
    startMin: OPEN_MIN,
    endMin: CLOSE_MIN,
  },
  "flex-20": {
    key: "flex-20",
    name: "Flex 20",
    shortName: "F20",
    priceCents: 65000,
    color: "#22c55e",
    kind: "membership",
    credits: 20,
    startMin: OPEN_MIN,
    endMin: CLOSE_MIN,
  },
  pro: {
    key: "pro",
    name: "Dedicated 24/7 Pro",
    shortName: "Pro",
    priceCents: 125000,
    color: "#dc2626",
    kind: "membership",
    credits: 30,
    startMin: OPEN_MIN,
    endMin: CLOSE_MIN,
    dedicated: true,
    hidden: true,
  },
};

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === "string" && value in PLANS;
}
