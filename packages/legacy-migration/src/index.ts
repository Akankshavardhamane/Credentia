import {
  type VerifiableCredential,
  issueCredential,
} from "@credentia/credential-core";
export interface LegacySource {
  name: string;
  fetch(reference: string): Promise<unknown>;
}
export interface DocumentExtractor {
  extract(document: unknown): Promise<Record<string, unknown>>;
}
export interface CredentialNormalizer {
  normalize(fields: Record<string, unknown>): {
    subjectId: string;
    degree: string;
    graduationDate: string;
  };
}
export interface MigrationReviewService {
  submit(
    candidate: VerifiableCredential,
  ): Promise<{ approved: boolean; reviewer: string }>;
}
export class MockDocumentExtractor implements DocumentExtractor {
  async extract(document: unknown) {
    return typeof document === "object" && document
      ? (document as Record<string, unknown>)
      : {};
  }
}
export class DefaultCredentialNormalizer implements CredentialNormalizer {
  normalize(fields: Record<string, unknown>) {
    return {
      subjectId: String(fields.studentReference ?? "legacy-subject"),
      degree: String(fields.degree ?? "Legacy academic credential"),
      graduationDate: String(fields.graduationDate ?? "1970-01-01"),
    };
  }
}
export async function migrateLegacyRecord(
  record: unknown,
  extractor: DocumentExtractor,
  normalizer: CredentialNormalizer,
  review: MigrationReviewService,
  issuer: string,
  id: string,
): Promise<VerifiableCredential> {
  const normalized = normalizer.normalize(await extractor.extract(record));
  const credential = issueCredential({
    id,
    issuer,
    subject: {
      id: normalized.subjectId,
      degree: normalized.degree,
      graduationDate: normalized.graduationDate,
    },
    statusIndex: 0,
    statusListId: "urn:credentia:status:legacy",
  });
  const decision = await review.submit(credential);
  if (!decision.approved) throw new Error("Migration requires human approval");
  return credential;
}
