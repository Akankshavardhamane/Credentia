import type {
  CredentialLifecycle,
  VerificationResult,
} from "@credentia/domain";
import { verificationLabels } from "@credentia/ui";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  type IssuedRecord,
  getPresentation,
  issueCredential,
  supersedeCredential,
  updateCredentialStatus,
  verifyCredentialPayload,
  verifyCredentialReference,
} from "./api.js";
import "./styles.css";
type Screen = "issue" | "present" | "verify";
type Scenario =
  | "valid"
  | "tampered"
  | "revoked"
  | "suspended"
  | "expired"
  | "superseded"
  | "untrusted";
const scenarios: Scenario[] = [
  "valid",
  "tampered",
  "revoked",
  "suspended",
  "expired",
  "superseded",
  "untrusted",
];
const statusScenarios: Partial<Record<Scenario, CredentialLifecycle>> = {
  revoked: "revoked",
  suspended: "suspended",
  expired: "expired",
};
function App() {
  const [screen, setScreen] = useState<Screen>("issue");
  const [form, setForm] = useState({
    studentId: "student-demo-001",
    degree: "Bachelor of Computer Science",
    graduationDate: "2026-05-01",
    issuer: "did:web:demo.university.edu",
  });
  const [record, setRecord] = useState<IssuedRecord | null>(null);
  const [presentation, setPresentation] = useState<Awaited<
    ReturnType<typeof getPresentation>
  > | null>(null);
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const issue = async (overrides: Partial<typeof form> = {}) => {
    setBusy(true);
    setMessage(null);
    try {
      const input = { ...form, ...overrides };
      const issued = await issueCredential({
        issuer: input.issuer,
        subject: {
          id: input.studentId,
          degree: input.degree,
          graduationDate: input.graduationDate,
        },
      });
      const view = await getPresentation(String(issued.credential.id));
      setRecord(issued);
      setPresentation(view);
      setReference(view.credentialId);
      setScreen("present");
      return issued;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not issue credential",
      );
      return null;
    } finally {
      setBusy(false);
    }
  };
  const verifyReference = async () => {
    setBusy(true);
    setMessage(null);
    try {
      setResult(await verifyCredentialReference(reference));
      setScreen("verify");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not verify credential",
      );
    } finally {
      setBusy(false);
    }
  };
  const runScenario = async (scenario: Scenario) => {
    const issued = await issue({
      studentId: `demo-${scenario}`,
      issuer:
        scenario === "untrusted" ? "did:web:untrusted.example" : form.issuer,
    });
    if (!issued) return;
    const id = String(issued.credential.id);
    if (scenario === "tampered")
      setResult(
        await verifyCredentialPayload({
          ...issued.credential,
          issuer: "did:web:attacker.example",
        }),
      );
    else {
      const lifecycleStatus = statusScenarios[scenario];
      if (lifecycleStatus) await updateCredentialStatus(id, lifecycleStatus);
      if (scenario === "superseded") await supersedeCredential(id);
      setResult(await verifyCredentialReference(id));
    }
    setScreen("verify");
  };
  return (
    <main>
      <header>
        <span className="mark">C</span>
        <div>
          <h1>Credentia</h1>
          <p>Trusted academic credentials</p>
        </div>
        <nav>
          {(["issue", "present", "verify"] as Screen[]).map((name) => (
            <button
              type="button"
              className={screen === name ? "active" : ""}
              onClick={() => setScreen(name)}
              key={name}
            >
              {name}
            </button>
          ))}
        </nav>
      </header>
      {message && <p className="notice">{message}</p>}
      <section className="hero">
        <p className="eyebrow">ACADEMIC CREDENTIAL TRUST</p>
        <h2>
          {screen === "issue"
            ? "Issue a credential with evidence built in."
            : screen === "present"
              ? "A certificate people can understand."
              : "Trust is evidence, not a badge."}
        </h2>
        {screen === "issue" && (
          <IssueForm
            form={form}
            setForm={setForm}
            onIssue={() => void issue()}
            busy={busy}
            onScenario={(scenario) => void runScenario(scenario)}
          />
        )}
        {screen === "present" && (
          <Presentation
            presentation={presentation}
            record={record}
            onVerify={() => void verifyReference()}
          />
        )}
        {screen === "verify" && (
          <Verify
            reference={reference}
            setReference={setReference}
            result={result}
            busy={busy}
            onVerify={() => void verifyReference()}
            onScenario={(scenario) => void runScenario(scenario)}
          />
        )}
      </section>
    </main>
  );
}
function IssueForm({
  form,
  setForm,
  onIssue,
  busy,
  onScenario,
}: {
  form: {
    studentId: string;
    degree: string;
    graduationDate: string;
    issuer: string;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onIssue: () => void;
  busy: boolean;
  onScenario: (scenario: Scenario) => void;
}) {
  return (
    <>
      <div className="form-card">
        <label>
          Student reference
          <input
            value={form.studentId}
            onChange={(event) =>
              setForm({ ...form, studentId: event.target.value })
            }
          />
        </label>
        <label>
          Degree
          <input
            value={form.degree}
            onChange={(event) =>
              setForm({ ...form, degree: event.target.value })
            }
          />
        </label>
        <label>
          Graduation date
          <input
            type="date"
            value={form.graduationDate}
            onChange={(event) =>
              setForm({ ...form, graduationDate: event.target.value })
            }
          />
        </label>
        <label>
          Issuer DID
          <input
            value={form.issuer}
            onChange={(event) =>
              setForm({ ...form, issuer: event.target.value })
            }
          />
        </label>
        <button
          type="button"
          className="primary"
          disabled={busy}
          onClick={onIssue}
        >
          {busy ? "Issuing…" : "Issue signed credential"}
        </button>
      </div>
      <DemoButtons onScenario={onScenario} />
    </>
  );
}
function Presentation({
  presentation,
  record,
  onVerify,
}: {
  presentation: Awaited<ReturnType<typeof getPresentation>> | null;
  record: IssuedRecord | null;
  onVerify: () => void;
}) {
  if (!presentation || !record)
    return <Empty text="Issue a credential to see its presentation." />;
  return (
    <div className="certificate">
      <div>
        <p className="eyebrow">HUMAN-READABLE PRESENTATION</p>
        <h3>{presentation.title}</h3>
        <p className="degree">{presentation.degree}</p>
        <p>
          Presented by <b>{presentation.institution}</b>
        </p>
        <dl>
          <dt>Recipient reference</dt>
          <dd>{presentation.recipientReference}</dd>
          <dt>Credential ID</dt>
          <dd className="mono">{presentation.credentialId}</dd>
          <dt>Version / lifecycle</dt>
          <dd>
            {presentation.version} · {presentation.lifecycle}
          </dd>
        </dl>
        <button type="button" className="primary" onClick={onVerify}>
          Verify this credential
        </button>
      </div>
      <aside>
        <img
          src={presentation.qrCodeDataUrl}
          alt={`QR code for ${presentation.credentialId}`}
        />
        <a href={presentation.verificationUrl}>
          {presentation.verificationUrl}
        </a>
        <small>
          The QR is a verification link. The signed VC remains the
          machine-readable proof.
        </small>
      </aside>
    </div>
  );
}
function Verify({
  reference,
  setReference,
  result,
  busy,
  onVerify,
  onScenario,
}: {
  reference: string;
  setReference: (value: string) => void;
  result: VerificationResult | null;
  busy: boolean;
  onVerify: () => void;
  onScenario: (scenario: Scenario) => void;
}) {
  return (
    <>
      <div className="verify-bar">
        <input
          placeholder="Credential ID or reference"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
        />
        <button
          type="button"
          className="primary"
          disabled={busy || !reference}
          onClick={onVerify}
        >
          {busy ? "Checking…" : "Verify reference"}
        </button>
      </div>
      {result && (
        <div className="result">
          <div
            className={result.trusted ? "trust trust-good" : "trust trust-bad"}
          >
            <span>{result.trusted ? "✓" : "×"}</span>
            <div>
              <b>
                {result.trusted
                  ? "Credential trusted"
                  : "Credential not trusted"}
              </b>
              <p>Each verification check is shown independently below.</p>
            </div>
          </div>
          <div className="evidence">
            {result.evidence.map((item) => (
              <article
                className={item.valid ? "valid" : "invalid"}
                key={item.check}
              >
                <b>
                  {item.valid ? "✓" : "×"} {verificationLabels[item.check]}
                </b>
                <p>
                  {item.valid ? "Passed" : "Failed"} — {item.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
      <DemoButtons onScenario={onScenario} />
    </>
  );
}
function DemoButtons({
  onScenario,
}: { onScenario: (scenario: Scenario) => void }) {
  return (
    <div className="demo">
      <p className="eyebrow">DEMO SCENARIOS</p>
      {scenarios.map((scenario) => (
        <button
          type="button"
          key={scenario}
          onClick={() => onScenario(scenario)}
        >
          {scenario}
        </button>
      ))}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <p className="empty">{text}</p>;
}
const root = document.getElementById("root");
if (!root) throw new Error("Root element is missing");
createRoot(root).render(<App />);
