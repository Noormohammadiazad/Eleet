# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Instead, use GitHub's private
vulnerability reporting ("Security" → "Report a vulnerability") on the
[repository](https://github.com/Noormohammadiazad/Eleet). You will receive an acknowledgement as soon
as possible, and a fix or mitigation plan once the report has been reproduced.

## Threat model

Eleet is a static, client-side application. There is no server component that could store or leak
user data. The relevant risks are therefore in the browser:

| Risk                                                      | Mitigation                                                                                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exfiltration of user text by injected or third-party code | Strict CSP (`default-src 'self'`, hashed inline script, `connect-src 'self'`, `object-src 'none'`); no third-party scripts, styles or fonts; no `{@html}` rendering of user content. |
| Leaking shared content to the host                        | Share state is carried in the URL fragment, which browsers do not send in requests; `no-referrer` policy on outbound links.                                                          |
| Secrets persisting on shared computers                    | Secret options (passwords, HMAC keys) are never written to storage or links; input text is never persisted.                                                                          |
| Malicious share links                                     | Payloads are decompressed, parsed and validated against each tool's schema (unknown keys dropped, numbers clamped, lengths bounded) before use.                                      |
| Weak cryptography in the AES tool                         | AES-256-GCM via WebCrypto, PBKDF2-SHA-256 with 600 000 iterations by default, random 128-bit salt and 96-bit nonce per message, authenticated header.                                |
| Stale or mixed code after a deployment                    | The service worker activates a new version only after user confirmation; assets are content-hashed.                                                                                  |

## Scope and honest limitations

- **Classical ciphers are not security.** Caesar, Vigenère, Enigma, XOR with a short key and the rest
  are historical and educational; Eleet itself can break most of them.
- **MD5, SHA-1 and CRC-32 are not collision-resistant.** They are offered for compatibility and
  checksums only; the UI labels them as broken.
- **Steganography is not encryption.** Zero-width and tag characters are easy to detect (the Unicode
  Inspector does exactly that). Encrypt first if the content matters.
- The AES tool protects text stored or sent through channels you choose; it cannot protect against a
  compromised device or browser extension with access to the page.

## Supported versions

Only the latest deployment at [eleet.ir](https://eleet.ir) is supported.
