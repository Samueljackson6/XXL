# XXL 塔防 — 游戏设计方案 v2.0（Cocos Creator 3.8.8 版）

> 本版本基于 v1.2 最终设计，全面适配 Cocos Creator 3.8.8 架构。
> 数据驱动、GameConfig.ts 配置、Cocos Creator Component 系统、微信小游戏原生支持。

---

## 1. 游戏概述

### 1.1 定位

微信小游戏竖屏塔防。标准模式 30 波（约 15-20 分钟），快速模式 10 波（约 3-5 分钟），3 种防御塔。核心体验：**策略布阵 → 自动战斗 → 资源管理 → 波次推进**。

### 1.2 目标平台

- 微信小游戏（主平台，Cocos Creator 引擎运行时内置）
- 编辑器（Cocos Creator Editor Play Mode，开发/调试用）
- 竖屏优先，逻辑坐标 400×700

### 1.3 技术栈

- **引擎**：Cocos Creator 3.8.8（TypeScript + Component 系统）
- **渲染**：WebGL 1.0（Cocos Creator 默认）
- **配置**：TypeScript GameConfig.ts（数据驱动）
- **音频**：Web Audio API（Cocos Creator 内置）
- **构建**：Cocos Creator CLI → 微信小游戏
- **部署**：微信开发者工具 CLI（DevTools Protocol）
- **测试**：Vitest（纯逻辑模块）+ 编辑器内 Component 测试

---

## 2. 核心玩法循环

```
选择塔 → 点击格子放置 → 准备倒计时 → 塔自动索敌射击 → 击杀获得金币 → 升级/建造 → 波次间隙 → 下一波
```

### 2.1 游戏状态机

```typescript
enum GameState {
    Idle,           // 初始/胜利后
    Prepare,        // 15s 倒计时，可提前跳过
    Fighting,       // 敌人生成中
    Intermission,   // 5s 间隙
    Victory,        // 30 波通关
    GameOver        // 生命值归零
}
```

- **Prepare**：15 秒倒计时布阵，可提前点击"跳过"
- **Fighting**：敌人沿路径行进，塔自动攻击
- **Intermission**：5 秒间隙，显示"下一波"按钮
- **Victory**：通过 30 波
- **GameOver**：生命值归零

### 2.2 操作方式

| 操作 | 方式 | 响应区域 |
|------|------|---------|
| 选择塔 | 点击底部塔按钮 | ≥ 44×44px |
| 放置塔 | 点击地图格子 | 格子中心 |
| 查看塔信息 | 点击已放置塔 | 塔 Node |
| 升级塔 | 点击面板升级按钮 | 按钮区域 |
| 出售塔 | 点击面板出售按钮 | 按钮区域 |
| 跳过准备 | 点击"跳过"按钮 | 按钮区域 |
| 开始下一波 | 点击"开始"按钮 | 按钮区域 |

---

## 3. 地图与路径

### 3.1 网格

- 逻辑尺寸 400×700，格子 64×64
- 6列 × 10行 = 60 格子
- 约 36 个可放置格子

### 3.2 路径

```typescript
// GameConfig.ts 中的 PATH_POINTS
const PATH_POINTS: Vec2[] = [
    { x: 0, y: 1 },   // 左侧入口
    { x: 3, y: 1 },
    { x: 3, y: 4 },
    { x: 5, y: 4 },
    { x: 5, y: 2 },
    { x: 5, y: 6 },
    { x: 4, y: 6 },
    { x: 4, y: 8 },
    { x: 5, y: 8 },   // 右侧终点
];
```

- 总路径长度约 1152 像素
- 敌人从左侧 (-20, startY) 进入，右侧离开
- 路径点及相邻格子标记为不可放置

### 3.3 地图渲染

- 使用 Graphics 组件绘制网格和路径
- 草地：棋盘格（偶数/奇数格微调亮度）
- 路径：棕色矩形

---

## 4. 防御塔系统

### 4.1 塔类型配置

