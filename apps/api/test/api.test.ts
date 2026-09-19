import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
const app = buildApp();
afterAll(() => app.close());
describe("API", () => {
  const issue = async (id = "urn:uuid:credential-1") => {
    const response = await app.inject({
      method: "POST",
      url: "/credentials",
      payload: {
        id,
        issuer: "did:web:demo.university.edu",
        subject: {
          id: "student-001",
          degree: "Bachelor of Computer Science",
          graduationDate: "2026-05-01",
        },
      },
    });
    expect(response.statusCode).toBe(201);
    return response.json().credential;
  };
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
  it("issues and successfully verifies a signed credential", async () => {
    const credential = await issue("urn:uuid:issue-success");
    const response = await app.inject({
      method: "POST",
      url: "/verify",
      payload: { credential },
    });
    expect(response.json().trusted).toBe(true);
  });
  it("verifies by stored credential reference and exposes a separate presentation QR", async () => {
    const credential = await issue("urn:uuid:qr-reference");
    const verification = await app.inject({
      method: "POST",
      url: "/verify",
      payload: { credentialId: credential.id },
    });
    expect(verification.json().trusted).toBe(true);
    const presentation = await app.inject(
      `/credentials/${encodeURIComponent(credential.id)}/presentation`,
    );
    expect(presentation.statusCode).toBe(200);
    expect(presentation.json().verificationUrl).toContain(
      encodeURIComponent(credential.id),
    );
    expect(presentation.json().qrCodeDataUrl).toMatch(/^data:image\//);
    expect(presentation.json().credential).toBeUndefined();
  });
  it("rejects tampered credentials and untrusted issuers", async () => {
    const credential = await issue("urn:uuid:tampered");
    const tampered = { ...credential, issuer: "did:web:attacker.example" };
    const response = await app.inject({
      method: "POST",
      url: "/verify",
      payload: { credential: tampered },
    });
    expect(response.json().trusted).toBe(false);
    expect(
      response
        .json()
        .evidence.find((item: { check: string }) => item.check === "integrity")
        .valid,
    ).toBe(false);
    expect(
      response
        .json()
        .evidence.find((item: { check: string }) => item.check === "issuer")
        .valid,
    ).toBe(false);
  });
  it("rejects an invalid signature from an otherwise trusted issuer", async () => {
    const credential = await issue("urn:uuid:invalid-signature");
    const response = await app.inject({
      method: "POST",
      url: "/verify",
      payload: {
        credential: {
          ...credential,
          proof: { ...credential.proof, proofValue: "invalid-signature" },
        },
      },
    });
    expect(response.json().trusted).toBe(false);
    expect(
      response
        .json()
        .evidence.find((item: { check: string }) => item.check === "integrity")
        .valid,
    ).toBe(false);
  });
  it.each(["suspended", "revoked", "expired"])(
    "marks a %s credential untrusted",
    async (status) => {
      const credential = await issue(`urn:uuid:${status}`);
      await app.inject({
        method: "POST",
        url: `/credentials/${encodeURIComponent(credential.id)}/status`,
        payload: { status },
      });
      const response = await app.inject({
        method: "POST",
        url: "/verify",
        payload: { credential },
      });
      expect(response.json().trusted).toBe(false);
      expect(
        response
          .json()
          .evidence.find((item: { check: string }) => item.check === "status")
          .valid,
      ).toBe(false);
    },
  );
  it("supersedes a credential and retains its version history", async () => {
    const credential = await issue("urn:uuid:original");
    const replacement = await app.inject({
      method: "POST",
      url: `/credentials/${encodeURIComponent(credential.id)}/supersede`,
      payload: { id: "urn:uuid:replacement" },
    });
    expect(replacement.statusCode).toBe(201);
    const verification = await app.inject({
      method: "POST",
      url: "/verify",
      payload: { credential },
    });
    expect(verification.json().trusted).toBe(false);
    const versions = await app.inject(
      `/credentials/${encodeURIComponent(credential.id)}/versions`,
    );
    expect(versions.json()).toHaveLength(2);
  });
  it("rejects invalid lifecycle transitions and missing credential references", async () => {
    const credential = await issue("urn:uuid:terminal");
    await app.inject({
      method: "POST",
      url: `/credentials/${encodeURIComponent(credential.id)}/status`,
      payload: { status: "revoked" },
    });
    const invalidTransition = await app.inject({
      method: "POST",
      url: `/credentials/${encodeURIComponent(credential.id)}/status`,
      payload: { status: "active" },
    });
    expect(invalidTransition.statusCode).toBe(409);
    const missing = await app.inject({
      method: "POST",
      url: "/verify",
      payload: { credentialId: "urn:credentia:missing" },
    });
    expect(missing.json().trusted).toBe(false);
    expect(
      missing.json().evidence.every((item: { valid: boolean }) => !item.valid),
    ).toBe(true);
  });
});
