import assert from "node:assert/strict";
import test from "node:test";

import { createXlsxWorkbook, excelDate } from "../functions/_shared/xlsx.mjs";

test("builds a valid multi-sheet XLSX package with styled accounting values", () => {
  const workbook = createXlsxWorkbook({
    title: "BARBERS HUB export test",
    sheets: [
      {
        name: "Summary",
        columns: [{ width: 24 }, { width: 18 }],
        rows: [
          [{ value: "BARBERS HUB", style: "title" }],
          [{ value: "Metric", style: "header" }, { value: "Value", style: "header" }],
          ["Net amount", { value: 650, style: "currency" }],
        ],
        merges: ["A1:B1"],
        freezeRows: 2,
      },
      {
        name: "Bookings",
        columns: [{ width: 16 }, { width: 24 }],
        rows: [
          [{ value: "Date", style: "header" }, { value: "Member", style: "header" }],
          [{ value: excelDate("2026-08-05"), style: "date" }, "Test member"],
        ],
      },
    ],
  });

  assert.ok(workbook instanceof Uint8Array);
  assert.equal(String.fromCharCode(...workbook.slice(0, 2)), "PK");
  assert.ok(workbook.byteLength > 5000);
});
