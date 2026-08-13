/**
 * Machine values never reach the screen raw: snake_case/kebab-case becomes
 * spaced Title Case ("water_treatment" → "Water Treatment"). Use for any
 * enum, lookup value or stored key rendered to a person.
 */
export function humanize(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
