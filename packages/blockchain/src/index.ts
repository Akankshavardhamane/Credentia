export interface AccreditationRecord {
  did: string;
  issuerAddress: `0x${string}`;
  validFrom: Date;
  validUntil: Date;
  revoked: boolean;
  metadataUri: string;
}
export interface BlockchainAdapter {
  getInstitution(did: string): Promise<AccreditationRecord | undefined>;
  isAccredited(did: string, at?: Date): Promise<boolean>;
}
export class MockBlockchainAdapter implements BlockchainAdapter {
  constructor(private readonly records: AccreditationRecord[] = []) {}
  async getInstitution(did: string) {
    return this.records.find((record) => record.did === did);
  }
  async isAccredited(did: string, at = new Date()) {
    const record = await this.getInstitution(did);
    return Boolean(
      record &&
        !record.revoked &&
        record.validFrom <= at &&
        record.validUntil >= at,
    );
  }
}
export interface RegistryArtifact {
  abi: readonly unknown[];
  address: `0x${string}`;
  chainId: number;
}
export function registryArtifactFromDeployment(
  input: RegistryArtifact,
): RegistryArtifact {
  if (!input.address || !input.chainId)
    throw new Error("Deployment artifact requires address and chain ID");
  return input;
}
