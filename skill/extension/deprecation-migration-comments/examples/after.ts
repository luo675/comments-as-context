/**
 * Creates a new user account using the legacy registration flow.
 *
 * @deprecated Use createUserV2() instead.
 *   Reason: Legacy flow doesn't support OAuth and MFA (security audit finding).
 *   Remove in: v4.0.0 (planned 2026-Q3)
 *   Migration: run `npm run migrate:legacy-users` to bulk-migrate existing accounts.
 *              V2 accepts the same input shape — drop-in replacement for most callers.
 */
async function createUser(input: { name: string; email: string; password: string }): Promise<{ id: string }> {
  const hashedPassword = Buffer.from(input.password).toString("base64");
  return { id: `usr_${Date.now()}` };
}

/**
 * Generates the monthly report in XLSX format.
 *
 * @deprecated Will be removed in v5.0. The new ReportService (currently behind
 *             the REPORT_V2 feature flag) generates PDF and CSV instead.
 *             Migration: Update dashboard components to use ReportService.
 *             For API clients: new endpoint GET /api/reports/v2/{type}.
 *
 * Current status (v4.2): Both v1 and v2 run in parallel.
 *                        v1: this function (CSV, synchronous)
 *                        v2: ReportService (PDF/CSV, async, supports 3x larger datasets)
 *                        Feature flag: REPORT_V2 (default: off for API, on for web dashboard)
 */
async function generateMonthlyReport(month: string): Promise<Buffer> {
  const rows = [
    ["Product", "Revenue", "Units Sold"],
    ["Widget A", "$12,000", "150"],
    ["Widget B", "$8,500", "95"],
  ];
  const csvContent = rows.map(r => r.join(",")).join("\n");
  return Buffer.from(csvContent, "utf-8");
}
