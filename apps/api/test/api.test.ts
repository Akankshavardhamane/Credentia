import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
const app = buildApp();
afterAll(() => app.close());
describe("API", () => {
  it("rejects malformed institution", async () =>
    expect(
      (await app.inject({ method: "POST", url: "/institutions", payload: {} }))
        .statusCode,
    ).toBe(400));
  it("reports health", async () =>
    expect((await app.inject("/health")).json()).toEqual({ status: "ok" }));
  it("returns all structured verification evidence", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/verify",
      payload: {
        credential: {
          "@context": ["https://www.w3.org/ns/credentials/v2"],
          id: "urn:uuid:evidence",
          type: ["VerifiableCredential", "AcademicCredential"],
          issuer: "did:web:demo.university.edu",
          validFrom: "2026-01-01T00:00:00.000Z",
          credentialSubject: {
            id: "student",
            degree: "BSc",
            graduationDate: "2026-01-01",
          },
          credentialStatus: {
            id: "urn:status#0",
            type: "BitstringStatusListEntry",
            statusPurpose: "revocation",
            statusListIndex: "0",
            statusListCredential: "urn:status",
          },
        },
      },
    });
    expect(response.statusCode).toBe(200);
    expect(
      response.json().evidence.map((item: { check: string }) => item.check),
    ).toEqual(["integrity", "issuer", "accreditation", "status", "provenance"]);
  });
});
