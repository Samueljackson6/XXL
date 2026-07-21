# XXL 塔防 — 游戏设计方案 v1.2（最终版）

> 本版本为设计方案的最终定稿，整合 v1.0 全部内容 + v1.1 所有修订 + 第二轮评审修复。
> 可直接用于实施。

---

## 1. 游戏概述

### 1.1 定位
微信小游戏竖屏塔防。单局 3-5 分钟，30 波敌人，3 种防御塔。核心体验：**策略布阵 → 自动战斗 → 资源管理 → 波次推进**。

### 1.2 目标平台
- 微信小游戏（主平台）
- 浏览器（开发/调试用）
- 竖屏优先，逻辑坐标 400×700

### 1.3 技术栈
- Phaser 3.80.1（WebGL 渲染）
- TypeScript 严格模式
- Vite 开发 + 构建
- 微信适配：`@phaserjs/adapter-miniprogram`（仅微信构建时启用）

---

## 2. 核心玩法循环

```
选择塔 → 点击格子放置 → 准备倒计时 → 塔自动索敌射击 → 击杀获得金币 → 升级/建造 → 波次间隙 → 下一波
```

### 2.1 游戏状态机
```
IDLE → PREPARE(15s倒计时) → FIGHTING → INTERMISSION(5s) → PREPARE → ... → VICTORY/GameOver
```

- **PREPARE**：15 秒倒计时布阵，可提前点击"跳过"开始
- **FIGHTING**：敌人沿路径行进，塔自动攻击
- **INTERMISSION**：5 秒间隙，显示"下一波"按钮
- **VICTORY**：通过 30 波
- **GAME_OVER**：生命值归零

---

## 3. 地图与路径

### 3.1 网格
- 逻辑尺寸 400×700，格子 64×64，6列×10行 = 60 格子
- 约 36 个可放置格子

### 3.2 路径
```typescript
PATH_POINTS: [
  { x: 0, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 4 },
  { x: 5, y: 4 }, { x: 5, y: 2 }, { x: 5, y: 6 },
  { x: 4, y: 6 }, { x: 4, y: 8 }, { x: 6, y: 8 },
]
```
- 路径点及相邻格子标记为不可放置
- 总路径长度约 1152 像素
- 敌人从左侧 (-20, startY) 进入，右侧离开

### 3.3 HUD 高度偏移
```typescript
const HUD_HEIGHT = 44;  // HUD 占顶部 44px
// 地图格子从 row=0 开始绘制，HUD 覆盖在顶部
// HUD 使用不透明背景（opacity: 1），不透明背景可接受遮挡顶部格子
// 或者：地图从 row=ceil(HUD_HEIGHT/TILE_SIZE) 开始绘制
```

---

## 4. 防御塔系统

### 4.1 塔类型

| 属性 | 箭塔 (Arrow) | 炮塔 (Cannon) | 减速塔 (Frost) |
|------|-------------|---------------|----------------|
| 成本 | 50 | 100 | 80 |
| 伤害 | 12 | 35 | 8 |
| 射程 | 140 | 160 | 130 |
| 攻速 | 500ms | 1200ms | 700ms |
| DPS | 24 | 29.2 | 11.4 |
| 投射物速度 | 350 | 250 | 200 |
| AOE 半径 | 0（单体） | 40 | 0（单体） |
| 减速效果 | 无 | 无 | 50% 减速，2 秒 |
| 战术定位 | 前期主力，清小怪 | 中后期，打坦克 | 辅助，提升输出 |

### 4.2 升级系统
- 最多 3 级
- 升级成本：塔基础成本 × 当前等级
- 升级效果：伤害 +50%，射程 +15
- 出售价值：基础成本 × 0.5 × 当前等级

### 4.3 索敌逻辑
- 每 100ms 检测一次
- 优先目标：距离路径终点最近的敌人

### 4.4 放置规则
- 非路径、非已占用格子
- 点击格子 → 绿色/红色预览 + 射程圈
- 放置动画：scale 0→1.2→1.0（0.3s ease-out）

---

## 5. 敌人系统

### 5.1 敌人类型

| 属性 | Basic | Fast | Tank |
|------|-------|------|------|
| HP | 40 | 25 | 120 |
| 速度 | 90 | 160 | 55 |
| 奖励 | 10 | 15 | 30 |
| 碰撞半径 | 12 | 10 | 16 |
| 出现 | Wave 1+ | Wave 5+ | Wave 10+ |