```typescript
// GameConfig.ts 中的 TOWER_TYPES

// 箭塔 (Arrow)
const ARROW_TOWER = {
    id: 'arrow', name: '箭塔', cost: 50,
    damage: 12, range: 140, fireRate: 0.5,
    projectileSpeed: 350, aoeRadius: 0,
    slowEffect: null,
    description: '快速射击，伤害一般'
};

// 炮塔 (Cannon)
const CANNON_TOWER = {
    id: 'cannon', name: '炮塔', cost: 100,
    damage: 35, range: 160, fireRate: 1.2,
    projectileSpeed: 250, aoeRadius: 40,
    slowEffect: null,
    description: '高伤害AOE，攻速慢'
};

// 减速塔 (Frost)
const FROST_TOWER = {
    id: 'frost', name: '减速塔', cost: 80,
    damage: 8, range: 130, fireRate: 0.7,
    projectileSpeed: 200, aoeRadius: 0,
    slowEffect: { duration: 2, factor: 0.5 },
    description: '减速敌人，持续伤害'
};
```

### 4.2 塔属性总览

| 属性 | 箭塔 (Arrow) | 炮塔 (Cannon) | 减速塔 (Frost) |
|------|-------------|---------------|----------------|
| 成本 | 50 | 100 | 80 |
| 伤害 | 12 | 35 | 8 |
| 射程 | 140 | 160 | 130 |
| 攻速 | 0.5s | 1.2s | 0.7s |
| DPS | 24 | 29.2 | 11.4 |
| 投射物速度 | 350 | 250 | 200 |
| AOE 半径 | 0（单体） | 40 | 0（单体） |
| 减速效果 | 无 | 无 | 50% 减速，2 秒 |
| 战术定位 | 前期主力 | 中后期打坦克 | 辅助提升输出 |

### 4.3 升级系统

```typescript
// Tower.ts 中的升级逻辑
getStatsForLevel(level: number): TowerStats {
    return {
        damage: Math.round(this.config.damage * (1 + (level - 1) * 0.5)),
        range: this.config.range + (level - 1) * 15,
        fireRate: this.config.fireRate * (1 - (level - 1) * 0.1),
        // 其他属性不变
    };
}

getUpgradeCost(currentLevel: number): number {
    return Math.round(this.config.cost * currentLevel);
}

getSellValue(currentLevel: number): number {
    return Math.round(this.config.cost * 0.5 * currentLevel);
}
```

- 最多 3 级
- 升级消耗：基础成本 × 当前等级
- 升级效果：伤害 +50%，射程 +15，攻速提升
- 出售价值：基础成本 × 0.5 × 当前等级

### 4.4 索敌逻辑

- 每 100ms 检测一次（update 中计时器）
- 优先目标：距离路径终点最近的敌人
- 射程检测：距离 <= currentRange

### 4.5 放置规则

- 非路径、非已占用格子
- 点击格子 → 绿色/红色预览 + 射程圈
- 放置动画：缩放弹跳 0.3s

---

## 5. 敌人系统

### 5.1 敌人类型配置

```typescript
// GameConfig.ts 中的 ENEMY_TYPES

// Basic
const BASIC_ENEMY = {
    id: 'basic', name: '普通',
    hp: 40, speed: 90, reward: 10, hitRadius: 12
};

// Fast
const FAST_ENEMY = {
    id: 'fast', name: '快速',
    hp: 25, speed: 160, reward: 15, hitRadius: 10
};

// Tank
const TANK_ENEMY = {
    id: 'tank', name: '坦克',
    hp: 120, speed: 55, reward: 30, hitRadius: 16
};
```

### 5.2 敌人属性总览

| 属性 | Basic | Fast | Tank |
|------|-------|------|------|
| HP | 40 | 25 | 120 |
| 速度 | 90 | 160 | 55 |
| 奖励 | 10 | 15 | 30 |
| 碰撞半径 | 12 | 10 | 16 |
| 出现 | Wave 1+ | Wave 5+ | Wave 10+ |
| HP 条 | 头顶 Node | 头顶 Node | 头顶 Node |

### 5.3 波次分布

```typescript
// GameConfig.ts 中的 WAVE_CONFIG
const WAVE_CONFIG: WaveEntry[] = [
    // Wave 1-4: 100% Basic
    { basic: 7, fast: 0, tank: 0 },
    // Wave 5-9: 70% Basic + 30% Fast
    // Wave 10-19: 50% Basic + 30% Fast + 20% Tank
    // Wave 20-30: 40% Basic + 25% Fast + 35% Tank
];
```

