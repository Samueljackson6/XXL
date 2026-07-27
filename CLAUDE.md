# XXL Tower Defense

微信小游戏竖屏塔防。运行时由 **Cocos Creator 3.8.8** 构建为微信小游戏（`platform=wechatgame`）。游戏逻辑全部用 TypeScript（严格模式）编写，类型来自 `@cocos/creator-types`。400×700 视口，6×10 网格，30 波敌人，3 种防御塔（箭 / 炮 / 减速）。

> **引擎说明（重要）**：游戏的唯一构建来源是 `assets/scripts/` + `assets/scenes/`。
> - `src/` 是**已归档的 Phaser 旧实现（legacy）**，不再参与构建，仅作参考。
> - `minigame-unity-legacy/`（及历史上的 Unity/团结引擎导出）是更早的方案残留，亦不参与构建。
> - `build/wechatgame/` 是 Cocos 构建产物输出目录（由 `scripts/build-cocos.mjs` 生成），不要手工编辑。

## 原则

- **零 DOM**：游戏内 UI 全部用 Cocos 节点 / 组件实现；禁止 `document.*`、`window.*`（微信适配层除外）。
- **配置驱动**：所有数值集中在 `assets/scripts/utils/GameConfig.ts`，无魔法数字。
- **严格模式**：TS strict 永开，禁止 `any`。
- **职责单一**：GameScene 仅做协调，系统类自包含数据。

## 约束（微信小游戏）

- 首包 < 4MB（目标 < 2MB）、总 RAM < 256MB、纯触摸、WebGL 1.0
- 单资产 < 100KB（PNG-8 精灵图）、触摸热区 ≥ 44×44px
- 字体仅 Arial / sans-serif；无浏览器 API 依赖

## 命令

```bash
pnpm test            # Vitest 单元测试（tests/）
pnpm lint            # ESLint assets/scripts/**/*.ts
pnpm typecheck       # tsc --noEmit
pnpm verify          # test + typecheck
pnpm build:cocos     # Cocos Creator CLI 构建微信小游戏 → build/wechatgame
pnpm deploy          # 构建 + 启动微信开发者工具(auto-port) + 自动编译，用于试玩
```

## 架构（Cocos Creator）

```
assets/
  scripts/
    core/        — GameBootstrap, GameScene（协调）
    entities/    — Enemy / Tower / Projectile / Path（Cocos Component）
    systems/     — Economy / Grid / WaveManager（纯逻辑）
    ui/          — HUD / TowerInfoPanel / TowerSelectBar
    fx/          — FloatingText
    audio/       — AudioManager
    utils/       — GameConfig（集中配置）
  scenes/        — GameScene.scene（launchScene）
  textures/ resources/ prefabs/
```

## 构建与发布

- **构建**：`scripts/build-cocos.mjs` 调用 `G:/Game tools/CocosCreator/CocosCreator.exe --project . --build platform=wechatgame`，产物在 `build/wechatgame`。
- **发布试玩**：`scripts/deploy-wechat.mjs` 先构建，再用微信开发者工具 CLI（`D:/DevCache/微信web开发者工具/cli.bat auto --project build/wechatgame --auto-port 5000 --trust-project`）打开，并通过 `miniprogram-automator` 自动编译。
- ⚠️ `project.json` 中 `APPID` 当前为空：本地试玩可用 DevTools 测试号模式；**上传体验版 / 提交审核需填入真实 AppID**。

## 已知问题 / 待清理（历史遗留，非构建链路）

- `src/`（Phaser）与 `minigame-unity-legacy/`（Unity）为历史方案残留，建议归档或删除，避免混淆。
- 旧辅助脚本（`scripts/*.cjs`、`build-unity.mjs`、`vite.config.ts`、`dist/`）属前代方案；当前有效链路仅 `build-cocos.mjs` / `deploy-wechat.mjs`。
