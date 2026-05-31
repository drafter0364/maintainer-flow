# Maintainer Flow

[![CI](https://github.com/drafter0364/maintainer-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/drafter0364/maintainer-flow/actions/workflows/ci.yml)
[![CodeQL](https://github.com/drafter0364/maintainer-flow/actions/workflows/codeql.yml/badge.svg)](https://github.com/drafter0364/maintainer-flow/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Maintainer Flow is an agent-ready CLI and GitHub Action for open-source maintainers. It reviews pull requests, triages issues, and checks release readiness without taking control away from humans.

[中文说明](README.zh-CN.md) · [Roadmap](ROADMAP.md)

## Why this exists

Open-source maintainers spend too much time on repetitive review logistics: missing reproductions, risky workflow changes, dependency churn, sparse release notes, and noisy pull requests. Maintainer Flow turns those checks into a repeatable report that can run in CI or locally.

The default engine is deterministic and works without an API key. If you provide an OpenAI-compatible API key, Maintainer Flow adds a concise maintainer-facing agent summary while treating repository content as untrusted input.

## Features

- Pull request review notes: changed file categories, source-without-tests warnings, CI risk, security-sensitive paths, dependency changes, and large change sets.
- Issue triage notes: missing reproduction details, suggested labels, short reports, and public security-report warnings.
- Release readiness notes: sparse release notes, missing version, dependency updates, and workflow changes before tagging.
- GitHub Action comments: create or update one advisory comment on pull requests and issues.
- CLI-first design: run the same checks locally, in another CI system, or inside your own maintainer agent.
- Optional agent summary: use an OpenAI-compatible endpoint only when explicitly configured.

## Quick start

From a local clone:

```bash
npm install
npm run build
```

Analyze a pull request diff:

```bash
git diff --unified=0 origin/main...HEAD > pr.diff
node dist/cli.js pr --diff pr.diff
```

Analyze an issue from text:

```bash
node dist/cli.js issue \
  --title "Bug: app crashes on startup" \
  --body "It crashes on startup." \
  --labels bug
```

Generate JSON for another agent or bot:

```bash
node dist/cli.js pr --diff pr.diff --format json
```

## GitHub Action

```yaml
name: Maintainer Flow

on:
  pull_request:
  issues:
    types: [opened, edited]
  release:
    types: [published]

permissions:
  contents: read
  pull-requests: read
  issues: write

jobs:
  maintainer-flow:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: drafter0364/maintainer-flow@main
        with:
          mode: auto
          comment: true
          fail-on: high
```

Optional agent summary:

```yaml
      - uses: drafter0364/maintainer-flow@main
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          openai-model: gpt-4.1-mini
```

## Design principles

- Human authority first: the tool reports risk and suggestions; it does not merge, close, label, or edit issues automatically.
- Small trusted core: deterministic rules run without network access or model calls.
- Agent-safe boundaries: PR, issue, diff, and release text are treated as untrusted input.
- Maintainer time matters: reports prefer concrete next actions over long summaries.
- Open-source friendly: the project includes CI, CodeQL, Dependabot, contributing guidance, and a security policy from day one.

## CLI reference

```text
maintainer-flow pr --diff pr.diff [--title "..."] [--body-file body.md]
maintainer-flow issue --title "Bug title" --body-file issue.md [--labels bug,needs-triage]
maintainer-flow issue --event event.json
maintainer-flow release --version v1.2.3 --notes-file RELEASE.md [--diff changes.diff]
```

Common options:

- `--format json` or `--json`: output JSON instead of Markdown.
- `--output <path>`: write the report to a file.
- `--fail-on <risk>`: exit with code 1 when risk is at least `low`, `medium`, or `high`.
- `--openai-api-key <key>`: enable the optional agent summary.
- `--openai-base-url <url>`: use another OpenAI-compatible endpoint.
- `--openai-model <model>`: select the model for summaries.

Once this package is published to npm, the same commands can be run with `npx maintainer-flow@latest ...`. Until a release tag exists, GitHub Action examples use `@main`; production workflows should pin a version tag or commit SHA.

## Project status

Maintainer Flow is an early OSS project. The current goal is to make maintainer workflows safer and easier for real repositories before adding automation that changes repository state.

Good first contributions:

- New deterministic checks for common maintainer pain points.
- Tests for tricky diff, issue, and release examples.
- Documentation examples for different ecosystems.
- Translations that keep the technical meaning precise.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Please keep changes small, tested, and clearly tied to maintainer value.

Security reports should follow [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
