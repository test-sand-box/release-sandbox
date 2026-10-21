# release-sandbox

Synthetic CI sandbox test. Everything in this repository is made up: no real systems, artifacts or data.

- `main` is protected: changes go through a reviewed pull request, with no bypass.
- `ledger` is the records branch: only the writer App may add commits, and nobody may force-push or delete it.
- `.github/workflows/verify.yaml` writes one synthetic record per run and attests it.