### 5.2 波次分布

| 波次区间 | 敌人组合 | 数量公式 | HP 缩放 |
|---------|---------|---------|---------|
| 1-4 | 100% Basic | 5+wave×2 | ×1.0 |
| 5-9 | 70% Basic + 30% Fast | 5+wave×2 | ×1.0+(wave-1)×0.08 |
| 10-19 | 50% Basic + 30% Fast + 20% Tank | 8+wave×2 | ×1.0+(wave-1)×0.12 |
| 20-30 | 40% Basic + 25% Fast + 35% Tank | 10+wave×2 | ×1.0+(wave-1)×0.18 |

### 5.3 HP 缩放公式
```typescript
const hpScale = 1 + Math.pow(this.currentWave - 1, 1.5) * 0.04;
// Wave 1: ×1.0, Wave 10: ×2.08, Wave 20: ×4.31, Wave 30: ×7.25
// Basic 40HP → Wave 30: 290HP（24 发箭塔 ≈ 12 秒击杀）
// Tank 120HP → Wave 30: 870HP（炮塔 3 发 ≈ 3.6 秒）
```

### 5.4 生成节奏
- 间隔：800ms（Wave 20+ 后 600ms）
- 从路径起点 (-20, startY) 生成

---

## 6. 投射物系统

### 6.1 追踪逻辑
```typescript
class Projectile {
  private targetEnemy: Enemy | null;
  
  update(dt: number): boolean {
    // 追踪活着的敌人当前位置
    if (this.targetEnemy && this.targetEnemy.alive) {
      this.targetX = this.targetEnemy.x;
      this.targetY = this.targetEnemy.y;
    }
    // 飞向 targetX/targetY
    // 超过路径总长度自动销毁
  }
}
```

### 6.2 AOE 处理
```typescript
if (projType === 'cannon') {
  // 遍历所有存活敌人，距离 < aoeRadius 的全部受伤
  for (const enemy of this.enemies) {
    if (!enemy.alive) continue;
    const dist = distance(enemy, proj);
    if (dist < TOWER_TYPES.cannon.aoeRadius) {
      enemy.takeDamage(proj.damage);
    }
  }
}
```

---

## 7. 经济系统

### 7.1 金币来源

| 来源 | 公式 | Wave 30 估算 |
|------|------|-------------|
| 初始 | 200 | 200 |
| 击杀 | baseReward × (1 + wave × 0.05) | Basic=26, Fast=39, Tank=78 |
| 波次奖励 | 30 + wave × 5 | 180 |
| 出售 | 基础成本 × 0.5 × 等级 | 箭塔 L1=25, L3=75 |

### 7.2 金币消耗

| 用途 | 成本 |
|------|------|
| 箭塔 L1 | 50 |
| 炮塔 L1 | 100 |
| 减速塔 L1 | 80 |
| 箭塔 L2 | 100 |
| 箭塔 L3 | 150 |
| 炮塔 L2 | 200 |
| 炮塔 L3 | 300 |
| 减速塔 L2 | 160 |
| 减速塔 L3 | 240 |

### 7.3 经济自洽性
Wave 1-5 累计金币约 1000，可支撑 3 箭塔 + 1 炮塔 + 1 减速塔 + 部分升级。后期金币增长放缓，升级决策至关重要。

---

## 8. 波次系统

### 8.1 流程
```
INTERMISSION(5s) → PREPARE(15s，可提前跳过) → FIGHTING → INTERMISSION → ...
```

### 8.2 波次间期
- 5 秒固定间隙
- PREPARE 15 秒倒计时，显示"跳过 Xs"
- 波次开始/完成有视觉提示

---

## 9. UI 设计

### 9.1 布局

```
┌─────────────────────────────────┐
│ HP 20   GOLD 200   WAVE 1/30    │  HUD (y: 0-44, 不透明半透明背景)
├─────────────────────────────────┤
│  ⬜ ⬜ ⬜ ⬜ ⬜ ⬜                 │
│  ⬜ 🟫 ⬜ ⬜ 🟫 ⬜                 │  │ 游戏地图 (y: 44-640)
│  ⬜ 🟫 ⬜ ⬜ 🟫 ⬜                 │  │ 注意：HUD 背景覆盖地图顶部
│  ⬜ ⬜ ⬜ ⬜ 🟫 ⬜                 │
│  ⬜ ⬜ ⬜ ⬜ 🟫 ⬜                 │
├─────────────────────────────────┤
│  [箭塔] [炮塔] [减速塔]  [开始]   │  塔选择栏 (y: 640-700)
└─────────────────────────────────┘
```

