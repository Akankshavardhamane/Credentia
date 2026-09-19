import type { KeyObject } from "node:crypto";
import type { BlockchainAdapter } from "@credentia/blockchain";
import {
  type VerifiableCredential,
  isVerifiableCredential,
  verifyCredential,
} from "@credentia/credential-core";
import type { VerificationEvidence } from "@credentia/domain";
import type { CredentialRepositoryPort } from "../credentials/repository.js";
import type { VerificationRepository } from "./repository.js";

export class VerificationService {
  constructor(
    private readonly chain: BlockchainAdapter,
    private readonly keyResolver: (
      verificationMethod: string,
    ) => string | Buffer | KeyObject | undefined,
    private readonly credentials: CredentialRepositoryPort,
    private readonly repo: VerificationRepository,
  ) {}
  async verify(credential: VerifiableCredential) {
    const checkedAt = new Date().toISOString();
    if (!isVerifiableCredential(credential)) {
      const evidence: VerificationEvidence[] = [
        "integrity",
        "issuer",
        "accreditation",
        "status",
        "provenance",
      ].map((check) => ({
        check: check as VerificationEvidence["check"],
        valid: false,
        detail: "Credential structure or proof is malformed",
        checkedAt,
      }));
      const credentialId = String(
        (credential as { id?: unknown })?.id ?? "unknown",
      );
      this.repo.save(credentialId);
      return { credentialId, trusted: false, evidence };
    }
    const accredited = await this.chain.isAccredited(credential.issuer);
    const stored = await this.credentials.findById(credential.id);
    const key = credential.proof
      ? this.keyResolver(credential.proof.verificationMethod)
      : undefined;
    const integrity =
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
    const result = {
      credentialId: credential.id,
      trusted: evidence.every((item) => item.valid),
      evidence,
    };
    const recorder = this.credentials as CredentialRepositoryPort & {
      recordVerification?: (
        id: string,
        trusted: boolean,
        evidence: unknown,
      ) => Promise<void>;
    };
    await recorder.recordVerification?.(
      credential.id,
      result.trusted,
      evidence,
    );
    return result;
  }
  async verifyById(credentialId: string) {
    const stored = await this.credentials.findById(credentialId);
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
