import { buildApp } from "./app.js";
import { credentialFixtureInputs } from "./modules/credentials/fixtures.js";

const app = buildApp();
const issue = async (name: keyof typeof credentialFixtureInputs) => {
  const response = await app.inject({
    method: "POST",
    url: "/credentials",
    payload: credentialFixtureInputs[name],
  });
  if (response.statusCode !== 201)
    throw new Error(`Could not create ${name} fixture: ${response.body}`);
  return response.json().credential;
};
const valid = await issue("valid");
const revoked = await issue("revoked");
const suspended = await issue("suspended");
const expired = await issue("expired");
const superseded = await issue("superseded");
const untrustedIssuer = await issue("untrustedIssuer");
await Promise.all(
  ["revoked", "suspended", "expired"].map((status) =>
    app.inject({
      method: "POST",
      url: `/credentials/${encodeURIComponent(`urn:credentia:demo:${status}`)}/status`,
      payload: { status },
    }),
  ),
);
const replacement = await app.inject({
  method: "POST",
  url: `/credentials/${encodeURIComponent(superseded.id)}/supersede`,
  payload: { id: "urn:credentia:demo:superseded-v2" },
});
console.log(
  JSON.stringify(
    {
      valid,
      tampered: { ...valid, issuer: "did:web:attacker.example" },
      revoked,
      suspended,
      expired,
      superseded,
      supersededReplacement: replacement.json().credential,
      untrustedIssuer,
    },
    null,
    2,
  ),
);
await app.close();
