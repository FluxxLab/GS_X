/**
 * Pulls speaker records out of the agenda's free-text `speakers` column.
 *
 * That column is prose, not data. A single cell can read:
 *
 *   "Chair: Dr. Iziaq Adekunle Salako; Context: Prof. Michael Kunnuji;
 *    Panelists: Dr. John Ovuraye; Prof. Muawiyyah Babale Sufiyan;
 *    Boladale Akin-Kolapo; Moderator: Dr Vivian Ikpeazu"
 *
 * so the parse has to handle three separate conventions at once: `;` between
 * entries, a `Label:` prefix that carries forward to the entries after it, and
 * `,` that means *either* "name, title, organisation" *or* "person, person,
 * person" depending on which label preceded it.
 *
 * Roughly a third of the cells are not people at all — "PIC Secretariat",
 * "Government / Donors / Private Sector", "Malala Fund", "MC". Those are
 * returned as `skipped` rather than guessed at, because a speaker directory
 * full of committee names is worse than one that is merely incomplete: the
 * mobile app lists these under every session they touch.
 *
 * The sheet's own `organisation` column is a verbatim copy of `speakers` in 70
 * of 88 rows, so it is ignored entirely — the organisation is recovered from
 * the speaker text instead.
 */

export interface ParsedSpeaker {
  name: string;
  role?: string;
  organisation?: string;
}

export interface SpeakerParse {
  people: ParsedSpeaker[];
  /** Entries judged not to be a person, kept verbatim so an operator can see
   *  exactly what was dropped rather than discovering it missing later. */
  skipped: string[];
}

/** Labels the agenda uses inline. The label applies to every entry after it
 *  until the next label — "Panelists: A; B; C" makes all three panelists. */
const ROLE_LABELS: Record<string, string> = {
  chair: "Chair",
  chairs: "Chair",
  chairman: "Chair",
  "co-chair": "Co-Chair",
  "co-chairs": "Co-Chair",
  "co chair": "Co-Chair",
  moderator: "Moderator",
  moderators: "Moderator",
  panelist: "Panelist",
  panelists: "Panelist",
  panellist: "Panelist",
  panellists: "Panelist",
  keynote: "Keynote Speaker",
  "keynote speaker": "Keynote Speaker",
  speaker: "Speaker",
  speakers: "Speaker",
  context: "Context",
  discussant: "Discussant",
  discussants: "Discussant",
  host: "Host",
  hosts: "Host",
  "co-host": "Co-Host",
  "co-hosts": "Co-Host",
  facilitator: "Facilitator",
  facilitators: "Facilitator",
  respondent: "Respondent",
  respondents: "Respondent",
  rapporteur: "Rapporteur",
  "private sector": "Private Sector",
  "public sector": "Public Sector",
  "development sector": "Development Sector",
};

/**
 * Labels after which a comma separates *people*, not a person's title.
 * "Private Sector: Surayyah Ahmad, Wole Adeniyi" is two people; the default
 * "Dr. Osasuyi Dirisu, Executive Director, PIC" is one.
 */
const GROUP_LABELS = new Set([
  "Co-Chair",
  "Co-Host",
  "Panelist",
  "Speaker",
  "Moderator",
  "Discussant",
  "Host",
  "Facilitator",
  "Private Sector",
  "Public Sector",
  "Development Sector",
]);

/** A job title anywhere in the text means the entry names a post, not a
 *  person — "Chairman, NESG", "Former Prime Minister of Côte d'Ivoire". */
const TITLE_WORDS =
  /\b(perm\.?\s*sec|permanent\s+secretary|chair(man|woman|person)?|vice\s+chair|prime\s+minister|minister|president|director|secretary|commissioner|governor|ceo|coo|cto|head\s+of|country\s+(director|rep)|representative|rapporteur|keynote|panelist|moderator|guest\s+speaker)\b/i;

/** Planning notes the organisers left in the column. */
const NOTE_WORDS =
  /\b(deadline|reach\s?out|letter|invite|get\s+back|follow.?up|contact|pending|tbc|tba|n\/a|to\s+be\s+(confirmed|advised)|awaiting)\b/i;

