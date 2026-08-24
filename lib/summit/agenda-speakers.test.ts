import { describe, it, expect } from 'vitest';
import { parseSpeakerCell, looksLikePerson, findNearDuplicates, speakerKey } from './agenda-speakers';

const names = (cell: string) => parseSpeakerCell(cell).people.map((p) => p.name);

describe('looksLikePerson', () => {
  it('accepts a plain name and an honorific plus surname', () => {
    expect(looksLikePerson('Waziri Adio')).toBe(true);
    expect(looksLikePerson('Dr Shettima')).toBe(true);
    expect(looksLikePerson("H.E. Patrick Achi")).toBe(true);
  });

  it('rejects institutions, teams and acronyms', () => {
    for (const s of ['PIC Secretariat', 'Malala Fund', 'World Bank', 'IPA', 'MC',
                     'PIC / Media Team', 'PIC COSPAL', 'FSHA (Food Health Systems Advisory)']) {
      expect(looksLikePerson(s), s).toBe(false);
    }
  });

  it('rejects a job title standing in for a person', () => {
    for (const s of ['Chairman, NESG', 'TAC Chair', 'Perm Sec',
                     'Former Prime Minister of Côte d’Ivoire', 'Honourable Minister']) {
      expect(looksLikePerson(s), s).toBe(false);
    }
  });

  it('rejects a planning note and a placeholder posting', () => {
    expect(looksLikePerson('Deadline Wed (Reachout to HR)')).toBe(false);
    expect(looksLikePerson('BD to get back')).toBe(false);
    // An honorific must not rescue a country standing in for a person.
    expect(looksLikePerson('Amb. Canada')).toBe(false);
    expect(looksLikePerson('Amb. Switzerland')).toBe(false);
  });

  it('rejects a lone first name, which is too little to go on', () => {
    expect(looksLikePerson('Uche')).toBe(false);
  });
});

describe('parseSpeakerCell', () => {
  it('carries a label forward across the entries it governs', () => {
    const cell =
      'Chair: Dr. Iziaq Adekunle Salako; Context: Prof. Michael Kunnuji; ' +
      'Panelists: Dr. John Ovuraye; Prof. Muawiyyah Babale Sufiyan; ' +
      'Boladale Akin-Kolapo; Moderator: Dr Vivian Ikpeazu';
    const { people } = parseSpeakerCell(cell);
    expect(people).toHaveLength(6);
    expect(people.find((p) => p.name === 'Dr. Iziaq Adekunle Salako')?.role).toBe('Chair');
    // all three follow "Panelists:", including the two with no prefix
    for (const n of ['Dr. John Ovuraye', 'Prof. Muawiyyah Babale Sufiyan', 'Boladale Akin-Kolapo']) {
      expect(people.find((p) => p.name === n)?.role, n).toBe('Panelist');
    }
    expect(people.find((p) => p.name === 'Dr Vivian Ikpeazu')?.role).toBe('Moderator');
  });

  it('treats commas as people after a group label', () => {
    const { people } = parseSpeakerCell(
      'Private Sector: Surayyah Ahmad, Wole Adeniyi, Solape Akinpelu, Prof. Jonathan Aremu',
    );
    expect(people.map((p) => p.name)).toEqual([
      'Surayyah Ahmad', 'Wole Adeniyi', 'Solape Akinpelu', 'Prof. Jonathan Aremu',
    ]);
    expect(people.every((p) => p.role === 'Private Sector')).toBe(true);
  });

  it('treats commas as title and organisation otherwise', () => {
    const { people } = parseSpeakerCell('Dr. Osasuyi Dirisu, Executive Director, PIC');
    expect(people).toEqual([
      { name: 'Dr. Osasuyi Dirisu', role: 'Executive Director', organisation: 'PIC' },
    ]);
  });

  it('reads the dash form', () => {
    const { people } = parseSpeakerCell(
      'Ayodele Olawande - Honourable Minister, Federal Ministry of Youth Development',
    );
    expect(people[0]).toEqual({
      name: 'Ayodele Olawande',
      role: 'Honourable Minister',
      organisation: 'Federal Ministry of Youth Development',
    });
  });

  it('prefers a title read off the text over the label role', () => {
    const { people } = parseSpeakerCell('Chair: Rodio Diallo, Deputy Director, Family Planning');
    expect(people[0].role).toBe('Deputy Director');
  });

  it('reports institutions as skipped instead of inventing speakers', () => {
    const { people, skipped } = parseSpeakerCell('PIC Secretariat; Entertainment Team; Waziri Adio');
    expect(people.map((p) => p.name)).toEqual(['Waziri Adio']);
    expect(skipped).toEqual(['PIC Secretariat', 'Entertainment Team']);
  });

  it('does not list the same person twice for one session', () => {
    expect(names('Waziri Adio; Chair: Waziri Adio')).toEqual(['Waziri Adio']);
  });

  it('keeps the name when an unrecognised label prefixes it', () => {
    expect(names('Send out invite: Kemela Okara')).toEqual(['Kemela Okara']);
  });

  it('returns nothing for a blank cell', () => {
    expect(parseSpeakerCell('')).toEqual({ people: [], skipped: [] });
  });
});

describe('findNearDuplicates', () => {
  it('pairs a surname against a fuller name, and one-typo given names', () => {
    const pairs = findNearDuplicates([
      'Dr Shettima', 'Dr Kole Shettima', 'Kemela Okara', 'Kemala Okara',
      'Linda Dogbe', 'Linda D. Dogbe', 'Waziri Adio',
    ]).map(([a, b]) => `${a}|${b}`);
    expect(pairs).toContain('Dr Shettima|Dr Kole Shettima');
    expect(pairs).toContain('Kemela Okara|Kemala Okara');
    expect(pairs).toContain('Linda Dogbe|Linda D. Dogbe');
  });

  it('does not pair unrelated people', () => {
    expect(findNearDuplicates(['Waziri Adio', 'Paul Alaje', 'Nancy Jallow'])).toEqual([]);
  });
});

describe('speakerKey', () => {
  it('ignores case and punctuation so one person is created once', () => {
    expect(speakerKey('Dr. Amina Salihu')).toBe(speakerKey('dr amina salihu'));
  });
});
