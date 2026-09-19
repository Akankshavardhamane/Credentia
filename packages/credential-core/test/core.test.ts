import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  createMerkleProof,
  createMerkleRoot,
  issueCredential,
  signCredential,
  verifyCredential,
  verifyMerkleProof,
} from "../src/index.js";
describe("credential core", () => {
  const keys = generateKeyPairSync("ed25519");
  const draft = issueCredential({
    id: "urn:uuid:demo",
    issuer: "did:web:example.edu",
    subject: {
      id: "student-001",
      degree: "Bachelor of Computer Science",
      graduationDate: "2026-05-01",
    },
    statusIndex: 0,
    statusListId: "https://status.example/list",
  });
  it("signs and verifies", () =>
    expect(
      verifyCredential(
        signCredential(draft, keys.privateKey, "did:web:example.edu#key-1"),
        keys.publicKey,
      ),
    ).toBe(true));
  it("rejects modified credentials", () => {
    const signed = signCredential(draft, keys.privateKey, "key");
    expect(
      verifyCredential(
        { ...signed, issuer: "did:web:attacker" },
        keys.publicKey,
      ),
    ).toBe(false);
  });
  it("validates merkle proof", () => {
    const values = ["a", "b", "c"];
    expect(
      verifyMerkleProof(
        createMerkleProof(values, "b"),
        createMerkleRoot(values),
      ),
    ).toBe(true);
  });
});