| 波次区间 | 敌人组合 | 数量公式 | HP 缩放 |
|---------|---------|---------|---------|
| 1-4 | 100% Basic | 5+wave×2 | 幂函数公式 |
| 5-9 | 70% Basic + 30% Fast | 5+wave×2 | 幂函数公式 |
| 10-19 | 50% Basic + 30% Fast + 20% Tank | 8+wave×2 | 幂函数公式 |
| 20-30 | 40% Basic + 25% Fast + 35% Tank | 10+wave×2 | 幂函数公式 |

### 5.4 HP 缩放公式

```typescript
getHpScale(wave: number): number {
    return 1 + Math.pow(wave - 1, 1.5) * 0.04;
}
// Wave 1: ×1.0, Wave 10: ×2.08, Wave 20: ×4.31, Wave 30: ×7.25
// Basic 40HP → Wave 30: 290HP
// Tank 120HP → Wave 30: 870HP
```

### 5.5 生成节奏

- 间隔：800ms（Wave 20+ 后 600ms）
- 从路径起点 (-20, startY) 生成
- 使用 schedule 控制生成节奏

### 5.6 敌人移动

```typescript
// Enemy.ts
update(dt: number): void {
    this.distanceTraveled += this.currentSpeed * dt;
    const pos = this.pathSystem.getPointOnPath(this.distanceTraveled);
    this.node.setPosition(pos.x, pos.y);
}
```

- 减速效果：修改 currentSpeed = baseSpeed * slowFactor
- 减速持续：2 秒后恢复
- HP 条：Label 组件，随 HP 变化颜色

---

## 6. 投射物系统

### 6.1 追踪逻辑

```typescript
// Projectile.ts
update(dt: number): void {
    if (this.target && this.target.isAlive) {
        this.targetPos = this.target.node.getPosition();
    }
    const dir = this.targetPos.sub(this.node.getPosition()).normalize();
    this.node.setPosition(
        this.node.getPosition().add(dir.multiply(this.speed * dt))
    );
}
```

### 6.2 AOE 处理

```typescript
// Projectile.ts — Cannon 投射物命中时
onHit(): void {
    const enemies = this.findEnemiesInRange(this.aoeRadius);
    for (const enemy of enemies) {
        enemy.takeDamage(this.damage);
    }
}
```

### 6.3 投射物类型

| 类型 | 速度 | 追踪 | AOE | 特效 |
|------|------|------|-----|------|
| Arrow | 350 | 是 | 无 | 拖尾（Graphics） |
| Cannon | 250 | 是 | 40px | 爆炸粒子 |
| Frost | 200 | 是 | 无 | 冰晶扩散 |

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
| 箭塔 L1/L2/L3 | 50 / 100 / 150 |
| 炮塔 L1/L2/L3 | 100 / 200 / 300 |
| 减速塔 L1/L2/L3 | 80 / 160 / 240 |

### 7.3 存档

```typescript
// Economy.ts 中的 save/load
save(): void {
    const data = { bestWave: this.bestWave, totalKills: this.totalKills };
    if (typeof wx !== 'undefined') {
        wx.setStorageSync('saveData', JSON.stringify(data));
    } else {
        localStorage.setItem('saveData', JSON.stringify(data));
    }
}
```

- **局内资源**（金币、生命值）：每局重置，不存档
- **跨局进度**（最高波次、总击杀）：持久化存档
- 微信环境：wx.setStorageSync（10MB 上限）
- 编辑器环境：localStorage fallback

---

## 8. 波次系统

### 8.1 流程

```
INTERMISSION(5s) → PREPARE(15s，可跳过) → FIGHTING → INTERMISSION → ...
```

### 8.2 波次间期

- 5 秒固定间隙
- PREPARE 15 秒倒计时，显示"跳过 Xs"
- 波次开始/完成有视觉提示
- 波次完成：+金币 浮动文字

---

## 9. UI 设计

### 9.1 布局