### 9.2 HUD（顶部状态栏，y: 0-44）
- 不透明/半透明黑色背景（opacity: 0.8）
- HP 文本：(10, 14)，红色 #ff4444，`HP 20`
- GOLD 文本：(200, 14)，金色 #ffd700，居中，`GOLD 200`
- WAVE 文本：(390, 14)，白色 #ffffff，右对齐，`WAVE 1/30`
- 金币变化时播放 +/- 浮动文字动画
- 全部 Phaser Text，字体 `sans-serif`（wx 兼容）

### 9.3 塔选择栏（底部，纯 Phaser UI）
```
TowerSelectBar (Container, y=640, 全宽60px)
├── bg (Graphics, 全宽半透明背景条)
├── towerButton[0] (Container)
│   ├── bgRect (Rectangle, 80×54, 可交互)
│   ├── iconSprite (Sprite, 32×32)
│   ├── nameText (Text, "箭塔")
│   └── costText (Text, "50")
├── towerButton[1] (Container) — 炮塔
├── towerButton[2] (Container) — 减速塔
├── startButton (Container)
│   ├── bgRect (Rectangle, 80×48, 可交互)
│   └── text (Text, "开始")
└── timerText (Text, "准备时间: 15s")
```

**交互**：
- 点击塔按钮 → toggle 选中状态（边框变亮 + 脉冲动画）
- 金币不足 → 边框变灰 + alpha 降低
- `pointerdown` 时 `e.stopPropagation()` 防止穿透到地图
- 选中塔后点击地图 → 放置塔（GameScene 检测 `selectedType`）

**状态**：
- `selectedType: TowerType | null`
- `canAfford: Record<TowerType, boolean>` — 每帧更新

### 9.4 塔信息面板
```
TowerInfoPanel (Container, 塔上方偏移)
├── bg (Graphics, 圆角矩形 160×80)
├── nameText (Text, "箭塔 ★☆☆")
├── statsText (Text, "伤害:12 射程:140 攻速:0.5s")
├── upgradeButton (Container)
│   ├── bgRect (Rectangle, 70×28)
│   └── text (Text, "升级 100💰")
├── sellButton (Container)
│   ├── bgRect (Rectangle, 70×28)
│   └── text (Text, "出售 +25💰")
```

**交互**：
- 点击已放置塔 → 显示面板
- 点击升级按钮 → `tower.upgrade()` + `economy.spend(cost)`
- 点击出售按钮 → `economy.earn(sellValue)` + `this.towers.splice()` + 面板关闭
- 金币不足 → 升级按钮变灰
- 满级 → 隐藏升级按钮
- 点击空白区域 → 关闭面板

**事件优先级**：
- 面板打开时，GameScene 的 `pointerdown` 检测 `panelOpen` 标志，true 时跳过地图放置
- 面板按钮事件先拦截，不传播到地图

### 9.5 波次提示
- 波次开始前：屏幕中央 "Wave X" 大字（2 秒淡入淡出）
- 间隙期：塔选择栏上方显示倒计时
- 波次完成："+金币" 浮动文字

### 9.6 浮动文字系统
```typescript
showFloatingText(message: string, x: number, y: number): void {
  const text = this.add.text(x, y, message, {
    fontSize: '16px',
    color: '#ffd700',
    fontFamily: 'Arial, sans-serif',
    stroke: '#000000',
    strokeThickness: 2,
  }).setOrigin(0.5).setDepth(100);

  this.tweens.add({
    targets: text,
    y: y - 40,
    alpha: 0,
    duration: 800,
    ease: 'Cubic.easeOut',
    onComplete: () => text.destroy(),
  });
}
```

---

## 10. 视觉设计

### 10.1 颜色
- 背景：深蓝黑 #1a1a2e
- 草地：#2e7d32 / #1b5e20（棋盘格）
- 路径：泥土棕 #4e342e / #795548
- HUD 背景：rgba(0,0,0,0.8)

