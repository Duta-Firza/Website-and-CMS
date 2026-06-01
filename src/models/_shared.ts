import { Schema } from "mongoose";

export interface LocalizedString {
  id: string;
  en: string;
}

export const localizedStringSchema = new Schema<LocalizedString>(
  {
    id: { type: String, required: true, default: "" },
    en: { type: String, required: true, default: "" },
  },
  { _id: false },
);

export const localizedStringRequired = {
  type: localizedStringSchema,
  required: true,
};

export const stripVersion = {
  toJSON: {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: { virtuals: true },
};
