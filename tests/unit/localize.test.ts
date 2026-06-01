import { describe, expect, it } from "vitest";
import { localize, pickLocale } from "@/lib/cms/localize";

describe("pickLocale()", () => {
  it("returns the requested locale value when present", () => {
    expect(pickLocale({ id: "Halo", en: "Hello" }, "id")).toBe("Halo");
    expect(pickLocale({ id: "Halo", en: "Hello" }, "en")).toBe("Hello");
  });

  it("falls back to the other locale when requested is empty", () => {
    expect(pickLocale({ id: "", en: "Hello" }, "id")).toBe("Hello");
    expect(pickLocale({ id: "Halo", en: "" }, "en")).toBe("Halo");
  });

  it("returns empty string when both empty", () => {
    expect(pickLocale({ id: "", en: "" }, "id")).toBe("");
  });

  it("handles undefined/null safely", () => {
    expect(pickLocale(undefined, "id")).toBe("");
    expect(pickLocale(null, "en")).toBe("");
  });
});

describe("localize() deep walker", () => {
  it("transforms nested { id, en } objects to localized strings", () => {
    const input = {
      title: { id: "Judul", en: "Title" },
      meta: {
        subtitle: { id: "Subjudul", en: "Subtitle" },
        extras: [{ label: { id: "A", en: "Aye" } }],
      },
      slug: "static",
    };
    const result = localize(input, "en");
    expect(result.title).toBe("Title");
    expect(result.meta.subtitle).toBe("Subtitle");
    expect(result.meta.extras[0].label).toBe("Aye");
    expect(result.slug).toBe("static");
  });

  it("leaves arrays of non-localized values untouched", () => {
    const result = localize({ tags: ["a", "b", "c"] }, "id");
    expect(result.tags).toEqual(["a", "b", "c"]);
  });
});
