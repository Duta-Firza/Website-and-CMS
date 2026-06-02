import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringRequired, localizedStringSchema, stripVersion } from "./_shared";

export const HOME_HERO_ID = "home-hero";

const homeHeroSchema = new Schema(
  {
    _id: { type: String, default: HOME_HERO_ID },
    eyebrow: { type: localizedStringSchema, default: () => ({ id: "", en: "" }) },
    title: localizedStringRequired,
    subtitle: localizedStringRequired,
    ctaLabel: localizedStringRequired,
    ctaHref: { type: String, required: true, default: "/contact" },
    secondaryCtaLabel: {
      type: localizedStringSchema,
      default: () => ({ id: "", en: "" }),
    },
    secondaryCtaHref: { type: String, default: "" },
    backgroundImage: {
      type: String,
      required: true,
      default: "/images/landing/hero-placeholder.jpg",
    },
  },
  { timestamps: true, ...stripVersion },
);

export type HomeHeroDoc = InferSchemaType<typeof homeHeroSchema>;

export const HomeHero = models.HomeHero ?? model("HomeHero", homeHeroSchema);
