# Maintainer Flow

[![CI](https://github.com/drafter0364/maintainer-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/drafter0364/maintainer-flow/actions/workflows/ci.yml)
[![CodeQL](https://github.com/drafter0364/maintainer-flow/actions/workflows/codeql.yml/badge.svg)](https://github.com/drafter0364/maintainer-flow/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Maintainer Flow 是一个面向开源维护者的 CLI 和 GitHub Action。它帮助维护者审查 PR、初筛 issue、检查发布风险，同时保留人的最终判断权。

[English README](README.md) · [Roadmap](ROADMAP.md)

## 为什么做这个项目

开源维护者最稀缺的不是代码，而是稳定、可持续的维护时间。重复的 PR 风险检查、缺少复现信息的 bug、依赖升级、CI 工作流变更和发布说明不足，都会消耗维护精力。

Maintainer Flow 把这些检查沉淀为可重复运行的报告。默认规则不需要 API key；如果配置 OpenAI-compatible API key，它会额外生成简洁的维护者摘要，但仍把 PR、issue、diff 和 release 内容视为不可信输入。

## 功能

- PR 审查提示：文件类别、源码改动但无测试、CI 风险、安全敏感路径、依赖变更和大体量改动。
- Issue 初筛提示：缺少复现信息、建议标签、内容过短、公有安全报告风险。
- Release 检查：发布说明过短、缺少版本、依赖更新、发布工作流变更。
- GitHub Action 评论：在 PR 或 issue 下创建或更新一条建议性报告。
- CLI 优先：同一套检查可以在本地、其他 CI 或维护者 agent 中运行。
- 可选 agent 摘要：只有显式配置 API key 时才调用模型。

## 快速开始

从本地 clone 使用：

```bash
npm install
npm run build
```

分析 PR diff：

```bash
git diff --unified=0 origin/main...HEAD > pr.diff
node dist/cli.js pr --diff pr.diff
```

分析 issue：

```bash
node dist/cli.js issue \
  --title "Bug: app crashes on startup" \
  --body "It crashes on startup." \
  --labels bug
```

输出 JSON，交给其他 agent 或机器人继续处理：

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

可选 agent 摘要：

```yaml
      - uses: drafter0364/maintainer-flow@main
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          openai-model: gpt-4.1-mini
```

## 设计原则

- 人类维护者优先：工具只报告风险和建议，不自动 merge、关闭、打标签或改写 issue。
- 小而可信的核心：默认启发式规则不依赖网络和模型。
- 面向 agent 的安全边界：仓库文本、issue、PR、diff 和发布说明都被视为不可信输入。
- 尊重维护者时间：报告给出具体下一步，而不是冗长解释。
- 开源友好：项目从第一天开始提供 CI、CodeQL、Dependabot、贡献指南和安全策略。

## CLI 参考

```text
maintainer-flow pr --diff pr.diff [--title "..."] [--body-file body.md]
maintainer-flow issue --title "Bug title" --body-file issue.md [--labels bug,needs-triage]
maintainer-flow issue --event event.json
maintainer-flow release --version v1.2.3 --notes-file RELEASE.md [--diff changes.diff]
```

常用参数：

- `--format json` 或 `--json`：输出 JSON。
- `--output <path>`：写入报告文件。
- `--fail-on <risk>`：当风险至少为 `low`、`medium` 或 `high` 时返回非零退出码。
- `--openai-api-key <key>`：启用可选 agent 摘要。
- `--openai-base-url <url>`：使用其他 OpenAI-compatible endpoint。
- `--openai-model <model>`：选择摘要模型。

发布到 npm 之后，可以用 `npx maintainer-flow@latest ...` 运行同样命令。在第一个 release tag 创建前，GitHub Action 示例使用 `@main`；生产工作流应固定到版本 tag 或 commit SHA。

## 项目状态

Maintainer Flow 目前是早期开源项目。当前目标是先服务真实维护场景，再谨慎增加会改变仓库状态的自动化能力。

适合新贡献者的方向：

- 为常见维护痛点增加确定性检查。
- 为复杂 diff、issue 和 release 场景补测试。
- 补充不同技术生态的使用示例。
- 做翻译，但要保持技术含义准确。

## 参与贡献

提交 PR 前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。请保持改动小、可测试，并且明确服务维护者价值。

安全问题请按 [SECURITY.md](SECURITY.md) 处理。

## 许可

MIT。见 [LICENSE](LICENSE)。
