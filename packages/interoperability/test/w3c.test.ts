import { describe, expect, it } from "vitest";
import { W3cVcAdapter } from "../src/index.js";
describe("W3C VC adapter", () => {
  it("round-trips a W3C-shaped credential", async () => {
    const adapter = new W3cVcAdapter();
    const credential = await adapter.importCredential({
      "@context": ["https://www.w3.org/ns/credentials/v2"],
      credentialSubject: { id: "student" },
    });
    expect(
      (await adapter.exportCredential(credential)).credentialSubject.id,
    ).toBe("student");
  });
});
