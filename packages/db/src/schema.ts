import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
export const accreditationStatus = pgEnum("accreditation_status", [
  "pending",
  "approved",
  "revoked",
]);
export const credentialLifecycle = pgEnum("credential_lifecycle", [
  "active",
  "suspended",
  "revoked",
  "expired",
  "superseded",
]);
export const issuerKeyStatus = pgEnum("issuer_key_status", [
  "active",
  "retired",
  "revoked",
  "compromised",
]);
export const institutions = pgTable("institutions", {
  id: uuid("id").defaultRandom().primaryKey(),
  legalName: text("legal_name").notNull(),
  country: text("country").notNull(),
  did: text("did").notNull().unique(),
  issuerAddress: text("issuer_address").notNull(),
  accreditationStatus: accreditationStatus("accreditation_status")
    .notNull()
    .default("pending"),
  accreditationValidFrom: timestamp("accreditation_valid_from", {
    withTimezone: true,
  }),
  accreditationValidUntil: timestamp("accreditation_valid_until", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const issuers = pgTable(
  "issuers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    institutionId: uuid("institution_id")
      .notNull()
      .references(() => institutions.id),
    did: text("did").notNull().unique(),
    authorizedCredentialTypes: jsonb("authorized_credential_types")
      .$type<string[]>()
      .notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("issuers_institution_id_idx").on(table.institutionId)],
);
export const issuerKeys = pgTable("issuer_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  issuerId: uuid("issuer_id")
    .notNull()
    .references(() => issuers.id),
  verificationMethod: text("verification_method").notNull().unique(),
  publicKey: text("public_key").notNull(),
  status: issuerKeyStatus("status").notNull().default("active"),
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});
export const accreditations = pgTable("accreditations", {
  id: uuid("id").defaultRandom().primaryKey(),
  institutionId: uuid("institution_id")
    .notNull()
    .references(() => institutions.id),
  status: accreditationStatus("status").notNull(),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  sourceReference: text("source_reference"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const credentials = pgTable(
  "credentials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    credentialId: text("credential_id").notNull().unique(),
    institutionId: uuid("institution_id")
      .notNull()
      .references(() => institutions.id),
    issuerId: uuid("issuer_id")
      .notNull()
      .references(() => issuers.id),
    credentialDocument: jsonb("credential_document").notNull(),
    subjectReference: text("subject_reference").notNull(),
    credentialType: text("credential_type").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull(),
    statusIndex: integer("status_index").notNull(),
    statusListId: text("status_list_id").notNull(),
    lifecycle: credentialLifecycle("lifecycle").notNull().default("active"),
    reason: text("reason"),
    supersededByCredentialId: text("superseded_by_credential_id"),
    verificationUrl: text("verification_url"),
    qrCodeDataUrl: text("qr_code_data_url"),
    storageCid: text("storage_cid"),
    blockchainReference: text("blockchain_reference"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("credentials_issuer_id_idx").on(table.issuerId),
    index("credentials_lifecycle_idx").on(table.lifecycle),
  ],
);
export const credentialVersions = pgTable(
  "credential_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    credentialId: text("credential_id")
      .notNull()
      .references(() => credentials.credentialId),
    version: integer("version").notNull(),
    supersedesCredentialId: text("supersedes_credential_id"),
    supersededByCredentialId: text("superseded_by_credential_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("credential_versions_credential_id_idx").on(table.credentialId),
  ],
);
export const credentialStatusHistory = pgTable(
  "credential_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    credentialId: text("credential_id")
      .notNull()
      .references(() => credentials.credentialId),
    status: credentialLifecycle("status").notNull(),
    reason: text("reason"),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("credential_status_history_credential_id_idx").on(table.credentialId),
  ],
);
export const verificationRecords = pgTable(
  "verification_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    credentialId: text("credential_id").notNull(),
    trusted: boolean("trusted").notNull(),
    evidence: jsonb("evidence").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("verification_records_credential_id_idx").on(table.credentialId),
  ],
);
export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadata: jsonb("metadata").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
