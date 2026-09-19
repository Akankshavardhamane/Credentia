import {
  type KeyObject,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
} from "node:crypto";
export function loadSigningKeyPair(): {
  privateKey: KeyObject;
  publicKey: KeyObject;
} {
  const configured = process.env.CREDENTIAL_SIGNING_PRIVATE_KEY;
  if (!configured) {
    if (process.env.NODE_ENV === "production")
      throw new Error(
        "CREDENTIAL_SIGNING_PRIVATE_KEY must be configured in production",
      );
    return generateKeyPairSync("ed25519");
  }
  const privateKey = createPrivateKey({
    key: configured,
    format: "pem",
    type: "pkcs8",
  });
  return { privateKey, publicKey: createPublicKey(privateKey) };
}