```
┌─────────────────────────────────┐
│ HP 20   GOLD 200   WAVE 1/30    │  HUD (y: 0-44)
├─────────────────────────────────┤
│  ⬜ ⬜ ⬜ ⬜ ⬜ ⬜                 │
│  ⬜ 🟫 ⬜ ⬜ 🟫 ⬜                 │  │ 游戏地图 (y: 44-640)
│  ⬜ 🟫 ⬜ ⬜ 🟫 ⬜                 │  │ 实体 (Node hierarchy)
│  ⬜ ⬜ ⬜ ⬜ 🟫 ⬜                 │
│  ⬜ ⬜ ⬜ ⬜ 🟫 ⬜                 │
├─────────────────────────────────┤
│  [箭塔] [炮塔] [减速塔]  [开始]   │  塔选择栏 (y: 640-700)
└─────────────────────────────────┘
```

### 9.2 HUD（顶部状态栏）

- Node 组件（Screen Space overlay）
- HP 文本：左对齐，红色 #ff4444
- GOLD 文本：居中，金色 #ffd700
- WAVE 文本：右对齐，白色 #ffffff
- 金币变化时播放 +/- 浮动文字动画
- 字体：系统无衬线字体

### 9.3 塔选择栏（底部）

- Node 组件（Screen Space overlay）
- 横向按钮组，每个按钮 ≥ 44×44px
- 状态：正常 / 选中（边框高亮） / 禁用（金币不足）
- 触摸事件：EventTouch

### 9.4 塔信息面板

- World Space Node（跟随塔上方偏移）
- 背景：Graphics 圆角矩形
- 内容：塔名称 + 等级星星 + 属性文本
- 按钮：升级（显示费用） + 出售（显示收益）

### 9.5 浮动文字系统

```typescript
// FloatingText.ts
show(message: string, worldPos: Vec3, color: Color): void {
    const node = this.pool.get();
    node.setPosition(worldPos.x, worldPos.y, worldPos.z);
    const label = node.getComponent(Label)!;
    label.string = message;
    label.color = color;
    // tween: 上浮 + 淡出
}
```

---

## 10. 视觉设计

### 10.1 颜色

- 背景：深蓝黑 #1a1a2e
- 草地：#2e7d32 / #1b5e20（棋盘格）
- 路径：泥土棕 #4e342e
- HUD 背景：rgba(0,0,0,0.85)

### 10.2 塔视觉（AI 生成）

- 箭塔：蓝色圆形底座 + 白色三角箭头
- 炮塔：橙色方形 + 深色炮管
- 减速塔：浅蓝六边形 + 雪花图案

### 10.3 敌人视觉（AI 生成）

- Basic：红色圆形 + 深色眼斑
- Fast：橙色三角形 + 运动拖尾
- Tank：紫色圆角方块

### 10.4 美术资源规格

| 资源 | 尺寸 | 格式 |
|------|------|------|
| 塔精灵图 | 64×64 | PNG-8 |
| 敌人精灵图 | 32×32 | PNG-8 |
| 投射物 | 16×16 | PNG-8 |
| UI 图标 | 32×32 | PNG-8 |

---

## 11. 音频设计

### 11.1 Web Audio 合成（无外部文件）

| 事件 | 音效 | 参数 |
|------|------|------|
| 箭射击 | "嗖" | 800→400Hz 下降, 50ms |
| 炮爆炸 | "轰" | 100Hz 低频, 200ms |
| 减速 | 冰晶声 | 600→200Hz, 300ms |
| 击杀 | "叮" | 1200Hz, 80ms |
| 金币获得 | "哗啦" | 多短促高频, 100ms |
| 放置塔 | "咚" | 200Hz, 100ms |
| 波次开始 | "嗡" | 200→800Hz, 500ms |

### 11.2 实现

```typescript
// AudioManager.ts — 单例
export class AudioManager extends Component {
    playSfx(type: SfxType): void {
        // Web Audio API 合成（Cocos Creator 内置）
    }
}
```

---

## 12. 场景管理

### 12.1 场景流程

```
GameScene → (单场景，所有 UI 在同一场景中)
```

### 12.2 GameScene

- 核心游戏场景
- GameBootstrap 作为入口点
- 各系统通过 Node hierarchy 组织
- HUD + 塔选择栏 + 塔信息面板作为 GameScene 子节点

---

## 13. 技术架构

### 13.1 核心系统职责

