export class VerificationRepository {
  readonly events: { credentialId: string; at: string }[] = [];
  save(credentialId: string) {
    this.events.push({ credentialId, at: new Date().toISOString() });
  }
}
