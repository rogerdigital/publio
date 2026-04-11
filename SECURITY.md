# Security Policy

## Supported Versions

Security fixes are considered for the latest version on the `main` branch.

## Reporting a Vulnerability

Please do not report vulnerabilities through public GitHub issues.

Report suspected security issues privately to the project maintainer through the repository owner's public GitHub profile. Include:

- A description of the vulnerability.
- Steps to reproduce or proof-of-concept details.
- Affected versions or commit ranges, if known.
- Any relevant logs, screenshots, or environment details.

The maintainer will review the report and coordinate a fix when the issue is confirmed.

## Secrets

This project reads platform credentials from `.env.local` and the settings UI. Never commit credentials, cookies, tokens, or generated environment files.
