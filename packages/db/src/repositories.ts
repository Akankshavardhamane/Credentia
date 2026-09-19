import type {
  AuditEvent,
  AuditRepository,
  Credential,
  CredentialLifecycle,
  CredentialRepository,
  Institution,
  InstitutionRepository,
  StatusRepository,
} from "@credentia/domain";
export class DrizzleInstitutionRepository implements InstitutionRepository {
  constructor(
    private readonly query: {
      list(): Promise<Institution[]>;
      findByDid(did: string): Promise<Institution | undefined>;
      save(value: Institution): Promise<Institution>;
    },
  ) {}
  list() {
    return this.query.list();
  }
  findByDid(did: string) {
    return this.query.findByDid(did);
  }
  save(value: Institution) {
    return this.query.save(value);
  }
}
export class DrizzleCredentialRepository implements CredentialRepository {
  constructor(
    private readonly query: {
      findById(id: string): Promise<Credential | undefined>;
      save(value: Credential): Promise<Credential>;
    },
  ) {}
  findById(id: string) {
    return this.query.findById(id);
  }
  save(value: Credential) {
    return this.query.save(value);
  }
}
export class DrizzleStatusRepository implements StatusRepository {
  constructor(
    private readonly query: {
      get(id: string): Promise<CredentialLifecycle | undefined>;
      set(
        id: string,
        status: CredentialLifecycle,
        reason?: string,
      ): Promise<void>;
    },
  ) {}
  get(id: string) {
    return this.query.get(id);
  }
  set(id: string, status: CredentialLifecycle, reason?: string) {
    return this.query.set(id, status, reason);
  }
}
export class DrizzleAuditRepository implements AuditRepository {
  constructor(private readonly write: (event: AuditEvent) => Promise<void>) {}
  record(event: AuditEvent) {
    return this.write(event);
  }
}
