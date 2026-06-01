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

/**
 * DATAFLOW:
 *   SOURCE: Input log file (stdin or file path)
 *   STEP 1: Stream read — chunks buffered and split by newline
 *   STEP 2: Parse — extract [timestamp] [level] [module] message
 *   STEP 3: Filter — keep only ERROR and WARN level entries
 *   STEP 4: Aggregate — group by module, count each severity
 *   STEP 5: Format — write "[module] ERROR: N  WARN: N" per line
 *   SINK: Output file (stdout or file path)
 *
 * CONDITION BRANCH: If the --json flag is set (not implemented here),
 *                   step 5 writes JSON instead of formatted text.
 */
async function processLogFile(inputPath: string, outputPath: string): Promise<void> {
  // DATAFLOW Step 1: Stream input in 64KB chunks to handle large files
  const inputStream = createReadStream(inputPath, { encoding: "utf-8", highWaterMark: 64 * 1024 });
  const outputStream = createWriteStream(outputPath, { encoding: "utf-8" });
  let buffer = "";

  for await (const chunk of inputStream) {
    buffer += chunk;
    // DATAFLOW Step 1a: Split on newline boundaries, keep partial line in buffer
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    // DATAFLOW Step 2-3: Parse and filter in one pass
    const entries: LogEntry[] = [];
    for (const line of lines) {
      const entry = parseLogLine(line);
      if (entry && (entry.level === "ERROR" || entry.level === "WARN")) {
        entries.push(entry);
      }
    }

    // DATAFLOW Step 4: Aggregate counts per module
    const grouped: Record<string, { ERROR: number; WARN: number }> = {};
    for (const entry of entries) {
      if (!grouped[entry.module]) grouped[entry.module] = { ERROR: 0, WARN: 0 };
      grouped[entry.module][entry.level]++;
    }

    // DATAFLOW Step 5: Write aggregated results per chunk
    for (const [module, counts] of Object.entries(grouped)) {
      outputStream.write(`[${module}] ERROR: ${counts.ERROR}  WARN: ${counts.WARN}\n`);
    }
  }

  outputStream.end();
}
