import { describe, expect, it } from "vitest";
import {
  DefaultCredentialNormalizer,
  MockDocumentExtractor,
  migrateLegacyRecord,
} from "../src/index.js";
describe("legacy migration", () => {
  it("normalizes a reviewed legacy record into a W3C credential", async () => {
    const credential = await migrateLegacyRecord(
      {
        studentReference: "legacy-1",
        degree: "BSc",
        graduationDate: "2024-01-01",
      },
      new MockDocumentExtractor(),
      new DefaultCredentialNormalizer(),
      { submit: async () => ({ approved: true, reviewer: "registrar" }) },
      "did:web:demo.edu",
      "urn:uuid:legacy-1",
    );
    expect(credential.credentialSubject.id).toBe("legacy-1");
  });
});