/** Words that mark an entry as an institution rather than a person. */
const ORGANISATIONAL =
  /\b(secretariat|team|panel|fund|bank|centre|center|ministry|commission|committee|council|institute|foundation|agency|network|association|sector|donors|partners?|programme|program|office|division|department|society|organisation|organization|company|limited|ltd|plc|university|college|school|hospital|initiative|alliance|coalition|forum|summit|authority|board|bureau|federation|union|trust|chapter|media|news|entertainment|judges|msmes|services|consulting|advisory|consortium|ventures|holdings|group)\b/i;

/** Honorifics, which make the following word a surname rather than a noun. */
const HONORIFIC =
  /^((dr|prof|professor|mr|mrs|ms|miss|amb|ambassador|hon|honou?rable|engr|arc|rev|fr|pastor|imam|chief|alhaji|alhaja|hajiya|barr|sen|senator|sir|lady|pharm|h\.?\s?e)\.?\s+)+/i;

/** Placeholders that follow an honorific in place of a name: "Amb. Canada"
 *  stands in for a person nobody has named yet. */
const PLACE =
  /^(canada|nigeria|ghana|kenya|senegal|rwanda|ethiopia|egypt|usa|us|uk|eu|un|france|germany|india|china|japan|brazil|africa|europe|america|world\s+bank|switzerland|netherlands|norway|sweden|denmark|finland|ireland|italy|spain|portugal|belgium|austria|australia|korea|indonesia|mexico|turkey|morocco|tunisia|zambia|uganda|tanzania|malawi|cameroon|liberia|sierra\s+leone|gambia|benin|togo|niger|chad|sudan|somalia)$/i;

const clean = (s: string) =>
  s
    .replace(/\s+/g, " ")
    .replace(/^[\s,;.\-–—]+|[\s,;.\-–—]+$/g, "")
    .trim();

/**
 * Is this text a person's name?
 *push
 * Deliberately conservative, and it rejects before it accepts: an honorific is
 * strong evidence but does not override a job title or a planning note, or
 * "Amb. Canada" and "Hon. Minister" would both become speakers. What survives
 * needs positive evidence — an honorific plus a surname, or two capitalised
 * words that are neither institutional nor title vocabulary.
 */
export function looksLikePerson(raw: string): boolean {
  const s = clean(raw);
  if (!s) return false;
  if (s.length > 60) return false; // a sentence, not a name
  if (s.includes("/")) return false; // "PIC / Media Team", "WIPO/BI"
  if (NOTE_WORDS.test(s)) return false;
  if (ORGANISATIONAL.test(s)) return false;
  if (TITLE_WORDS.test(s)) return false;

  const bare = clean(s.replace(HONORIFIC, ""));
  if (!bare) return false;
  if (PLACE.test(bare)) return false;

  const words = bare.split(" ").filter(Boolean);
  // Acronyms are institutions: IPA, MC, CHAI, NITDA — and so are strings made
  // only of them, like "PIC COSPAL" or "FSHA (Food Health Systems Advisory)".
  const acronym = (w: string) => /^\(?[A-Z][A-Z0-9.&-]{0,7}\)?$/.test(w);
  if (words.every(acronym)) return false;
  const capitalised = words.filter((w) => /^[A-ZÀ-Þ]/.test(w)).length;
  // An honorific already establishes a person, so a lone surname is enough
  // after one; without it, a single word is too little to go on.
  if (HONORIFIC.test(s)) return capitalised >= 1;
  return words.length >= 2 && capitalised >= 2;
}

/**
 * Names that are probably the same person spelled two ways — the agenda has
 * "Daniel Ikuenobe" and "Daniel Oseaga Ikuenobe", "Kemela Okara" and "Kemala
 * Okara". Reported, never merged: only the organisers know which is right.
 */
