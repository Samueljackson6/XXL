# ADR-003: 场景经 Cocos MCP 服务编辑（Scene Authored via Cocos MCP Server）

- **状态（Status）**：Accepted
- **日期**：2026-07-27
- **决策人**：程基岩（技术负责人）

## 上下文（Context）

`GameScene.scene` 是 Cocos 的序列化资产，内含 uuid 引用与节点/组件图的内部一致性（根节点 + `Canvas` + `GameBootstrap`）。手工编辑 `.scene` 的 JSON 极易造成引用断裂、uuid 错乱与场景损坏，且会产生难以合并的二进制/序列化冲突。

工作室已集成 `extensions/cocos-mcp-server`：一个 HTTP MCP 服务（端口 **3000**，仅绑定 `127.0.0.1`），暴露 `scene_management` 等工具，可通过 `POST /api/scene_management` 或标准 `/mcp` 端点对场景图做受控变更。

## 决策（Decision）

1. **所有场景编辑必须经由 Cocos MCP 服务**（经 `scene_management` 工具 / `POST /api/scene_management`），**禁止手工编辑 `.scene` 文件**。
2. **启用扩展的 `autoStart` 配置项**（其在 `package.json` 中默认 `false`）。启用后编辑器打开时服务自动绑定 3000 端口；`CI_WITH_MCP=1` 路径会拉起编辑器并轮询 `http://127.0.0.1:3000/health` 至多 90s。
3. **架构附注**：`GameScene` 在 `onLoad` 中**以代码构建所有层**（grid/path/entities/input），`.scene` 实际仅持有启动节点 + `Canvas` + `GameBootstrap`。这大幅缩小了手工编辑面，但上述"经 MCP 编辑"规则对场景资产依然成立。

## 后果（Consequences）

- **正面**：场景图保持一致性，uuid 引用被保留；AI 代理可经 MCP 确定性地编辑场景。
- **正面**：避免手工编辑序列化场景文件导致的合并冲突与损坏。
- **负面**：场景编辑要求编辑器运行且 MCP 服务已起（本地 / `CI_WITH_MCP=1`）。纯无头 CLI 构建**不依赖** MCP（构建路径不经 MCP），但场景编辑依赖。
- **负面**：`autoStart` 默认 `false`，须在每个编辑器安装上显式启用；须写入开发环境配置文档。
- **负面**：MCP 服务仅绑定 `127.0.0.1`（本地），非远程编辑面。

## 参考（References）

- `extensions/cocos-mcp-server/package.json`（`port` 默认 3000、`autoStart` 默认 false）
- `extensions/cocos-mcp-server/source/mcp-server.ts`（`/health`、`/api/scene_management`、`/mcp` 端点，绑定 127.0.0.1）
- `scripts/ci-full.mjs`（`ensureEditorAndMcp`、`CI_WITH_MCP`）
- `assets/scripts/core/GameScene.ts`（onLoad 代码构建各层）
- `assets/scenes/GameScene.scene`（uuid `25a94596-80db-4c86-bba2-819aa19b4152`）
