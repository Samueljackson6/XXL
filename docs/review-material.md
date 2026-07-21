# XXL 塔防 — 评审材料总览

> 本文件供第三方评审使用，包含：原始设计方案、最终设计方案、当前代码现状三部分。
> 评审后请将结论反馈，据此决定实施方向。

---

## 一、原始设计方案（v1.0 — 草稿版）

### 1.1 概述
微信小游戏竖屏塔防，Phaser 4.2.1 + TypeScript + Vite，3 种防御塔，30 波敌人。

### 1.2 原始技术选型
- Phaser 4.2.1（后续降级为 3.80.1，因 ESM import 不兼容 Vite）
- `import Phaser from 'phaser'`（default import，实际应使用 `import * as Phaser`）

### 1.3 原始 UI 方案
- **TowerSelectBar**：HTML DOM overlay（`document.createElement('div')` + CSS `position:fixed`）
- **HUD**：Phaser Text + emoji（`❤️`、`💰`）

### 1.4 原始数值设计

**塔配置（代码实际值）**：

| 属性 | 箭塔 | 炮塔 | 减速塔 |
|------|------|------|--------|
| 成本 | 50 | 100 | 80 |
| 伤害 | 10 | 30 | 5 |
| 射程 | 120 | 150 | 130 |
| 攻速 | 600ms | 1200ms | 800ms |
| 投射物速度 | 400（硬编码） | 400（硬编码） | 400（硬编码） |

**敌人配置（代码实际值）**：

| 属性 | Basic | Fast | Tank |
|------|-------|------|------|
| HP | 30 | 20 | 100 |
| 速度 | 80 | 140 | 50 |
| 奖励 | 10 | 15 | 30 |

**经济配置**：
- 起始金币：150
- 无波次奖励
- 击杀奖励：基础值（无波次缩放）

**难度曲线（代码实际值）**：
```typescript
// 数量缩放
const waveMultiplier = 1 + (this.currentWave - 1) * 0.25;  // Wave 30: ×7.25
const baseCount = 5 + this.currentWave * 2;
this.waveEnemiesToSpawn = Math.floor(baseCount * waveMultiplier);

// HP 缩放
getScaledHp(): Math.floor(ENEMY_TYPES[type].hp * (1 + (this.currentWave - 1) * 0.3));
```

### 1.5 原始已知问题
- 白屏（Phaser 4 ESM import 失败）
- Canvas 隐藏（CSS 高度为 0）
- HMR 重复初始化
- TowerSelectBar 按钮无响应（Container 内 Graphics 不接收 pointer 事件）
- 塔放置后不显示（baseSprite 未 add 到 Container）
- HUD emoji 可能不渲染
- 投射物不追踪敌人（锁定发射瞬间位置）
- 炮塔无 AOE
- 无 PREPARE 状态机
- 波次系统 activeEnemies 与 GameScene.enemies 不同步
- 数值平衡未验证

---

## 二、最终设计方案（v1.2 — 经 2 轮评审修订）

### 2.1 技术选型
- Phaser **3.80.1**（已验证与 Vite + TypeScript 兼容）
- `import * as Phaser from 'phaser'`（namespace import）
- 微信适配：`@phaserjs/adapter-miniprogram`（仅微信构建时启用）

### 2.2 UI 方案（全部纯 Phaser，零 DOM）

**TowerSelectBar**：Phaser Container + Rectangle + Text
- 3 个塔按钮 + 1 个"开始"按钮
- 交互绑定到 Rectangle（非 Container）
- 状态：选中态（边框变亮 + 脉冲）、金币不足（变灰）、按下态（缩放 0.95）
- `e.stopPropagation()` 防止事件穿透

**HUD**：Phaser Text，无 emoji
- `HP 20`（红色）、`GOLD 200`（金色）、`WAVE 1/30`（白色）
- 字体 `sans-serif`（wx 兼容）

**TowerInfoPanel**：Phaser Container + Graphics + Text
- 点击已放置塔弹出
- 升级按钮 + 出售按钮
- 金币不足变灰，满级隐藏升级

**浮动文字**：Phaser Text + tween
- `+X` 从击杀位置向上飘 0.8 秒淡出

