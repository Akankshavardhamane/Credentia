# Security boundaries

On-chain: issuer/trust registry state and non-PII references only. Off-chain: student PII, credential bodies, documents, and private keys. The web app has no direct database or private-key access. The API verifies all claims independently and does not trust a browser verification result.
