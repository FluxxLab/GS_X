'use client';

import { useMemo, useState } from 'react';
import { financeService } from '../services/finance.service';
import type { ImportBankRow, ImportBankResult } from '../types/finance';

/** Amount interpretation modes for a parsed statement. */
export type AmountMode = 'single' | 'split';

/** Which CSV column index feeds each field. `-1` = unmapped. */
export interface ColumnMapping {
  date: number;
  description: number;
  reference: number;
  amount: number;
  debit: number;
  credit: number;
  balance: number;
}

const EMPTY_MAPPING: ColumnMapping = {
  date: -1, description: -1, reference: -1, amount: -1, debit: -1, credit: -1, balance: -1,
};

/**
 * Parse a single CSV line into fields, honouring double-quoted fields that may
 * themselves contain commas or escaped (doubled) quotes. RFC-4180-ish, enough
 * for real-world bank exports.
 */
export function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { field += '"'; i++; } // escaped quote
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out.map((f) => f.trim());
}

/** Parse CSV text into a header row + data rows. Ignores fully-blank lines. */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(parseCsvLine);
  return { headers, rows };
}

/** Strip currency symbols / thousands separators, return a finite number or 0. */
export function parseAmount(raw: string | undefined): number {
  if (!raw) return 0;
  let s = raw.trim();
  if (s === '') return 0;
  let negative = false;
  // Accounting-style parentheses denote a negative value.
  if (/^\(.*\)$/.test(s)) { negative = true; s = s.slice(1, -1); }
  s = s.replace(/[^0-9.\-]/g, '');
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return 0;
  return negative ? -Math.abs(n) : n;
}

/**
 * Normalise a date string to `YYYY-MM-DD`. Accepts ISO `YYYY-MM-DD`,
 * and slash/dash-separated `DD/MM/YYYY` or `MM/DD/YYYY`. Ambiguous slash dates
 * are read as DD/MM/YYYY (Nigeria). Returns `''` when it cannot be parsed.
 */
export function normalizeDate(raw: string | undefined): string {
  if (!raw) return '';
  const s = raw.trim();
  if (s === '') return '';

  // Already ISO (optionally with a time component).
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const parts = s.split(/[/\-.]/).map((p) => p.trim());
  if (parts.length === 3) {
    // YYYY-first (e.g. 2026/06/27).
    if (parts[0].length === 4) {
      const [y, m, d] = parts;
      return iso3(y, m, d);
    }
    const [a, b, rawYear] = parts;
    const y = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    let day = a;
    let month = b;
    // If the first component can't be a day but the second can, it's MM/DD.
    if (Number(a) > 12 && Number(b) <= 12) { day = a; month = b; }
    else if (Number(b) > 12 && Number(a) <= 12) { day = b; month = a; }
    // else ambiguous → DD/MM (already assigned).
    return iso3(y, month, day);
  }
  return '';
}