### 2.3 数值设计（v1.2 最终值）

**塔配置**：

| 属性 | 箭塔 | 炮塔 | 减速塔 |
|------|------|------|--------|
| 成本 | 50 | 100 | 80 |
| 伤害 | 12 | 35 | 8 |
| 射程 | 140 | 160 | 130 |
| 攻速 | 500ms | 1200ms | 700ms |
| DPS | 24 | 29.2 | 11.4 |
| 投射物速度 | 350 | 250 | 200 |
| AOE 半径 | 0 | 40 | 0 |
| 减速 | 无 | 无 | 50%/2秒 |

**升级系统**：
- 3 级，成本 = 基础成本 × 当前等级
- 升级效果：伤害 +50%，射程 +15
- 出售 = 基础成本 × 0.5 × 等级

**敌人配置**：

| 属性 | Basic | Fast | Tank |
|------|-------|------|------|
| HP | 40 | 25 | 120 |
| 速度 | 90 | 160 | 55 |
| 奖励 | 10 | 15 | 30 |
| 碰撞半径 | 12 | 10 | 16 |
| 出现 | Wave 1+ | Wave 5+ | Wave 10+ |

**经济配置**：
- 起始金币：**200**
- 击杀奖励：base × (1 + wave × 0.05)
- 波次奖励：30 + wave × 5
- 出售：基础成本 × 0.5 × 等级

**难度曲线（v1.2 修正后）**：
```typescript
// 数量：线性增长，无额外乘算
const enemyCount = 5 + this.currentWave * 2;  // Wave 30: 65

// HP：温和指数增长
const hpScale = 1 + Math.pow(this.currentWave - 1, 1.5) * 0.04;
// Wave 1: ×1.0, Wave 10: ×2.08, Wave 20: ×4.31, Wave 30: ×7.25
// Basic 40HP → Wave 30: 290HP（24 发箭塔 ≈ 12 秒击杀）
// Tank 120HP → Wave 30: 870HP（炮塔 3 发 ≈ 3.6 秒）
```

**Wave 30 总 HP 估算**（混合阵容）：约 22400
3 箭塔 + 2 炮塔 + 1 减速塔 → 总 DPS ≈ 148 → 清怪约 90-120 秒

### 2.4 核心机制

**投射物追踪**：
- Projectile 持有 Enemy 引用
- 每帧读取敌人当前位置
- 目标死亡后飞向最后已知位置

**炮塔 AOE**：
- cannon 命中时遍历所有存活敌人
- 距离 < 40 的全部受伤

**状态机**：
```
IDLE → PREPARE(15s，可提前跳过) → FIGHTING → INTERMISSION(5s) → PREPARE → ... → VICTORY/GameOver
```

### 2.5 路径
```typescript
PATH_POINTS: [
  { x: 0, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 4 },
  { x: 5, y: 4 }, { x: 5, y: 2 }, { x: 5, y: 6 },
  { x: 4, y: 6 }, { x: 4, y: 8 }, { x: 6, y: 8 },
]
```
全部在 0-6 范围内（GRID_COLS=6），无越界。

### 2.6 音频
全部 Web Audio API 合成（11 种音效），无外部文件。
微信：首次触摸后初始化 AudioContext。

### 2.7 包体目标
< 2MB（Phaser 650KB + 代码 30KB + 程序化纹理 0KB）

---

## 三、当前代码现状

### 3.1 已完成修复
| 问题 | 状态 | 说明 |
|------|------|------|
| Phaser 降级 | ✅ 完成 | 3.80.1，`import * as Phaser` |
| Canvas 隐藏 | ✅ 完成 | index.html 添加全局 CSS |
| HMR 重复初始化 | ✅ 完成 | `window.__phaserGame` 守卫 |
| 塔不显示 | ✅ 完成 | `this.add(baseSprite)` |
| TowerSelectBar 无响应 | ⚠️ 部分完成 | 已改为 HTML DOM overlay（非最终方案） |
| HUD 文本 | ⚠️ 部分完成 | 已创建 goldText/livesText/waveText，但用 emoji |

