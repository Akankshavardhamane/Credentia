import { describe, expect, it } from "vitest";
import {
  InMemoryStatusListService,
  issueCredential,
  supersedeCredential,
} from "../src/index.js";
describe("credential lifecycle and versioning", () => {
  it("enforces lifecycle transitions", async () => {
    const statuses = new InMemoryStatusListService(["active"]);
    await statuses.setStatus(0, "suspended");
    await statuses.setStatus(0, "revoked");
    await expect(statuses.setStatus(0, "active")).rejects.toThrow(
      "Invalid credential lifecycle transition",
    );
  });
  it("preserves a historical credential when superseded", () => {
    const original = issueCredential({
      id: "urn:uuid:one",
      issuer: "did:web:demo",
      subject: { id: "student", degree: "BSc", graduationDate: "2025-01-01" },
      statusIndex: 0,
      statusListId: "urn:status",
    });
    const historical = supersedeCredential(original, "urn:uuid:two");
    expect(historical.id).toBe(original.id);
    expect(historical.supersededByCredentialId).toBe("urn:uuid:two");
  });
});
