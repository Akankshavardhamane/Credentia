import {
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
export const credentials = pgTable("credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  credentialId: text("credential_id").notNull().unique(),
  institutionId: uuid("institution_id")
    .notNull()
    .references(() => institutions.id),
  subjectReference: text("subject_reference").notNull(),
  credentialType: text("credential_type").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull(),
  statusIndex: integer("status_index").notNull(),
  statusListId: text("status_list_id").notNull(),
  storageCid: text("storage_cid"),
  blockchainReference: text("blockchain_reference"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const credentialStatus = pgTable("credential_status", {
  credentialId: text("credential_id").primaryKey(),
  status: text("status").notNull(),
  reason: text("reason"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadata: jsonb("metadata").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