function iso3(y: string, m: string, d: string): string {
  const yy = Number(y);
  const mm = Number(m);
  const dd = Number(d);
  if (!Number.isFinite(yy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return '';
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return '';
  return `${String(yy).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

/** Guess a column index whose header matches any of the given keywords. */
function guess(headers: string[], keywords: string[]): number {
  const lower = headers.map((h) => h.toLowerCase());
  for (const kw of keywords) {
    const idx = lower.findIndex((h) => h.includes(kw));
    if (idx !== -1) return idx;
  }
  return -1;
}

/** Auto-map headers by common bank-export names and pick an amount mode. */
export function autoMap(headers: string[]): { mapping: ColumnMapping; mode: AmountMode } {
  const debit = guess(headers, ['debit', 'withdrawal', 'money out', 'paid out', 'dr']);
  const credit = guess(headers, ['credit', 'deposit', 'money in', 'paid in', 'cr']);
  const amount = guess(headers, ['amount', 'value']);
  const mode: AmountMode = debit !== -1 || credit !== -1 ? 'split' : 'single';
  return {
    mapping: {
      date: guess(headers, ['date', 'posted', 'transaction date', 'value date']),
      description: guess(headers, ['description', 'narration', 'details', 'particulars', 'memo']),
      reference: guess(headers, ['reference', 'ref', 'cheque', 'transaction id']),
      amount: mode === 'single' ? amount : -1,
      debit: mode === 'split' ? debit : -1,
      credit: mode === 'split' ? credit : -1,
      balance: guess(headers, ['balance', 'running balance']),
    },
    mode,
  };
}

function cell(row: string[], idx: number): string {
  return idx >= 0 && idx < row.length ? row[idx] : '';
}

/** A single mapped, normalised row ready for preview or import. */
export interface MappedRow {
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number | undefined;
}

/** Map a raw CSV row into a normalised {@link MappedRow} using the mapping/mode. */
export function mapRow(row: string[], mapping: ColumnMapping, mode: AmountMode): MappedRow {
  let debit = 0;
  let credit = 0;
  if (mode === 'single') {
    const amt = parseAmount(cell(row, mapping.amount));
    if (amt < 0) debit = Math.abs(amt);
    else credit = amt;
  } else {
    debit = Math.abs(parseAmount(cell(row, mapping.debit)));
    credit = Math.abs(parseAmount(cell(row, mapping.credit)));
  }
  const balanceRaw = mapping.balance >= 0 ? cell(row, mapping.balance) : '';
  return {
    date: normalizeDate(cell(row, mapping.date)),
    description: cell(row, mapping.description),
    reference: cell(row, mapping.reference),
    debit,
    credit,
    balance: balanceRaw.trim() ? parseAmount(balanceRaw) : undefined,
  };
}

/** Build the import payload rows, dropping rows without a date or with no value. */
export function buildRows(rows: string[][], mapping: ColumnMapping, mode: AmountMode): ImportBankRow[] {
  const out: ImportBankRow[] = [];
  for (const raw of rows) {
    const m = mapRow(raw, mapping, mode);
    if (!m.date) continue;
    if (m.debit === 0 && m.credit === 0) continue;
    const row: ImportBankRow = { date: m.date, description: m.description };
    if (m.reference) row.reference = m.reference;
    if (m.debit > 0) row.debit = m.debit;
    if (m.credit > 0) row.credit = m.credit;
    if (m.balance !== undefined) row.balance = m.balance;
    out.push(row);
  }
  return out;
}

interface ParsedFile {
  fileName: string;
  headers: string[];
  rows: string[][];
}

/**
 * State machine for the statement-import flow: parse a chosen CSV file, hold the
 * column mapping/mode, expose a preview and a mapped row count, and run the
 * import. All parsing happens on the file-change / import handlers — never in an
 * effect.
 */
export function useStatementImport() {
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>(EMPTY_MAPPING);
  const [mode, setMode] = useState<AmountMode>('single');
  const [error, setError] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportBankResult | null>(null);

  const reset = () => {
    setParsed(null);
    setMapping(EMPTY_MAPPING);
    setMode('single');
    setError('');
    setImporting(false);
    setResult(null);
  };

  const loadFile = async (file: File) => {
    setError('');
    setResult(null);
    try {
      const text = await file.text();
      const { headers, rows } = parseCsv(text);
      if (headers.length === 0 || rows.length === 0) {
        setParsed(null);
        setError('The file has no data rows. Please choose a CSV with a header row and at least one transaction.');
        return;
      }
      const guessed = autoMap(headers);
      setParsed({ fileName: file.name, headers, rows });
      setMapping(guessed.mapping);
      setMode(guessed.mode);
    } catch {
      setParsed(null);
      setError('Could not read the file. Make sure it is a valid CSV.');
    }
  };

  const setColumn = (field: keyof ColumnMapping, idx: number) =>
    setMapping((m) => ({ ...m, [field]: idx }));

  const mappedRows = useMemo(
    () => (parsed ? buildRows(parsed.rows, mapping, mode) : []),
    [parsed, mapping, mode],
  );

  const preview = useMemo<MappedRow[]>(
    () => (parsed ? parsed.rows.slice(0, 10).map((r) => mapRow(r, mapping, mode)) : []),
    [parsed, mapping, mode],
  );

  /** True once the required fields (date, description, amount source) are mapped. */
  const canImport = useMemo(() => {
    if (!parsed) return false;
    if (mapping.date < 0 || mapping.description < 0) return false;
    if (mode === 'single') return mapping.amount >= 0;
    return mapping.debit >= 0 || mapping.credit >= 0;
  }, [parsed, mapping, mode]);

  const runImport = async (bankAccountId: string): Promise<ImportBankResult | null> => {
    setError('');
    if (!bankAccountId) { setError('Select a bank account before importing.'); return null; }
    if (mapping.date < 0 || mapping.description < 0) {
      setError('Map both the Date and Description columns to continue.');
      return null;
    }
    if (mode === 'single' ? mapping.amount < 0 : mapping.debit < 0 && mapping.credit < 0) {
      setError('Map an Amount column, or a Debit/Credit column, to continue.');
      return null;
    }
    if (mappedRows.length === 0) {
      setError('No importable rows were found. Check the column mapping and date format.');
      return null;
    }
    setImporting(true);
    try {
      const res = await financeService.importBankTransactions({ bankAccountId, transactions: mappedRows });
      setResult(res);
      return res;
    } catch {
      setError('The import failed. Please try again.');
      return null;
    } finally {
      setImporting(false);
    }
  };

  return {
    parsed, mapping, mode, error, importing, result,
    mappedRows, preview, canImport,
    loadFile, setColumn, setMode, reset, runImport,
  };
}
