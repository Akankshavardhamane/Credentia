import type { VerifiableCredential } from "@credentia/credential-core";
import type { CredentialLifecycle } from "@credentia/domain";
export interface StoredCredential {
  credential: VerifiableCredential;
  lifecycle: CredentialLifecycle;
  verificationUrl?: string;
  qrCodeDataUrl?: string;
  reason?: string;
  supersededByCredentialId?: string;
}
export class CredentialRepository {
  private readonly items = new Map<string, StoredCredential>();
  save(record: StoredCredential) {
    this.items.set(record.credential.id, record);
    return record;
  }
  findById(id: string) {
    return this.items.get(id);
  }
  update(id: string, changes: Partial<StoredCredential>) {
    const current = this.findById(id);
    if (!current) throw new Error("Credential not found");
    return this.save({ ...current, ...changes });
  }
  count() {
    return this.items.size;
  }
  listVersions(id: string) {
    const current = this.findById(id);
    if (!current) return [];
    const root =
      current.credential.supersedesCredentialId ?? current.credential.id;
    return [...this.items.values()].filter(
      ({ credential }) =>
        credential.id === root ||
        credential.supersedesCredentialId === root ||
        credential.id === id ||
        credential.supersedesCredentialId === id,
    );
  }
}
