import type { KeyObject } from "node:crypto";
import type { BlockchainAdapter } from "@credentia/blockchain";
import {
  type CredentialStatus,
  type VerifiableCredential,
  checkCredentialStatus,
} from "@credentia/credential-core";
import type { VerificationEvidence } from "@credentia/domain";
import type { VerificationRepository } from "./repository.js";
export class VerificationService {
  constructor(
    private readonly chain: BlockchainAdapter,
    private readonly publicKey: string | Buffer | KeyObject,
    private readonly statuses: CredentialStatus[],
    private readonly repo: VerificationRepository,
  ) {}
  async verify(
    credential: VerifiableCredential,
    verifySignature: (
      c: VerifiableCredential,
      key: string | Buffer | KeyObject,
    ) => boolean,
  ) {
    const checkedAt = new Date().toISOString();
    const accredited = await this.chain.isAccredited(credential.issuer);
    const status = checkCredentialStatus(
      this.statuses,
      Number(credential.credentialStatus.statusListIndex),
    );
    const evidence: VerificationEvidence[] = [
      {
        check: "integrity",
        valid: verifySignature(credential, this.publicKey),
        detail: "Ed25519 Data Integrity proof",
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
        detail: "W3C Bitstring status entry",
        checkedAt,
      },
      {
        check: "provenance",
        valid:
          credential.type.includes("AcademicCredential") &&
          Boolean(credential.credentialStatus.statusListCredential),
        detail: "Academic type and status-list provenance are present",
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
}
