import { describe, expect, it } from "vitest";
import { editionErrors, editionSchema } from "./edition";

const valid = {
  name: "GS-27 Gender and Inclusion Summit",
  shortName: "GS-27",
  startsAt: "2027-09-07T08:00",
  endsAt: "2027-09-08T17:00",
  venue: "Abuja, Nigeria",
};

describe("editionSchema", () => {
  it("accepts a well-formed edition", () => {
    expect(editionSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts one with no venue, which is not known early on", () => {
    const withoutVenue = { ...valid, venue: undefined };
    expect(editionSchema.safeParse(withoutVenue).success).toBe(true);
  });

  it("trims a name padded by a paste", () => {
    const parsed = editionSchema.parse({ ...valid, name: "  GS-27 Summit  " });
    expect(parsed.name).toBe("GS-27 Summit");
  });
});

describe("editionErrors", () => {
  it("is empty when everything is fine", () => {
    expect(editionErrors(valid)).toEqual({});
  });

  it("refuses an edition that ends before it starts", () => {
    // The server refuses this too. Catching it here puts the message against
    // the field instead of in a toast after a failed save.
    expect(
      editionErrors({
        ...valid,
        startsAt: "2027-09-08T17:00",
        endsAt: "2027-09-07T08:00",
      }).endsAt,
    ).toBe("An edition must end after it starts");
  });

  it("refuses a zero-length edition", () => {
    expect(editionErrors({ ...valid, endsAt: valid.startsAt }).endsAt).toBe(
      "An edition must end after it starts",
    );
  });

  it("asks for the dates when they are missing", () => {
    const errors = editionErrors({ ...valid, startsAt: "", endsAt: "" });
    expect(errors.startsAt).toBe("Give the edition a start date");
    expect(errors.endsAt).toBe("Give the edition an end date");
  });

  it("does not also complain about ordering when a date is missing", () => {
    // "must end after it starts" against an empty box is a confusing second
    // message for one mistake.
    expect(editionErrors({ ...valid, endsAt: "" }).endsAt).toBe(
      "Give the edition an end date",
    );
  });

  it("names a date that is not a date", () => {
    expect(editionErrors({ ...valid, startsAt: "not-a-date" }).startsAt).toBe(
      "That start date is not a real date",
    );
  });

  it("reports one error per field, not three", () => {
    const errors = editionErrors({
      name: "",
      shortName: "",
      startsAt: "",
      endsAt: "",
    });
    expect(Object.values(errors).every((m) => typeof m === "string")).toBe(true);
    expect(errors.name).toBe("Name must be at least 3 characters");
  });

  it("rejects a name longer than the column", () => {
    expect(editionErrors({ ...valid, name: "x".repeat(256) }).name).toBe(
      "Name cannot exceed 255 characters",
    );
  });
});
