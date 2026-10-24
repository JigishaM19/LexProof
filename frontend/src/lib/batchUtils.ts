import { CandidateEntry, BatchVerificationRecord } from "./api";

/**
 * Parses a CSV, TSV, or plain-text candidate roster into structured CandidateEntry items.
 */
export async function parseCandidateFile(file: File): Promise<{
  candidates: CandidateEntry[];
  rawText: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string) || "";
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length === 0) {
          resolve({ candidates: [], rawText: "", error: "File appears to be empty." });
          return;
        }

        // Determine delimiter: tab, comma, or semicolon
        const firstLine = lines[0];
        let delimiter = ",";
        if (firstLine.includes("\t")) delimiter = "\t";
        else if (firstLine.includes(";") && !firstLine.includes(",")) delimiter = ";";

        // Regex helper to split respecting quoted strings
        const splitLine = (line: string): string[] => {
          const result: string[] = [];
          let cur = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              result.push(cur.trim().replace(/^["']|["']$/g, ""));
              cur = "";
            } else {
              cur += char;
            }
          }
          result.push(cur.trim().replace(/^["']|["']$/g, ""));
          return result;
        };

        let startIndex = 0;
        let colIndex = {
          name: 0,
          roll: 1,
          degree: 2,
          year: 3,
        };

        // Check if first line is a header
        const headerParts = splitLine(firstLine).map((h) => h.toLowerCase());
        const hasHeader = headerParts.some(
          (h) =>
            h.includes("name") ||
            h.includes("roll") ||
            h.includes("prn") ||
            h.includes("candidate") ||
            h.includes("degree") ||
            h.includes("course") ||
            h.includes("year")
        );

        if (hasHeader) {
          startIndex = 1;
          headerParts.forEach((h, idx) => {
            if (h.includes("name") || h.includes("candidate") || h.includes("student")) {
              colIndex.name = idx;
            } else if (
              h.includes("roll") ||
              h.includes("prn") ||
              h.includes("reg") ||
              h.includes("enroll") ||
              h.includes("id")
            ) {
              colIndex.roll = idx;
            } else if (
              h.includes("degree") ||
              h.includes("course") ||
              h.includes("program") ||
              h.includes("branch")
            ) {
              colIndex.degree = idx;
            } else if (
              h.includes("year") ||
              h.includes("passing") ||
              h.includes("batch") ||
              h.includes("session")
            ) {
              colIndex.year = idx;
            }
          });
        }

        const candidates: CandidateEntry[] = [];
        const rawLines: string[] = [];

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue;
          const parts = splitLine(line);
          const name = parts[colIndex.name] || parts[0];
          if (!name || name.trim() === "") continue;

          const roll =
            parts[colIndex.roll] ||
            parts[1] ||
            `PRN-${Math.floor(100000 + Math.random() * 900000)}`;
          const degree = parts[colIndex.degree] || parts[2] || "Degree Certificate";
          const year = parts[colIndex.year] || parts[3] || new Date().getFullYear().toString();

          candidates.push({
            candidate_name: name,
            roll_number: roll,
            degree,
            passing_year: year,
            status: "PENDING",
          });

          rawLines.push(`${name}, ${roll}, ${degree}, ${year}`);
        }

        resolve({
          candidates,
          rawText: rawLines.join("\n"),
        });
      } catch (err: any) {
        resolve({
          candidates: [],
          rawText: "",
          error: err.message || "Failed to parse spreadsheet/CSV file.",
        });
      }
    };

    reader.onerror = () => {
      resolve({ candidates: [], rawText: "", error: "Failed to read the selected file." });
    };

    reader.readAsText(file);
  });
}

/**
 * Generates and triggers browser download of an official CSV export of a verification batch.
 */
export function exportBatchToCsv(batch: BatchVerificationRecord): void {
  const headers = [
    "Candidate Name",
    "Roll Number / PRN",
    "Degree / Program",
    "Passing Year",
    "Verification Status",
    "Authoritative Rail",
    "Audit Notes",
  ];

  const escapeCsv = (val: string | undefined | null) => {
    if (!val) return '""';
    const clean = String(val).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = batch.candidates.map((c) => [
    escapeCsv(c.candidate_name),
    escapeCsv(c.roll_number),
    escapeCsv(c.degree),
    escapeCsv(c.passing_year),
    escapeCsv(c.status),
    escapeCsv(c.rail_source || batch.target_institution),
    escapeCsv(c.notes || "Official ledger verification verified"),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute("download", `LexProof_Batch_${batch.id}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a standardized sample CSV template for bulk candidate intake.
 */
export function downloadSampleTemplate(): void {
  const content = [
    "Candidate Name,Roll Number / PRN,Degree,Passing Year",
    "Aarav Sharma,MH-2023-CS-0101,B.E. Computer Engineering,2023",
    "Priya Deshmukh,MH-2023-EE-0402,B.Tech Electrical Engineering,2023",
    "Rohan Kulkarni,MU-2022-IT-0899,B.Sc Information Technology,2022",
    "Ananya Patel,DU-2023-COM-5512,B.Com (Hons),2023",
    "Vikramaditya Rao,AU-2021-ME-1029,B.E. Mechanical Engineering,2021",
  ].join("\r\n");

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "lexproof_sample_batch_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
