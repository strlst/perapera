import type { Word } from "./types";

export const CSV_FILES = [
    {
        label: "1",
        url: "https://raw.githubusercontent.com/mercari/engineer-vocabulary-list/refs/heads/master/csv/list_1.csv",
    },
    {
        label: "2",
        url: "https://raw.githubusercontent.com/mercari/engineer-vocabulary-list/refs/heads/master/csv/list_2.csv",
    },
    {
        label: "3",
        url: "https://raw.githubusercontent.com/mercari/engineer-vocabulary-list/refs/heads/master/csv/list_3.csv",
    },
    {
        label: "4",
        url: "https://raw.githubusercontent.com/mercari/engineer-vocabulary-list/refs/heads/master/csv/list_4.csv",
    },
    {
        label: "5",
        url: "https://raw.githubusercontent.com/mercari/engineer-vocabulary-list/refs/heads/master/csv/list_5.csv",
    },
] as const;

// cannot simply line.split on separater due to nested commas
function splitCsvLine(line: string): string[] {
    const cols: string[] = [];
    let cur = "";
    let inQuote = false;
    for (const ch of line) {
        if (ch === '"') {
            inQuote = !inQuote;
        } else if (ch === "," && !inQuote) {
            cols.push(cur);
            cur = "";
        } else {
            cur += ch;
        }
    }
    cols.push(cur);
    return cols;
}

export function parseCsv(text: string, category: string): Word[] {
    const lines = text.split("\n");
    const words: Word[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = splitCsvLine(line);
        if (cols.length >= 3 && cols[0] && cols[2]) {
            words.push({
                japanese: cols[0].trim(),
                japaneseFuri: cols[1]?.trim() ?? "",
                english: cols[2].trim(),
                exampleJP: cols[3]?.trim() ?? "",
                exampleJPFuri: cols[4]?.trim() ?? "",
                exampleEN: cols[5]?.trim() ?? "",
                category,
            });
        }
    }
    return words;
}

export function normalise(s: string): string {
    return s
        .trim()
        .replace(/\s+/g, "")
        .replace(/・/g, "")
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
            String.fromCharCode(c.charCodeAt(0) - 0xfee0)
        )
        .toLowerCase();
}

export function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}