export function findNearDuplicates(names: string[]): [string, string][] {
  const dist = (a: string, b: string) => {
    if (Math.abs(a.length - b.length) > 2) return 99;
    const d = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      let prev = d[0];
      d[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const t = d[j];
        d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = t;
      }
    }
    return d[b.length];
  };

  /** Honorifics carry no identity, and single letters are initials. */
  const tokens = (n: string) =>
    speakerKey(n.replace(HONORIFIC, ""))
      .split(" ")
      .filter((t) => t.length > 1);

  const pairs: [string, string][] = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = tokens(names[i]);
      const b = tokens(names[j]);
      if (!a.length || !b.length) continue;
      // Same surname is the precondition for every match below.
      if (a[a.length - 1] !== b[b.length - 1]) continue;
      // Surname alone against a fuller name: "Dr Shettima" / "Dr Kole Shettima".
      if (a.length === 1 || b.length === 1) {
        pairs.push([names[i], names[j]]);
        continue;
      }
      // Otherwise the given names must match or be one typo apart:
      // "Kemela Okara" / "Kemala Okara".
      if (a[0] === b[0] || dist(a[0], b[0]) <= 1) pairs.push([names[i], names[j]]);
    }
  }
  return pairs;
}

/** "Dr. Osasuyi Dirisu, Executive Director, PIC" → name / role / organisation.
 *  Also handles the dash form: "Ayodele Olawande - Honourable Minister, …". */
function splitNameTitleOrg(raw: string): ParsedSpeaker | null {
  let s = clean(raw);
  if (!s) return null;

  let tail = "";
  const dash = s.split(/\s+[-–—]\s+/);
  if (dash.length > 1) {
    s = dash[0];
    tail = dash.slice(1).join(", ");
  }

  const parts = [...s.split(","), ...(tail ? tail.split(",") : [])]
    .map(clean)
    .filter(Boolean);
  if (parts.length === 0) return null;

  const [name, ...rest] = parts;
  if (!looksLikePerson(name)) return null;

  return {
    name: name.slice(0, 255),
    ...(rest[0] ? { role: rest[0].slice(0, 255) } : {}),
    ...(rest.length > 1 ? { organisation: rest.slice(1).join(", ").slice(0, 255) } : {}),
  };
}

/**
 * @param cell the row's `speakers` text
 * @returns the people it names, and every entry that was not one
 */
export function parseSpeakerCell(cell: string): SpeakerParse {
  const people: ParsedSpeaker[] = [];
  const skipped: string[] = [];
  const seen = new Set<string>();

  const add = (p: ParsedSpeaker | null, source: string, role?: string) => {
    if (!p) {
      const s = clean(source);
      if (s) skipped.push(s);
      return;
    }
    // A label role only fills a gap; a title read off the text itself is more
    // specific ("Executive Director, PIC" beats "Chair").
    const withRole = p.role ? p : role ? { ...p, role } : p;
    const k = withRole.name.toLowerCase();
    if (seen.has(k)) return; // the same person listed twice on one session
    seen.add(k);
    people.push(withRole);
  };

  let role: string | undefined;

  for (const segment of String(cell ?? "").split(";")) {
    const seg = clean(segment);
    if (!seg) continue;

    let body = seg;
    const labelled = /^([A-Za-z][A-Za-z\s-]{1,24}?)\s*:\s*(.*)$/.exec(seg);
    if (labelled) {
      const mapped = ROLE_LABELS[labelled[1].trim().toLowerCase()];
      if (mapped) {
        role = mapped;
        body = labelled[2];
      } else {
        // An unrecognised label is a note, not a role: "Send out invite: X",
        // "Room C: Taxation…". Keep whatever follows and judge it on its own.
        body = labelled[2];
      }
      if (!clean(body)) continue;
    }

    // After a plural/group label the commas separate people; otherwise the
    // first comma introduces the person's title.
    if (role && GROUP_LABELS.has(role) && body.includes(",")) {
      const commaParts = body.split(",").map(clean).filter(Boolean);
      const allPeople = commaParts.every((p) => looksLikePerson(p));
      if (allPeople) {
        for (const p of commaParts) add({ name: p.slice(0, 255) }, p, role);
        continue;
      }
    }

    add(splitNameTitleOrg(body), body, role);
  }

  return { people, skipped };
}

/** Case- and punctuation-insensitive identity, so "Dr. Amina Salihu" and
 *  "Dr Amina Salihu" are not created twice. */
export function speakerKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
