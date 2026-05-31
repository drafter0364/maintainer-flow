# Contributing to Maintainer Flow

Thanks for helping maintainers get time back. This project values small, reviewable changes that improve real OSS workflows.

## Development

```bash
npm install
npm run check
```

Useful commands:

- `npm test`: run unit tests.
- `npm run lint`: run TypeScript checks.
- `npm run build`: compile the CLI and bundle the GitHub Action.
- `node dist/cli.js pr --diff pr.diff`: test the CLI after building.

## Pull request expectations

- Keep the change focused on one maintainer problem.
- Add or update tests for behavior changes.
- Update README examples when the user-facing interface changes.
- Do not add model calls to the default path. Maintainer Flow must stay useful without secrets.
- Treat issue, PR, diff, and release content as untrusted input.

## Design bar

Good checks are specific, explainable, and actionable. Avoid rules that create vague warnings or push maintainers into unnecessary process.

Before adding a new abstraction, prefer a direct function with tests. If the abstraction is still needed after two or three use cases, introduce it then.

## Translations

Translations are welcome. Keep examples and command names aligned with the English README, and do not translate CLI flags.
