import {
  type CredentialLifecycle,
  type VerificationResult,
  credentialPresentationSchema,
  issueCredentialRequestSchema,
  verificationResultSchema,
} from "@credentia/domain";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";
export interface IssuedRecord {
  credential: Record<string, unknown>;
  lifecycle: CredentialLifecycle;
  verificationUrl: string;
  qrCodeDataUrl: string;
}
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body as T;
}
export function issueCredential(input: unknown) {
  return request<IssuedRecord>("/credentials", {
    method: "POST",
    body: JSON.stringify(issueCredentialRequestSchema.parse(input)),
  });
}
export function getPresentation(id: string) {
  return request(`/credentials/${encodeURIComponent(id)}/presentation`).then(
    (value) => credentialPresentationSchema.parse(value),
  );
}
export function verifyCredentialReference(credentialId: string) {
  return request<VerificationResult>("/verify", {
    method: "POST",
    body: JSON.stringify({ credentialId }),
  }).then((value) => verificationResultSchema.parse(value));
}
export function verifyCredentialPayload(credential: Record<string, unknown>) {
  return request<VerificationResult>("/verify", {
    method: "POST",
    body: JSON.stringify({ credential }),
  }).then((value) => verificationResultSchema.parse(value));
}
export function updateCredentialStatus(
  id: string,
  status: CredentialLifecycle,
) {
  return request(`/credentials/${encodeURIComponent(id)}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}
export function supersedeCredential(id: string) {
  return request<IssuedRecord>(
    `/credentials/${encodeURIComponent(id)}/supersede`,
    { method: "POST", body: JSON.stringify({}) },
  );
}
