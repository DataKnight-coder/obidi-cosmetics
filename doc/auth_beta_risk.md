# Auth.js Beta Dependency Risk Assessment & Policies

## Current Status
The project depends on:
```json
"next-auth": "5.0.0-beta.31"
```
This is required because the application implements Auth.js v5 edge-compatible APIs.

## Production-Risk Warnings
* **Prerelease Software**: NextAuth v5 is in beta. Bugs, security regressions, or breaking changes can occur on upgrade.
* **Upgrade Controls**: Upgrades must be isolated in a separate feature branch. Dependabot, Renovate, or other automated dependency upgrade services are strictly prohibited from automatically merging updates to `next-auth`.
* **Testing Mandate**: The complete suite of authentication integration and unit tests must be executed and verified before every production deployment.
* **Lockfile Integrity**: The exact lockfile (`package-lock.json`) must remain committed to prevent upstream dependency drift during deployments.