### 10.2 塔视觉
- 箭塔：蓝色圆形底座 + 白色三角箭头
- 炮塔：橙色方形 + 深色炮管
- 减速塔：浅蓝六边形 + 雪花图案

### 10.3 敌人视觉
- Basic：红色圆形 + 深色眼斑
- Fast：橙色三角形
- Tank：紫色圆角方块

### 10.4 特效
- 塔放置：缩放弹跳 0.3s
- 击杀：缩小 + 旋转 + 淡出 0.5s
- 减速：蓝色 tint + 冰晶粒子
- 爆炸：8 个橙色粒子扩散 0.3s
- 选中塔：范围圈脉冲（alpha 0.3↔0.1）

---

## 11. 音频设计

全部 Web Audio API 合成（无外部文件）：

| 事件 | 音效 | 参数 |
|------|------|------|
| 塔射击 | "嗖" | 800→400Hz, 50ms |
| 箭命中 | "啪" | 白噪声, 20ms |
| 炮爆炸 | "轰" | 100Hz 低频, 200ms |
| 减速 | 冰晶声 | 600→200Hz, 300ms |
| 击杀 | "叮" | 1200Hz, 80ms |
| 金币获得 | "哗啦" | 多短促高频, 100ms |
| 放置塔 | "咚" | 200Hz, 100ms |
| 波次开始 | "嗡" | 200→800Hz, 500ms |
| 波次完成 | 和弦 | 400+600+800Hz |
| Game Over | 下降音 | 400→100Hz, 500ms |
| 按钮点击 | "咔" | 1000Hz, 30ms |

微信适配：首次触摸后初始化 AudioContext。

---

## 12. 技术架构

### 12.1 场景管理
```
BootScene → MenuScene → GameScene → GameOverScene
```

### 12.2 渲染层次
1. 背景 Graphics
2. 格子 Graphics
3. 路径 Graphics
4. 塔 Container
5. 敌人 Container
6. 投射物 Container
7. 特效（粒子、浮动文字）
8. 预览 Graphics
9. HUD Container
10. 塔选择栏 Container

### 12.3 系统职责

| 系统 | 职责 | 数据 |
|------|------|------|
| Grid | 地图、可放置检测 | occupied[][], pathCells |
| Path | 路径点、距离→位置 | points[], totalLength |
| WaveManager | 波次生成、难度、计时 | currentWave, enemiesRemaining, spawnTimer, state |
| Economy | 金币/生命值 | gold, lives |
| Tower | 个体状态、射击 | type, level, damage, range, lastFired |
| Enemy | 个体状态、移动、减速 | type, hp, speed, distanceTraveled, alive |
| Projectile | 飞行、命中 | projX/Y, targetEnemy, damage, speed |
| HUD | UI 展示 | 无持久数据 |
| TowerSelectBar | 塔选择 UI | selectedType, canAfford |
| TowerInfoPanel | 塔详情 UI | selectedTower |

### 12.4 数据流
```
WaveManager.spawnEnemy() → Enemy → registerEnemy() → GameScene.enemies[]
GameScene.update():
  enemies[] → move() + 终点检测 → onEnemyReachEnd()
  towers[] → 索敌 + fire() → Projectile(targetEnemy)
  projectiles[] → update() + 命中 → takeDamage() → earn() + 浮动文字
```

### 12.5 WaveManager 状态机
```typescript
enum WaveState {
  IDLE,           // 初始
  PREPARE,        // 15秒倒计时
  FIGHTING,       // 敌人生成中
  INTERMISSION,   // 5秒间隙
}
```

---

## 13. 微信小游戏适配

### 13.1 零 DOM 原则
- 所有 UI 用 Phaser Game Objects
- TowerSelectBar、HUD、TowerInfoPanel、浮动文字全部纯 Phaser

### 13.2 构建
```
开发：vite dev → 浏览器
微信：vite build --mode miniprogram → dist/game.js → 微信开发者工具
```

### 13.3 包体目标
- < 2MB（Phaser 650KB + 代码 30KB + 程序化纹理 0KB）

### 13.4 字体
- 全部使用 `fontFamily: 'Arial, sans-serif'`
- 不使用系统专用字体

---

## 14. 配置管理系统

