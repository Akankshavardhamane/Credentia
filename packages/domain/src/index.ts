import { z } from "zod";

export const credentialLifecycleSchema = z.enum([
  "active",
  "suspended",
  "revoked",
  "expired",
  "superseded",
]);
export type CredentialLifecycle = z.infer<typeof credentialLifecycleSchema>;
export const institutionSchema = z.object({
  id: z.string().uuid(),
  legalName: z.string(),
  country: z.string().length(2),
  did: z.string().startsWith("did:"),
  createdAt: z.string().datetime(),
});
export type Institution = z.infer<typeof institutionSchema>;
export const accreditationSchema = z.object({
  institutionId: z.string().uuid(),
  status: z.enum(["pending", "approved", "revoked"]),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});
export type Accreditation = z.infer<typeof accreditationSchema>;
export const issuerKeySchema = z.object({
  id: z.string().uuid(),
  issuerId: z.string().uuid(),
  verificationMethod: z.string(),
  publicKeyMultibase: z.string(),
  status: z.enum(["active", "retired", "revoked", "compromised"]),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().optional(),
  revokedAt: z.string().datetime().optional(),
});
export type IssuerKey = z.infer<typeof issuerKeySchema>;
export interface IssuerIdentity {
  id: string;
  institutionId: string;
  did: string;
  authorizedCredentialTypes: string[];
  active: boolean;
}
export interface CredentialVersion {
  version: number;
  supersedesCredentialId?: string;
  supersededByCredentialId?: string;
}
export interface Credential {
  id: string;
  issuerId: string;
  lifecycle: CredentialLifecycle;
  version: CredentialVersion;
  statusIndex: number;
  issuedAt: string;
}
export interface VerificationEvidence {
  check: "integrity" | "issuer" | "accreditation" | "status" | "provenance";
  valid: boolean;
  detail: string;
  checkedAt: string;
}
export interface VerificationResult {
  credentialId: string;
  trusted: boolean;
  evidence: VerificationEvidence[];
}
export interface AuditEvent {
  id: string;
  eventType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
export const verifyCredentialRequestSchema = z.object({
  credential: z.record(z.unknown()),
});
export const verifyCredentialReferenceRequestSchema = z.object({
  credentialId: z.string().min(1),
});
export const verifyRequestSchema = z.union([
  verifyCredentialRequestSchema,
  verifyCredentialReferenceRequestSchema,
]);
export const academicSubjectInputSchema = z.object({
  id: z.string().min(1),
  givenName: z.string().min(1).optional(),
  degree: z.string().min(1),
  graduationDate: z.string().date(),
});
export const issueCredentialRequestSchema = z.object({
  id: z.string().min(1).optional(),
  issuer: z.string().startsWith("did:"),
  subject: academicSubjectInputSchema,
  statusIndex: z.number().int().nonnegative().optional(),
  statusListId: z.string().min(1).optional(),
  validFrom: z.string().datetime().optional(),
  credentialVersion: z.number().int().positive().optional(),
  supersedesCredentialId: z.string().min(1).optional(),
});
export const updateCredentialStatusRequestSchema = z.object({
  status: credentialLifecycleSchema,
  reason: z.string().min(1).max(500).optional(),
});
export const supersedeCredentialRequestSchema = z.object({
  id: z.string().min(1).optional(),
  subject: academicSubjectInputSchema.optional(),
  validFrom: z.string().datetime().optional(),
});
export const credentialPresentationSchema = z.object({
  credentialId: z.string(),
  title: z.string(),
  institution: z.string(),
  recipientReference: z.string(),
  degree: z.string(),
  graduationDate: z.string().date(),
  issuedAt: z.string().datetime(),
  lifecycle: credentialLifecycleSchema,
  version: z.number().int().positive(),
  verificationUrl: z.string().url(),
  qrCodeDataUrl: z.string().startsWith("data:image/"),
});
export const verificationResultSchema = z.object({
  credentialId: z.string(),
  trusted: z.boolean(),
  evidence: z.array(
    z.object({
      check: z.enum([
        "integrity",
        "issuer",
        "accreditation",
        "status",
        "provenance",
      ]),
      valid: z.boolean(),
      detail: z.string(),
      checkedAt: z.string().datetime(),
    }),
  ),
});
const transitions: Record<CredentialLifecycle, CredentialLifecycle[]> = {
  active: ["suspended", "revoked", "expired", "superseded"],
  suspended: ["active", "revoked", "expired", "superseded"],
  revoked: [],
  expired: [],
  superseded: [],
};
export function canTransitionCredential(
  from: CredentialLifecycle,
  to: CredentialLifecycle,
) {
  return transitions[from].includes(to);
}
export function transitionCredential(
  from: CredentialLifecycle,
  to: CredentialLifecycle,
): CredentialLifecycle {
  if (!canTransitionCredential(from, to))
    throw new Error(
      `Invalid credential lifecycle transition: ${from} -> ${to}`,
    );
  return to;
}
export interface InstitutionRepository {
  list(): Promise<Institution[]>;
  findByDid(did: string): Promise<Institution | undefined>;
  save(institution: Institution): Promise<Institution>;
}
export interface CredentialRepository {
  findById(id: string): Promise<Credential | undefined>;
  save(credential: Credential): Promise<Credential>;
}
export interface StatusRepository {
  get(credentialId: string): Promise<CredentialLifecycle | undefined>;
  set(
    credentialId: string,
    status: CredentialLifecycle,
    reason?: string,
  ): Promise<void>;
}
export interface AuditRepository {
  record(event: AuditEvent): Promise<void>;
}
export interface StatusListService {
  getStatus(index: number): Promise<CredentialLifecycle>;
  setStatus(index: number, status: CredentialLifecycle): Promise<void>;
}
export interface IssuerKeyService {
  register(key: IssuerKey): Promise<IssuerKey>;
  rotate(issuerId: string, replacement: IssuerKey): Promise<IssuerKey>;
  revoke(keyId: string, compromised?: boolean): Promise<void>;
  resolveHistorical(
    verificationMethod: string,
    at: Date,
  ): Promise<IssuerKey | undefined>;
}
