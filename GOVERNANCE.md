# Governance

Maintainer Flow starts with a lightweight maintainer model.

## Roles

- Maintainers review releases, security fixes, project direction, and contributor access.
- Contributors propose issues, documentation, tests, rules, and integrations through pull requests.

## Decision making

Project decisions should be made in public issues or pull requests when possible. Maintainers should prefer reversible, incremental decisions over broad rewrites.

## Release policy

Releases should include:

- Passing CI.
- Updated bundled action output in `dist/action`.
- Clear release notes.
- A security and dependency review when dependencies changed.
