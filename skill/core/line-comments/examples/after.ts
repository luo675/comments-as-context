interface Transaction {
  id: string;
  amount: number;
  currency: string;
  timestamp: number;
  status: "pending" | "completed" | "failed" | "refunded";
  riskScore: number;
  isInternational: boolean;
  gatewayResponse?: string;
}

function processDailyReport(transactions: Transaction[]): {
  summary: string;
  alerts: string[];
  highValueTx: Transaction[];
} {
  // Keep only transactions that could still affect financial totals
  const valid = transactions.filter(t => t.status === "completed" || t.status === "pending");

  // Group by currency for per-currency risk analysis
  const byCurrency = valid.reduce<Record<string, Transaction[]>>((acc, t) => {
    (acc[t.currency] ??= []).push(t);
    return acc;
  }, {});

  // Alert if a currency's total volume exceeds $100k AND more than 30% of its
  // transactions have riskScore > 70 — this combination signals potential fraud
  const alerts = Object.entries(byCurrency)
    .filter(([, txs]) => {
      const total = txs.reduce((s, t) => s + t.amount, 0);
      const rate = txs.filter(t => t.riskScore > 70).length / txs.length;
      return total > 100000 && rate > 0.3;
    })
    .map(([ccy]) => `High-risk volume detected in ${ccy}`);

  // Transactions exceeding both thresholds require manual review
  const risky = valid.filter(t => t.riskScore > 85 && t.amount > 10000);

  // Sort descending by amount and take top 10 for executive summary
  const sorted = [...valid].sort((a, b) => b.amount - a.amount);
  const top10 = sorted.slice(0, 10);

  // High-value: only flag those >= $50k (regulatory reporting threshold)
  const highValueTx = top10.filter(t => t.amount >= 50000);

  // Concise one-line summary for dashboard header
  const summary = [
    `Processed ${valid.length} transactions`,
    `High-risk alerts: ${alerts.length}`,
    `Top transaction: ${top10[0]?.currency ?? "N/A"} ${top10[0]?.amount ?? 0}`,
  ].join(" | ");

  return { summary, alerts, highValueTx };
}
