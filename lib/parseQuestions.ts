import type { LikertValue, Question, ScaleOption } from "./types";

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    if (c === '"') {
      i += 1;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        if (line[i] === '"') {
          i += 1;
          break;
        }
        cur += line[i];
        i += 1;
      }
      continue;
    }
    if (c === ",") {
      out.push(cur);
      cur = "";
      i += 1;
      continue;
    }
    cur += c;
    i += 1;
  }
  out.push(cur);
  return out;
}

/** 設問CSV: id,category,theory,dimension,question,reverse */
export function parseQuestionsCSV(text: string): Question[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const header = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = {
    id: header.indexOf("id"),
    category: header.indexOf("category"),
    theory: header.indexOf("theory"),
    dimension: header.indexOf("dimension"),
    question: header.indexOf("question"),
    reverse: header.indexOf("reverse"),
  };
  if (
    idx.id < 0 ||
    idx.category < 0 ||
    idx.theory < 0 ||
    idx.dimension < 0 ||
    idx.question < 0 ||
    idx.reverse < 0
  ) {
    throw new Error("questions.csv: 必須列が見つかりません");
  }

  const rows: Question[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cells = parseCSVLine(lines[r]);
    const id = Number(cells[idx.id]);
    const reverse = Number(cells[idx.reverse]);
    if (!Number.isFinite(id) || (reverse !== 0 && reverse !== 1)) continue;
    rows.push({
      id,
      category: cells[idx.category]?.trim() ?? "",
      theory: cells[idx.theory]?.trim() ?? "",
      dimension: cells[idx.dimension]?.trim() ?? "",
      question: cells[idx.question]?.trim() ?? "",
      reverse: reverse as 0 | 1,
    });
  }
  return rows.sort((a, b) => a.id - b.id);
}

/** 選択肢CSV: value,label */
export function parseScaleCSV(text: string): ScaleOption[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const header = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const vi = header.indexOf("value");
  const li = header.indexOf("label");
  if (vi < 0 || li < 0) throw new Error("scale.csv: value / label 列が必要です");

  const opts: ScaleOption[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cells = parseCSVLine(lines[r]);
    const value = Number(cells[vi]) as LikertValue;
    if (value < 1 || value > 5) continue;
    opts.push({
      value,
      label: cells[li]?.trim() ?? "",
    });
  }
  return opts.sort((a, b) => a.value - b.value);
}

export async function loadQuestions(): Promise<Question[]> {
  const res = await fetch("/data/questions.csv");
  if (!res.ok) throw new Error("設問の読み込みに失敗しました");
  return parseQuestionsCSV(await res.text());
}

export async function loadScale(): Promise<ScaleOption[]> {
  const res = await fetch("/data/scale.csv");
  if (!res.ok) throw new Error("選択肢の読み込みに失敗しました");
  return parseScaleCSV(await res.text());
}