| 系统 | 职责 | 数据来源 | 类型 |
|------|------|---------|------|
| Grid | 地图、可放置检测 | GameConfig.PATH_POINTS | 纯 TypeScript |
| Path | 路径点、距离→位置 | GameConfig.PATH_POINTS | 纯 TypeScript |
| WaveManager | 波次生成、难度 | GameConfig.WAVE_CONFIG | Component |
| Economy | 金币/生命值/存档 | GameConfig.ECONOMY_CONFIG | Component |
| Tower | 个体状态、射击 | GameConfig.TOWER_TYPES | Component |
| Enemy | 个体状态、移动、减速 | GameConfig.ENEMY_TYPES | Component |
| Projectile | 飞行、命中 | Tower config | Component |
| GameScene | 协调所有系统 | 引用所有子系统 | Component |
| HUD | UI 展示 | Economy | Component |
| TowerSelectBar | 塔选择 UI | GameConfig | Component |
| TowerInfoPanel | 塔详情 UI | Tower | Component |
| FloatingText | 浮动文字 | 对象池 | Component |
| AudioManager | 音效播放 | Web Audio API | Component |

### 13.2 数据流

```
GameScene.update():
  WaveManager.update(dt) → schedule spawn → Enemy 移动
  Enemy → 到达终点 → GameScene.onEnemyReachEnd() → Economy.loseLife()
  Tower → 索敌 → fire() → Projectile 追踪 → onHit() → Enemy.takeDamage() → Economy.earn()
  Economy.gold → HUD.update()
```

### 13.3 事件系统

```typescript
// GameScene.ts 中的事件回调
// 通过 Component 引用直接通信，无需事件总线
```

---

## 14. 微信小游戏适配

### 14.1 构建

```
开发：Cocos Creator Editor Play Mode
微信：Cocos Creator CLI build → 微信开发者工具
```

### 14.2 平台适配层

```typescript
// 条件编译隔离平台代码
if (typeof wx !== 'undefined') {
    // 微信环境
    wx.setStorageSync(key, value);
} else {
    // 编辑器环境
    localStorage.setItem(key, JSON.stringify(value));
}
```

### 14.3 包体目标

| 组件 | 估算 | 说明 |
|------|------|------|
| 引擎运行时 | 内置 | 微信客户端已包含 |
| 游戏代码 | < 500KB | TypeScript 编译后 |
| 首资源包 | < 1MB | 纹理图集 + 配置 |
| **首包合计** | **< 2MB** | 目标 < 4MB |

### 14.4 性能目标

| 指标 | 目标 | 说明 |
|------|------|------|
| 启动时间 | < 3s | 首屏可见 |
| 帧率 | ≥ 30fps | 中低端机 |
| 内存 | < 256MB | 含引擎 |
| 包体 | < 4MB | 硬性限制 |

---

## 15. 配置管理系统

### 15.1 GameConfig.ts 配置

```typescript
// 所有游戏数值集中在 GameConfig.ts
// 使用 as const 确保类型推断

export const TOWER_TYPES = {
    arrow: { id: 'arrow', name: '箭塔', cost: 50, ... },
    cannon: { id: 'cannon', name: '炮塔', cost: 100, ... },
    frost: { id: 'frost', name: '减速塔', cost: 80, ... },
} as const;

export const ENEMY_TYPES = { ... } as const;
export const PATH_POINTS: Vec2[] = [ ... ];
export const WAVE_CONFIG: WaveEntry[] = [ ... ];
export const ECONOMY_CONFIG = { startingGold: 200, ... };
```

### 15.2 资源加载

- 小资源：Graphics + Color 纯代码绘制
- 大资源：Cocos Creator 资源管理器（自动分包）
- 首包策略：只加载核心资源

---

## 16. 代码规范

### 16.1 TypeScript

```typescript
// 类：PascalCase
// 方法：camelCase
// 私有字段：_camelCase
// 常量：UPPER_SNAKE_CASE
// 接口：IPascalCase
```

- `strict: true` 必须开启
- `experimentalDecorators: true`（Cocos Creator @ccclass 需要）
- 使用 `async/await` 替代回调
- 禁止 `@ts-ignore` 除非有注释说明原因

### 16.2 Cocos Creator

