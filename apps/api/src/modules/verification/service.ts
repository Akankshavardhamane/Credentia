import type { KeyObject } from "node:crypto";
import type { BlockchainAdapter } from "@credentia/blockchain";
import {
  type VerifiableCredential,
  isVerifiableCredential,
  verifyCredential,
} from "@credentia/credential-core";
import type { VerificationEvidence } from "@credentia/domain";
import type { CredentialRepository } from "../credentials/repository.js";
import type { VerificationRepository } from "./repository.js";

export class VerificationService {
  constructor(
    private readonly chain: BlockchainAdapter,
    private readonly keyResolver: (
      verificationMethod: string,
    ) => string | Buffer | KeyObject | undefined,
    private readonly credentials: CredentialRepository,
    private readonly repo: VerificationRepository,
  ) {}
  async verify(credential: VerifiableCredential) {
    const checkedAt = new Date().toISOString();
    const accredited = await this.chain.isAccredited(credential.issuer);
    const stored = this.credentials.findById(credential.id);
    const key = credential.proof
      ? this.keyResolver(credential.proof.verificationMethod)
      : undefined;
    const integrity =
      isVerifiableCredential(credential) &&
      Boolean(key) &&
      verifyCredential(credential, key as string | Buffer | KeyObject);
    const status = stored?.lifecycle ?? "active";
    const evidence: VerificationEvidence[] = [
      {
        check: "integrity",
        valid: integrity,
        detail: integrity
          ? "Valid Ed25519 Data Integrity proof"
          : "Credential structure, proof, or signing key is invalid",
        checkedAt,
      },
      {
        check: "issuer",
        valid: accredited,
        detail: "Issuer identity is authorized for this institution",
        checkedAt,
      },
      {
        check: "accreditation",
        valid: accredited,
        detail: "Issuer authorization and validity period",
        checkedAt,
      },
      {
        check: "status",
        valid: status === "active",
        detail: `Credential lifecycle is ${status}`,
        checkedAt,
      },
      {
        check: "provenance",
        valid:
          credential.type.includes("AcademicCredential") &&
          Boolean(credential.credentialStatus.statusListCredential) &&
          (credential.credentialVersion ?? 1) > 0,
        detail:
          "Academic type, status-list reference, and credential version are present",
        checkedAt,
      },
    ];
    this.repo.save(credential.id);
    return {
      credentialId: credential.id,
      trusted: evidence.every((item) => item.valid),
      evidence,
    };
  }
  async verifyById(credentialId: string) {
    const stored = this.credentials.findById(credentialId);
    if (!stored) {
      return {
        credentialId,
        trusted: false,
        evidence: [
          "integrity",
          "issuer",
          "accreditation",
          "status",
          "provenance",
        ].map((check) => ({
          check: check as VerificationEvidence["check"],
          valid: false,
          detail: "Credential reference was not found",
          checkedAt: new Date().toISOString(),
        })),
      };
    }
    return this.verify(stored.credential);
  }
}
