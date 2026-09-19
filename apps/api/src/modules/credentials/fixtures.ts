export const credentialFixtureInputs = {
  valid: {
    id: "urn:credentia:demo:valid",
    issuer: "did:web:demo.university.edu",
    subject: {
      id: "student-demo-valid",
      degree: "Bachelor of Computer Science",
      graduationDate: "2026-05-01",
    },
  },
  revoked: {
    id: "urn:credentia:demo:revoked",
    issuer: "did:web:demo.university.edu",
    subject: {
      id: "student-demo-revoked",
      degree: "Bachelor of Computer Science",
      graduationDate: "2026-05-01",
    },
  },
  suspended: {
    id: "urn:credentia:demo:suspended",
    issuer: "did:web:demo.university.edu",
    subject: {
      id: "student-demo-suspended",
      degree: "Bachelor of Computer Science",
      graduationDate: "2026-05-01",
    },
  },
  expired: {
    id: "urn:credentia:demo:expired",
    issuer: "did:web:demo.university.edu",
    subject: {
      id: "student-demo-expired",
      degree: "Bachelor of Computer Science",
      graduationDate: "2024-05-01",
    },
  },
  superseded: {
    id: "urn:credentia:demo:superseded",
    issuer: "did:web:demo.university.edu",
    subject: {
      id: "student-demo-superseded",
      degree: "Bachelor of Computer Science",
      graduationDate: "2025-05-01",
    },
  },
  untrustedIssuer: {
    id: "urn:credentia:demo:untrusted",
    issuer: "did:web:untrusted.example",
    subject: {
      id: "student-demo-untrusted",
      degree: "Bachelor of Computer Science",
      graduationDate: "2026-05-01",
    },
  },
} as const;
