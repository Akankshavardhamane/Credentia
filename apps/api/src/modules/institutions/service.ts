import { randomUUID } from "node:crypto";
import type { InstitutionRepository } from "./repository.js";
import type { Institution } from "./types.js";
export class InstitutionService {
  constructor(private readonly repo: InstitutionRepository) {}
  list() {
    return this.repo.list();
  }
  register(
    input: Omit<
      Institution,
      "id" | "accreditationStatus" | "accreditationValidFrom"
    >,
  ) {
    if (this.repo.findByDid(input.did))
      throw new Error("Institution DID is already registered");
    return this.repo.save({
      ...input,
      id: randomUUID(),
      accreditationStatus: "pending",
    });
  }
  setStatus(did: string, status: Institution["accreditationStatus"]) {
    const institution = this.repo.findByDid(did);
    if (!institution) throw new Error("Institution not found");
    return this.repo.save({
      ...institution,
      accreditationStatus: status,
      accreditationValidFrom:
        status === "approved"
          ? new Date().toISOString()
          : institution.accreditationValidFrom,
    });
  }
}
