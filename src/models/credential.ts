import { type InferSchemaType, model, models, Schema } from "mongoose";
import { localizedStringOptional, localizedStringRequired, stripVersion } from "./_shared";
import { CREDENTIAL_TYPES, type CredentialType } from "./constants";

export { CREDENTIAL_TYPES, type CredentialType };

const credentialSchema = new Schema(
  {
    title: localizedStringRequired,
    description: localizedStringOptional,
    imageUrl: { type: String, default: "" },
    type: { type: String, enum: CREDENTIAL_TYPES, required: true, index: true },
    issuer: { type: String, default: "" },
    year: { type: Number },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, ...stripVersion },
);

export type CredentialDoc = InferSchemaType<typeof credentialSchema>;

export const Credential = models.Credential ?? model("Credential", credentialSchema);
