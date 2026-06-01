import { createReadStream, createWriteStream } from "fs";

interface LogEntry {
  timestamp: string;
  level: "ERROR" | "WARN" | "INFO" | "DEBUG";
  module: string;
  message: string;
}

function parseLogLine(line: string): LogEntry | null {
  const match = line.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] \[(\w+)\] \[(\w+)\] (.+)/);
  if (!match) return null;
  return { timestamp: match[1], level: match[2] as LogEntry["level"], module: match[3], message: match[4] };
}

async function processLogFile(inputPath: string, outputPath: string): Promise<void> {
  const inputStream = createReadStream(inputPath, { encoding: "utf-8", highWaterMark: 64 * 1024 });
  const outputStream = createWriteStream(outputPath, { encoding: "utf-8" });
  let buffer = "";

  for await (const chunk of inputStream) {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    const entries: LogEntry[] = [];
    for (const line of lines) {
      const entry = parseLogLine(line);
      if (entry && (entry.level === "ERROR" || entry.level === "WARN")) {
        entries.push(entry);
      }
    }

    const grouped: Record<string, { ERROR: number; WARN: number }> = {};
    for (const entry of entries) {
      if (!grouped[entry.module]) grouped[entry.module] = { ERROR: 0, WARN: 0 };
      grouped[entry.module][entry.level]++;
    }

    for (const [module, counts] of Object.entries(grouped)) {
      outputStream.write(`[${module}] ERROR: ${counts.ERROR}  WARN: ${counts.WARN}\n`);
    }
  }

  outputStream.end();
}
