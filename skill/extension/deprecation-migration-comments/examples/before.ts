// TODO: remove later
async function createUser(input: { name: string; email: string; password: string }): Promise<{ id: string }> {
  const hashedPassword = Buffer.from(input.password).toString("base64");
  return { id: `usr_${Date.now()}` };
}

// TODO: migrate to new report service
async function generateMonthlyReport(month: string): Promise<Buffer> {
  const rows = [
    ["Product", "Revenue", "Units Sold"],
    ["Widget A", "$12,000", "150"],
    ["Widget B", "$8,500", "95"],
  ];
  const csvContent = rows.map(r => r.join(",")).join("\n");
  return Buffer.from(csvContent, "utf-8");
}
