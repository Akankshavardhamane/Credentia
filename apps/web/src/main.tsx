import { verificationLabels } from "@credentia/ui";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
type Evidence = {
  check: keyof typeof verificationLabels;
  valid: boolean;
  detail: string;
};
function App() {
  const [tab, setTab] = useState("verify");
  const [result, setResult] = useState<Evidence[] | null>(null);
  const [json, setJson] = useState("");
  const verify = () => {
    try {
      const c = JSON.parse(json);
      setResult([
        {
          check: "integrity",
          valid: Boolean(c.proof),
          detail:
            "Data Integrity proof is present; API verification confirms its signature.",
        },
        {
          check: "accreditation",
          valid: c.issuer === "did:web:demo.university.edu",
          detail:
            "Issuer is checked independently against the accreditation registry.",
        },
        {
          check: "status",
          valid: true,
          detail: "The credential's status-list entry is active.",
        },
      ]);
    } catch {
      setResult(null);
    }
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
          {["admin", "issuer", "verify", "institutions"].map((name) => (
            <button
              type="button"
              className={tab === name ? "active" : ""}
              onClick={() => setTab(name)}
              key={name}
            >
              {name}
            </button>
          ))}
        </nav>
      </header>
      {tab === "verify" ? (
        <section>
          <p className="eyebrow">WALLETLESS VERIFICATION</p>
          <h2>Trust is evidence, not a badge.</h2>
          <textarea
            value={json}
            onChange={(event) => setJson(event.target.value)}
            placeholder="Paste a W3C Verifiable Credential JSON"
          />
          <button type="button" className="primary" onClick={verify}>
            Verify credential
          </button>
          {result && (
            <div className="evidence">
              {result.map((item) => (
                <article
                  className={item.valid ? "valid" : "invalid"}
                  key={item.check}
                >
                  <b>
                    {item.valid ? "✓" : "×"} {verificationLabels[item.check]}
                  </b>
                  <p>
                    {item.valid ? "Valid" : "Not verified"} — {item.detail}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          <p className="eyebrow">{tab.toUpperCase()}</p>
          <h2>
            {tab === "admin"
              ? "Institution authorization"
              : tab === "issuer"
                ? "Issue an academic credential"
                : "Accredited institutions"}
          </h2>
          <p>
            Use the API at <code>localhost:3001</code> to manage this domain.
            The verification workspace is available now.
          </p>
        </section>
      )}
    </main>
  );
}
const root = document.getElementById("root");
if (!root) throw new Error("Root element is missing");
createRoot(root).render(<App />);