### 3.2 当前 TowerSelectBar 实现
- 使用 `document.createElement('div')` 创建 HTML 按钮
- CSS `position:fixed` 定位
- **问题**：微信小游戏无 DOM，必须重写为纯 Phaser UI

### 3.3 当前 HUD 实现
```typescript
this.goldText.setText(`💰 ${gold}`);
this.livesText.setText(`❤️ ${lives}`);
this.waveText.setText(`Wave ${wave}/${totalWaves}`);
```
- **问题**：emoji 在 WebGL 下可能不渲染

### 3.4 当前数值（代码中的值，需更新）
- 起始金币：150（应为 200）
- 箭塔伤害：10（应为 12）
- 箭塔射程：120（应为 140）
- Basic HP：30（应为 40）
- Fast HP：20（应为 25）
- Tank HP：100（应为 120）

### 3.5 当前缺失功能
| 功能 | 状态 | 说明 |
|------|------|------|
| 投射物追踪 | ❌ 缺失 | 锁定发射瞬间位置 |
| 炮塔 AOE | ❌ 缺失 | 只打单个敌人 |
| PREPARE 状态机 | ❌ 缺失 | 只有 waveActive/betweenWaves 布尔 |
| 经济奖励 | ❌ 缺失 | 无波次奖励，击杀奖励无缩放 |
| 塔信息面板 | ❌ 缺失 | 有 upgrade() 方法但无 UI |
| 浮动文字 | ❌ 缺失 | 击杀无 "+X" 提示 |
| 音频系统 | ❌ 缺失 | 完全未实现 |
| 对象池 | ❌ 缺失 | 频繁 new/destroy |
| 存档 | ❌ 缺失 | 无 wx.setStorageSync |

### 3.6 当前代码文件清单
```
src/
  main.ts          — 入口，Phaser 初始化
  scenes/
    BootScene.ts   — 程序化纹理生成 ✅
    MenuScene.ts   — 主菜单 ✅
    GameScene.ts   — 核心游戏逻辑（需要大幅重构）
    GameOverScene.ts — 结束画面 ✅
  entities/
    Tower.ts       — 塔实体（基础功能 OK，缺 UI 交互）
    Enemy.ts       — 敌人实体（基础功能 OK）
    Projectile.ts  — 投射物（缺追踪逻辑）
    Path.ts        — 路径点管理 ✅
  systems/
    Grid.ts        — 格子地图 ✅
    WaveManager.ts — 波次管理（难度曲线需重做）
    Economy.ts     — 经济系统（缺奖励逻辑）
  ui/
    HUD.ts         — HUD（emoji 问题，需重写）
    TowerSelectBar.ts — 塔选择栏（DOM 方案，需重写）
  utils/
    config.ts      — 数值配置（需更新 14 项）
```

---

## 四、评审要点提示

请第三方评审重点关注以下方面：

### 4.1 技术可行性
- Phaser 3.80.1 + TypeScript + Vite 技术栈是否合理？
- 纯 Phaser UI 方案在微信小游戏中的实际兼容性？
- 程序化纹理生成策略是否可持续？

### 4.2 数值平衡
- 难度曲线（HP ×1.0+(wave-1)^1.5×0.04）是否合理？
- 经济系统（起始 200、击杀缩放、波次奖励）是否自洽？
- 塔的 DPS 与敌人 HP 的比例是否合理？

### 4.3 架构合理性
- 系统职责划分是否清晰？
- 数据流设计是否合理？
- 是否有遗漏的系统或功能？

### 4.4 微信小游戏适配
- 零 DOM 原则是否充分？
- 包体 < 2MB 目标是否可行？
- 触摸交互优化是否到位？

### 4.5 实施建议
- 原始代码应该在什么程度上保留/重构？
- 实施优先级是否合理？
- 是否有隐藏的技术风险？

---

## 五、相关文档

- [设计方案 v1.2（最终版）](docs/game-design-doc-v1.2.md) — 完整的游戏设计规范
- [优化方案 v1.0](docs/optimization-plan-v1.md) — 第一轮优化建议
- [设计修订 v1.1](docs/game-design-doc-v1.1.md) — 第二轮修订记录
