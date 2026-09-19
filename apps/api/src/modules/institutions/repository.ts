import type { Institution } from "./types.js";
export class InstitutionRepository {
  private readonly items = new Map<string, Institution>();
  list() {
    return [...this.items.values()];
  }
  findByDid(did: string) {
    return this.items.get(did);
  }
  save(institution: Institution) {
    this.items.set(institution.did, institution);
    return institution;
  }
}
