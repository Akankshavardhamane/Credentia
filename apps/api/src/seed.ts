import { generateKeyPairSync } from "node:crypto";
import {
  issueCredential,
  signCredential,
  supersedeCredential,
} from "@credentia/credential-core";
const keys = generateKeyPairSync("ed25519");
const active = signCredential(
  issueCredential({
    id: "urn:uuid:demo-active",
    issuer: "did:web:demo.university.edu",
    subject: {
      id: "student-demo-001",
      degree: "Bachelor of Computer Science",
      graduationDate: "2026-05-01",
    },
    statusIndex: 0,
    statusListId: "urn:credentia:status:demo",
  }),
  keys.privateKey,
  "did:web:demo.university.edu#key-2",
);
const revoked = {
  ...active,
  id: "urn:uuid:demo-revoked",
  credentialStatus: { ...active.credentialStatus, statusListIndex: "1" },
};
const superseded = supersedeCredential(active, "urn:uuid:demo-replacement");
const fixture = {
  institutions: [
    { did: "did:web:demo.university.edu", accreditation: "approved" },
    { did: "did:web:unaccredited.example", accreditation: "pending" },
  ],
  issuerKeys: [
    {
      verificationMethod: "did:web:demo.university.edu#key-1",
      status: "retired",
    },
    {
      verificationMethod: "did:web:demo.university.edu#key-2",
      status: "active",
    },
  ],
  credentials: {
    active,
    tampered: { ...active, issuer: "did:web:attacker.example" },
    revoked,
    superseded,
  },
};
console.log(JSON.stringify(fixture, null, 2));