- Component 只做协调和渲染，逻辑委托给纯 TypeScript 系统类
- Node 作为容器，通过 `addChild` 建立层级
- Graphics 动态绘制网格、路径、预览
- Sprite 显示精灵，通过 `color` 属性做 tint
- Label 显示文本，通过 `string` 属性更新
- EventTouch 处理触摸事件
- UITransform 控制节点尺寸

### 16.3 微信适配

```typescript
// 条件编译隔离平台代码
if (typeof wx !== 'undefined') {
    wx.setStorageSync(key, value);
} else {
    localStorage.setItem(key, JSON.stringify(value));
}
```

---

## 17. 扩展性

### 17.1 新塔类型

在 GameConfig.ts 的 TOWER_TYPES 中添加新配置，无需修改核心逻辑。

### 17.2 新敌人类型

在 GameConfig.ts 的 ENEMY_TYPES 中添加新配置，修改 WAVE_CONFIG 波次表。

### 17.3 新地图

修改 PATH_POINTS 数组。

### 17.4 难度预设

创建多个 ECONOMY_CONFIG 和 WAVE_CONFIG 配置。

---

## 18. 后续迭代（P1+）

| 项目 | 说明 |
|------|------|
| AI 美术 | ComfyUI 生成精灵图 → 纹理图集 |
| 对象池 | 投射物、敌人、浮动文字对象池 |
| 存档系统 | 云端 + 本地 fallback |
| 排行榜 | 微信开放数据域 |
| 广告系统 | Banner / 激励视频 |
| 多关卡 | 多地图配置 |
| 难度预设 | 简单/普通/困难 |

---

## 附录 A：代码对照

| Phaser 文件 | Cocos Creator 对应 | 状态 |
|------------|-------------------|------|
| `src/utils/config.ts` | `assets/scripts/utils/GameConfig.ts` | 已迁移 |
| `src/entities/Grid.ts` | `assets/scripts/systems/Grid.ts` | 已迁移 |
| `src/entities/Path.ts` | `assets/scripts/systems/Path.ts` | 已迁移 |
| `src/systems/WaveManager.ts` | `assets/scripts/systems/WaveManager.ts` | 已迁移 |
| `src/systems/Economy.ts` | `assets/scripts/systems/Economy.ts` | 已迁移 |
| `src/entities/Tower.ts` | `assets/scripts/entities/Tower.ts` | 已迁移 |
| `src/entities/Enemy.ts` | `assets/scripts/entities/Enemy.ts` | 已迁移 |
| `src/entities/Projectile.ts` | `assets/scripts/entities/Projectile.ts` | 已迁移 |
| `src/ui/HUD.ts` | `assets/scripts/ui/HUD.ts` | 已迁移 |
| `src/ui/TowerSelectBar.ts` | `assets/scripts/ui/TowerSelectBar.ts` | 已迁移 |
| `src/ui/TowerInfoPanel.ts` | `assets/scripts/ui/TowerInfoPanel.ts` | 已迁移 |
| `src/fx/FloatingText.ts` | `assets/scripts/fx/FloatingText.ts` | 已迁移 |
| `src/scenes/GameScene.ts` | `assets/scripts/scenes/GameScene.ts` | 已迁移 |

---

## 附录 B：技术决策记录

| 决策 | 选项 | 选择 | 原因 |
|------|------|------|------|
| 引擎 | Unity / Phaser / Cocos | **Cocos Creator** | 官方微信适配、TypeScript 原生、AI 自动化友好 |
| 配置 | JSON / ScriptableObjects / GameConfig.ts | **GameConfig.ts** | TypeScript 类型安全、单文件管理 |
| UI | uGUI / NGUI / 纯代码 | **纯代码 Node + Label + Graphics** | 无额外资源依赖、完全可编程 |
| 音频 | AudioClip / Web Audio API | **Web Audio API** | 无需音频文件、纯代码合成 |
| 存档 | PlayerPrefs / WX Storage / 云端 | **WX Storage + 云端** | 微信原生、编辑器 fallback |
| 构建 | batchmode / CLI / 手动 | **Cocos Creator CLI** | 全自动化、CI/CD 友好 |
| 部署 | CI / 手动 / 混合 | **DevTools CLI** | 自动化部署 + 预览 |