```typescript
// config.ts 结构
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;
export const HUD_HEIGHT = 44;
export const TILE_SIZE = 64;
export const GRID_COLS = Math.floor(GAME_WIDTH / TILE_SIZE);  // 6
export const GRID_ROWS = Math.floor((GAME_HEIGHT - HUD_HEIGHT) / TILE_SIZE);  // 10

export const PATH_POINTS: { x: number; y: number }[] = [...];

export const TOWER_TYPES = {
  arrow: {
    name: '箭塔', cost: 50, range: 140, damage: 12,
    fireRate: 500, color: 0x4fc3f7,
    projectileSpeed: 350, aoeRadius: 0, slowEffect: null,
    description: '快速射击，伤害一般',
  },
  cannon: {
    name: '炮塔', cost: 100, range: 160, damage: 35,
    fireRate: 1200, color: 0xff7043,
    projectileSpeed: 250, aoeRadius: 40, slowEffect: null,
    description: '高伤害AOE，攻速慢',
  },
  frost: {
    name: '减速塔', cost: 80, range: 130, damage: 8,
    fireRate: 700, color: 0x81d4fa,
    projectileSpeed: 200, aoeRadius: 0, slowEffect: { duration: 2000, factor: 0.5 },
    description: '减速敌人，持续伤害',
  },
} as const;

export const ENEMY_TYPES = {
  basic: { hp: 40, speed: 90, reward: 10, color: 0xe74c3c, hitRadius: 12 },
  fast: { hp: 25, speed: 160, reward: 15, color: 0xf39c12, hitRadius: 10 },
  tank: { hp: 120, speed: 55, reward: 30, color: 0x8e44ad, hitRadius: 16 },
} as const;

export const ECONOMY_CONFIG = {
  startingGold: 200,
  startingLives: 20,
  killRewardMultiplier: 0.05,  // × (1 + wave × 0.05)
  waveBonusBase: 30,
  waveBonusPerWave: 5,
  sellRatio: 0.5,
};

export const WAVE_CONFIG = {
  totalWaves: 30,
  prepareTime: 15,    // 秒
  intermissionTime: 5, // 秒
  baseCount: 5,
  countPerWave: 2,
  spawnInterval: 800, // ms, Wave 20+ 后 600ms
};
```

---

## 15. 代码规范

### TypeScript
- 严格模式
- 无 `any` 类型（WaveManager 的 gameScene 用接口）
- `readonly` 标记不变属性

### Phaser 最佳实践
- Container 子类用 `this.scene.add.sprite()` 而非 `this.add.sprite()`
- 交互绑定到 Rectangle 而非 Container
- 每帧 clear() + 重绘 Graphics
- 用 setDepth() 控制渲染层次

### 命名
- 类：PascalCase
- 方法：camelCase
- 常量：UPPER_SNAKE_CASE
- 私有方法：`private` 修饰符

---

## 16. 扩展性

### 新塔类型
在 TOWER_TYPES 中加配置即可：
```typescript
sniper: {
  name: '狙击塔', cost: 150, range: 250, damage: 80,
  fireRate: 2000, color: 0xffeb3b,
  projectileSpeed: 500, aoeRadius: 0, slowEffect: null,
  description: '超远射程，单体秒杀',
}
```

### 新敌人类型
在 ENEMY_TYPES 中加配置。

### 新地图
修改 PATH_POINTS。

### 难度预设
```typescript
const DIFFICULTY = {
  easy:   { hpScale: 0.7, startingGold: 300, lives: 30 },
  normal: { hpScale: 1.0, startingGold: 200, lives: 20 },
  hard:   { hpScale: 1.3, startingGold: 100, lives: 14 },
};
```

---

## 17. 后续迭代（P1+）

| 项目 | 说明 |
|------|------|
| 解耦 GameScene | 拆分为 CombatSystem、ProjectileSystem |
| 对象池 | Projectile、粒子、浮动文字 |
| 音频系统 | AudioManager 单例，Web Audio API 合成 |
| 存储系统 | wx.setStorageSync 保存最高波次 |
| 暂停功能 | ESC/点击暂停按钮 |
| 胜利画面 | 差异化 VICTORY 展示 |
| 特效系统 | 击杀粒子、爆炸粒子、减速冰晶 |
| 波次过渡动画 | 淡入淡出 + 统计面板 |
| 渲染深度 | 显式 setDepth() |
