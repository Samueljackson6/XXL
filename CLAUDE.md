# XXL Tower Defense

微信小游戏竖屏塔防。Phaser 3.80.1 + TypeScript strict + Vite。400×700 视口，6×10 网格，30 波敌人，3 种防御塔。

## 原则

- **零 DOM**：所有 UI（HUD、塔选择栏、信息面板、浮动文字）必须用 Phaser Game Objects。禁止 `document.*`、`window.*`（main.ts 的 Phaser 初始化除外）。
- **配置驱动**：所有数值集中在 `src/utils/config.ts`，无魔法数字。
- **严格模式**：TS strict 永开，禁止 `any`。
- **职责单一**：GameScene ≤ 200 行，仅做协调。系统类自包含数据。

## 约束

- 微信小游戏：包体 < 4MB（目标 < 2MB）、RAM < 256MB、纯触摸、无浏览器 API
- 所有资产 < 100KB（PNG-8 精灵图）
- 触摸热区 ≥ 44×44px
- 字体仅用 Arial/sans-serif

## 命令

```bash
pnpm dev           # 浏览器开发服务器 :5173
pnpm build         # 浏览器构建
pnpm build:mp      # 微信小游戏构建
pnpm lint          # ESLint
pnpm format        # Prettier
pnpm typecheck     # TS 类型检查
pnpm test          # Vitest
pnpm test:watch    # Vitest 监听模式
```

## 架构

```
src/
  scenes/       — Phaser Scene 子类
  entities/     — Phaser Container 子类（塔、敌人、投射物）
  systems/      — 纯逻辑类（波次、经济、网格）
  ui/           — Phaser UI 组件
  utils/        — 配置、工具函数
  audio/        — 音频管理
  fx/           — 特效（浮动文字、对象池）
```

## 实施计划

按 4 个 Phase 递进：
- Phase 1：修复 3 个阻断 Bug + 配置对齐 + 投射物追踪 + 炮塔 AOE
- Phase 2：纯 Phaser UI 重构 + 状态机 + 经济奖励 + HUD 重写
- Phase 3：塔信息面板 + 浮动文字 + 对象池 + 音频
- Phase 4：微信构建 + 触摸优化 + 存档 + 性能

详见 `docs/game-design-doc-v1.2.md`（最终设计规范）。
