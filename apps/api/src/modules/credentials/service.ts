import { type KeyObject, randomUUID } from "node:crypto";
import {
  type VerifiableCredential,
  issueCredential,
  signCredential,
  supersedeCredential,
} from "@credentia/credential-core";
import {
  type CredentialLifecycle,
  transitionCredential,
} from "@credentia/domain";
import { ConflictError, NotFoundError } from "../../shared/errors.js";
import type { CredentialQrService } from "./qr.js";
import type { CredentialRepositoryPort } from "./repository.js";
export class CredentialService {
  constructor(
    private readonly repository: CredentialRepositoryPort,
    private readonly signer: {
      privateKey: KeyObject;
      verificationMethod: string;
    },
    private readonly qr: CredentialQrService,
  ) {}
  async issue(input: {
    id?: string;
    issuer: string;
    subject: VerifiableCredential["credentialSubject"];
    statusIndex?: number;
    statusListId?: string;
    validFrom?: string;
    credentialVersion?: number;
    supersedesCredentialId?: string;
  }) {
    const credential = signCredential(
      issueCredential({
        id: input.id ?? `urn:uuid:${randomUUID()}`,
        issuer: input.issuer,
        subject: input.subject,
        statusIndex: input.statusIndex ?? (await this.nextStatusIndex()),
        statusListId: input.statusListId ?? "urn:credentia:status:local",
        validFrom: input.validFrom,
        credentialVersion: input.credentialVersion,
        supersedesCredentialId: input.supersedesCredentialId,
      }),
      this.signer.privateKey,
      this.signer.verificationMethod,
    );
    return this.repository.save({
      credential,
      lifecycle: "active",
      ...(await this.qr.generate(credential.id)),
    });
  }
  async get(id: string) {
    const record = await this.repository.findById(id);
    if (!record) throw new NotFoundError("Credential not found");
    return record;
  }
  async updateStatus(id: string, status: CredentialLifecycle, reason?: string) {
    const record = await this.get(id);
    try {
      return this.repository.update(id, {
        lifecycle: transitionCredential(record.lifecycle, status),
        reason,
      });
    } catch (error) {
      throw new ConflictError(
        error instanceof Error ? error.message : "Invalid lifecycle transition",
      );
    }
  }
  async supersede(
    id: string,
    input: {
      id?: string;
      subject?: VerifiableCredential["credentialSubject"];
      validFrom?: string;
    },
  ) {
    const previous = await this.get(id);
    const replacement = await this.issue({
      id: input.id,
      issuer: previous.credential.issuer,
      subject: input.subject ?? previous.credential.credentialSubject,
      statusIndex:
        Number(previous.credential.credentialStatus.statusListIndex) + 1,
      statusListId: previous.credential.credentialStatus.statusListCredential,
      validFrom: input.validFrom,
      credentialVersion: (previous.credential.credentialVersion ?? 1) + 1,
      supersedesCredentialId: previous.credential.id,
    });
    this.repository.update(id, {
      lifecycle: "superseded",
      supersededByCredentialId: replacement.credential.id,
      credential: supersedeCredential(
        previous.credential,
        replacement.credential.id,
      ),
    });
    return replacement;
  }
  versions(id: string) {
    return this.repository.listVersions(id);
  }
  async presentation(id: string) {
    const record = await this.get(id);
    const { credential } = record;
    return {
      credentialId: credential.id,
      title: "Academic Credential",
      institution: credential.issuer,
      recipientReference: credential.credentialSubject.id,
      degree: credential.credentialSubject.degree,
      graduationDate: credential.credentialSubject.graduationDate,
      issuedAt: credential.validFrom,
      lifecycle: record.lifecycle,
      version: credential.credentialVersion ?? 1,
      verificationUrl: record.verificationUrl,
      qrCodeDataUrl: record.qrCodeDataUrl,
    };
  }
  private nextStatusIndex() {
    return Promise.resolve(this.repository.count());
  }
}
