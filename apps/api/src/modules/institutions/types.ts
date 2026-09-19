export interface Institution {
  id: string;
  legalName: string;
  country: string;
  did: string;
  issuerAddress: string;
  accreditationStatus: "pending" | "approved" | "revoked";
  accreditationValidFrom?: string;
  accreditationValidUntil?: string;
}
