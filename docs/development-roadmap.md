# 开发路线图 — XXL Tower Defense（Cocos Creator 3.8.8）

> 结合 v2.0 设计内容 + Cocos Creator 特性，按优先级分解为可执行任务。

---

## 总览

```
Phase 0（已完成）: Cocos Creator 项目初始化 + 核心逻辑迁移
Phase 1（进行中）: UI 完善 + 微信构建 + 部署测试
Phase 2（待开始）: AI 美术 + 性能优化 + 体验打磨
```

---

## Phase 0：项目初始化与核心逻辑迁移（已完成）

**目标**：可运行的 Cocos Creator 项目 + 完整游戏逻辑。

### P0 — 环境与工程

- [x] T0.1 部署 Cocos Creator 3.8.8 到 `G:\Game tools\CocosCreator\`
- [x] T0.2 创建 `project.json` 项目配置
- [x] T0.3 配置 `tsconfig.json`（Cocos Creator TypeScript）
- [x] T0.4 创建 `assets/scripts/` 目录结构

### P0 — 游戏配置

- [x] T0.5 迁移 `GameConfig.ts`（所有游戏常量）
- [x] T0.6 定义 `TOWER_TYPES`（箭塔/炮塔/减速塔）
- [x] T0.7 定义 `ENEMY_TYPES`（普通/快速/坦克）
- [x] T0.8 定义 `PATH_POINTS`（9 点路径）
- [x] T0.9 定义 `WAVE_CONFIG` + `ECONOMY_CONFIG`

### P0 — 纯逻辑系统

- [x] T0.10 迁移 `Grid.ts`（路径格子检测 + 放置逻辑）
- [x] T0.11 迁移 `Path.ts`（路径计算 + 插值）
- [x] T0.12 迁移 `Economy.ts`（金币/生命/奖励公式）

### P1 — 游戏实体

- [x] T0.13 创建 `Enemy` Component（移动 + HP + 减速）
- [x] T0.14 创建 `Tower` Component（升级 + 射程 + 伤害）
- [x] T0.15 创建 `Projectile` Component（追踪 + AOE + 减速）
- [x] T0.16 创建 `FloatingText` Component（浮动文字特效）

### P1 — 核心系统

- [x] T0.17 创建 `WaveManager` Component（波次管理 + 敌人生成）
- [x] T0.18 创建 `GameScene` Component（主场景 + 状态机 + 输入）
- [x] T0.19 创建 `GameBootstrap` Component（入口点）

### P1 — UI 系统

- [x] T0.20 创建 `HUD` Component（金币/生命/波次显示）
- [x] T0.21 创建 `TowerSelectBar` Component（塔选择栏 + 开始按钮）
- [x] T0.22 创建 `TowerInfoPanel` Component（塔详情 + 升级/出售）
- [x] T0.23 创建 `AudioManager`（Web Audio API 音效）

### P0 — 测试框架

- [x] T0.24 创建 `vitest.config.ts`（cc 模块 mock + 路径别名）
- [x] T0.25 创建 `tests/unit/mocks/cc.ts`（Cocos Creator API mock）
- [x] T0.26 迁移 `game-logic.spec.ts`（30 个测试通过）
- [x] T0.27 迁移 `wave-manager.spec.ts`（8 个测试通过）

### P0 — 文档更新

- [x] T0.28 更新 `CLAUDE.md`（Cocos Creator 版本）
- [x] T0.29 更新 `docs/development-guidelines.md`（Cocos Creator 规范）
- [x] T0.30 更新 `docs/development-roadmap.md`（本文档）
- [x] T0.31 更新 `package.json`（Cocos Creator 脚本）

**Phase 0 门禁**：
- 30 个 Vitest 测试全部通过
- 所有游戏逻辑可运行（GameScene, WaveManager, Grid, Path, Economy）
- 文档完整更新（CLAUDE.md, guidelines, roadmap）
- 项目结构清晰，Cocos Creator 可识别

---

## Phase 1：微信构建与部署（进行中）

**目标**：游戏可在微信开发者工具中运行。

### P0 — 微信构建配置

- [ ] T1.1 在 Cocos Creator 中配置微信小游戏构建参数
- [ ] T1.2 配置分包策略（首包 < 4MB）
- [ ] T1.3 编写 `scripts/build-cocos.mjs`（自动化构建）
- [ ] T1.4 测试构建输出正确性

### P1 — 部署管线

- [ ] T1.5 更新 `scripts/deploy-wechat.mjs`（Cocos Creator 构建 → DevTools）
- [ ] T1.6 编写 `scripts/deploy-and-test.cjs`（完整部署 + 测试）
- [ ] T1.7 测试 DevTools 自动化连接（WebSocket）
- [ ] T1.8 测试编译 + 预览流程

**Phase 1 门禁**：
- `pnpm deploy` 一键完成构建 → 转换 → DevTools 打开 → 编译 → 预览
- 微信开发者工具中可见游戏画面
- 触摸交互正常
- 音频播放正常

---

## Phase 2：AI 美术 + 性能优化（待开始）

**目标**：包体达标 + 美术管线自动化 + 性能优化。

### P0 — AI 美术管线

- [ ] T2.1 编写 ComfyUI 工作流（箭塔 3 级、炮塔 3 级、减速塔 3 级）
- [ ] T2.2 编写 ComfyUI 工作流（Basic/Fast/Tank 敌人）
- [ ] T2.3 AI 生成全部精灵图 → 用户审查 → 确认入库
- [ ] T2.4 编写 TexturePacker 配置 → 生成纹理图集
- [ ] T2.5 将图集导入 Cocos Creator 项目
- [ ] T2.6 将 Sprite 组件从纯色改为纹理图集

### P0 — 性能优化

- [ ] T2.7 对象池全覆盖（投射物、敌人、浮动文字）
- [ ] T2.8 优化 Graphics 绘制（减少每帧 clear + redraw）
- [ ] T2.9 优化敌人查找（空间哈希替代 O(n²)）
- [ ] T2.10 分包加载大资源

### P1 — 体验优化

- [ ] T2.11 塔放置动画（缩放弹跳）
- [ ] T2.12 击杀动画（缩小 + 淡出）
- [ ] T2.13 炮塔旋转（2.5D 效果）
- [ ] T2.14 波次提示动画
- [ ] T2.15 游戏结束/胜利画面

### P2 — 后续功能

- [ ] T2.16 存档系统（云端 + 本地 fallback）
- [ ] T2.17 排行榜（微信开放数据域）
- [ ] T2.18 广告系统（Banner / 激励视频）
- [ ] T2.19 多关卡系统
- [ ] T2.20 难度预设（简单/普通/困难）

**Phase 2 门禁**：
- 微信开发者工具中完整可玩
- 所有视觉元素就位
- 帧率 ≥ 30fps（中低端机）
- 首包 < 4MB

---

## 里程碑

| 里程碑 | 时间 | 交付物 | 验证方式 |
|--------|------|--------|---------|
| M0: 核心就绪 | 已完成 | 完整游戏逻辑 + 30 测试通过 | Vitest 全绿 |
| M1: 微信构建 | 进行中 | 可部署到微信 DevTools | `pnpm deploy` 成功 |
| M2: AI 美术 | 待开始 | 纹理图集 + 精灵图 | 编辑器预览 |
| M3: 生产就绪 | 待开始 | 首包 < 4MB + 30fps | 真机验证 |

---

## 用户职责

| 阶段 | 用户任务 | 时间 |
|------|---------|------|
| Phase 1 | 确认微信开发者工具配置 + 快适配授权 | 进行中 |
| Phase 2 | AI 美术资源审查 + 风格确认 | 待开始 |
| 全程 | 创意方向确认 + 功能优先级调整 | 持续 |
