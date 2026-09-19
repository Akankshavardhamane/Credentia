import type { VerifiableCredential } from "@credentia/credential-core";
export interface CredentialInteroperabilityAdapter {
  readonly name: string;
  importCredential(payload: unknown): Promise<VerifiableCredential>;
  exportCredential(credential: VerifiableCredential): Promise<unknown>;
}
export interface DigiLockerNadAdapter
  extends CredentialInteroperabilityAdapter {
  readonly name: "digilocker-nad";
}
export interface EbsiAdapter extends CredentialInteroperabilityAdapter {
  readonly name: "ebsi";
}
export interface InstitutionalSisAdapter
  extends CredentialInteroperabilityAdapter {
  readonly name: "institutional-sis";
}
export class W3cVcAdapter implements CredentialInteroperabilityAdapter {
  readonly name = "w3c-vc";
  async importCredential(payload: unknown) {
    if (
      !payload ||
      typeof payload !== "object" ||
      !("@context" in payload) ||
      !("credentialSubject" in payload)
    )
      throw new Error("Payload is not a W3C Verifiable Credential");
    return payload as VerifiableCredential;
  }
  async exportCredential(credential: VerifiableCredential) {
    return structuredClone(credential);
  }
}
