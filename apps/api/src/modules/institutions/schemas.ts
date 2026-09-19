import { z } from "zod";
export const institutionInput = z.object({
  legalName: z.string().min(2),
  country: z.string().length(2),
  did: z.string().startsWith("did:"),
  issuerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  validUntil: z.string().datetime().optional(),
});
