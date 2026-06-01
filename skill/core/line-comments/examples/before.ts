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
  const valid = transactions.filter(t => t.status === "completed" || t.status === "pending");
  const byCurrency = valid.reduce<Record<string, Transaction[]>>((acc, t) => {
    (acc[t.currency] ??= []).push(t);
    return acc;
  }, {});
  const alerts = Object.entries(byCurrency)
    .filter(([, txs]) => {
      const total = txs.reduce((s, t) => s + t.amount, 0);
      const rate = txs.filter(t => t.riskScore > 70).length / txs.length;
      return total > 100000 && rate > 0.3;
    })
    .map(([ccy]) => `High-risk volume detected in ${ccy}`);
  const risky = valid.filter(t => t.riskScore > 85 && t.amount > 10000);
  const sorted = [...valid].sort((a, b) => b.amount - a.amount);
  const top10 = sorted.slice(0, 10);
  const highValueTx = top10.filter(t => t.amount >= 50000);
  const summary = [
    `Processed ${valid.length} transactions`,
    `High-risk alerts: ${alerts.length}`,
    `Top transaction: ${top10[0]?.currency ?? "N/A"} ${top10[0]?.amount ?? 0}`,
  ].join(" | ");
  return { summary, alerts, highValueTx };
}
