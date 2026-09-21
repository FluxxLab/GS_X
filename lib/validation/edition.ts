import { z } from "zod";

/**
 * The edition form. Mirrors the backend DTO (src/editions/dto/create-edition.dto.ts)
 * and its service rule that an edition must end after it starts, so the
 * organiser is told what is wrong before a round trip rather than after a 400.
 *
 * Dates here are `datetime-local` strings in Abuja wall-clock. They become
 * instants through fromSummitInput at submit; validating the wall-clock form
 * is safe because both ends of the comparison are in the same zone.
 */
export const editionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(255, "Name cannot exceed 255 characters"),

    /** What people call it in conversation, and what the app shows in tight UI. */
    shortName: z
      .string()
      .trim()
      .min(2, "Short name must be at least 2 characters")
      .max(50, "Short name cannot exceed 50 characters"),

    startsAt: z.string().min(1, "Give the edition a start date"),
    endsAt: z.string().min(1, "Give the edition an end date"),

    venue: z
      .string()
      .trim()
      .max(255, "Venue cannot exceed 255 characters")
      .optional(),
  })
  .refine((v) => !Number.isNaN(Date.parse(v.startsAt)), {
    message: "That start date is not a real date",
    path: ["startsAt"],
  })
  .refine((v) => !Number.isNaN(Date.parse(v.endsAt)), {
    message: "That end date is not a real date",
    path: ["endsAt"],
  })
  .refine(
    (v) =>
      Number.isNaN(Date.parse(v.startsAt)) ||
      Number.isNaN(Date.parse(v.endsAt)) ||
      Date.parse(v.endsAt) > Date.parse(v.startsAt),
    {
      // The server enforces this too. Catching it here means the organiser
      // sees it against the field rather than as a toast after a failed save.
      message: "An edition must end after it starts",
      path: ["endsAt"],
    },
  );

export type EditionFormValues = z.infer<typeof editionSchema>;

/** Field name -> first error, the shape the form renders. */
export function editionErrors(
  values: unknown,
): Partial<Record<keyof EditionFormValues, string>> {
  const result = editionSchema.safeParse(values);
  if (result.success) return {};

  const errors: Partial<Record<keyof EditionFormValues, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof EditionFormValues | undefined;
    // first error per field wins: a list of three complaints about one input
    // is noise, and the first is the one to fix
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
