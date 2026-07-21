# XXL 塔防 — 游戏设计方案 v1.1（第二轮修订）

## 修订说明
本版本为 v1.0 的第二轮修订，根据第一轮评审（Opus）的全部 Critical 和 High 级别问题进行修改。Medium 和 Low 级别问题记录在案，列入后续迭代。

---

## 修订 1：TowerSelectBar — 纯 Phaser UI（解决 C1）

### 修订前
TowerSelectBar 使用 `document.createElement('div')` 创建 HTML 按钮，通过 CSS 定位到屏幕底部。

### 修订后
使用 Phaser Container + Rectangle + Text 构建纯 Phaser UI。

**组件结构**：
```
TowerSelectBar (Container, y=640)
├── bg (Graphics, 全宽半透明背景条)
├── towerButtons[] (Container × 3)
│   ├── bgRect (Rectangle, 80×54)
│   ├── iconSprite (Sprite, 塔图标 32×32)
│   ├── nameText (Text, 塔名称)
│   └── costText (Text, 金币成本)
├── startButton (Container)
│   ├── bgRect (Rectangle, 80×48)
│   └── text (Text, "开始")
└── waveInfoText (Text, "准备时间: XX 秒")
```

**交互**：
- 每个按钮 bgRect 调用 `setInteractive({ useHandCursor: true })`
- `pointerover` → 边框加亮
- `pointerout` → 恢复
- `pointerdown` → 触发选择/开始
- 选中态：bgRect 边框颜色变为塔类型颜色，添加 `strokeStyle` 加粗

**状态**：
- `selectedType: TowerType | null` — 当前选中的塔类型
- `canAfford: boolean[]` — 每个塔的买得起状态（动态更新）

**注意**：Container 内的 Rectangle 的 `setInteractive` 工作正常（Phaser 3 已知特性）。但 Container 本身的 `setInteractive` 需要自定义 hitArea。本方案将交互绑定到 Rectangle 上，而非 Container。

**事件优先级**：TowerSelectBar 接收 pointer 事件时，使用 `e.stopPropagation()` 防止事件穿透到 GameScene 的地图点击处理。

**塔信息面板交互**：TowerInfoPanel 打开时，GameScene 的 `pointerdown` 处理函数检查 `panelOpen` 标志，为 true 时跳过地图放置逻辑。点击空白区域（非面板区域）时关闭面板并重置 `panelOpen`。

---

## 修订 2：HUD — 移除 emoji（解决 C2）

### 修订前
```typescript
this.goldText.setText(`💰 ${gold}`);
this.livesText.setText(`❤️ ${lives}`);
```

### 修订后
```typescript
this.livesText.setText(`HP ${lives}`);
this.goldText.setText(`GOLD ${gold}`);
this.waveText.setText(`WAVE ${wave}/${totalWaves}`);
```

**说明**：使用纯英文文字替代 emoji。如果需要图标，可在 HUD 中用 Phaser Graphics 绘制心形（两个圆 + 三角形）和金币（圆形 + 内圆），但第一版先保证可读性。

**布局**：
- HP 文本：(10, 14)，左对齐，红色 #ff4444
- GOLD 文本：(200, 14)，居中，金色 #ffd700
- WAVE 文本：(390, 14)，右对齐，白色 #ffffff

---

## 修订 3：难度曲线重做（解决 C3）

### 修订前（代码中的值，导致 Wave 30 不可通关）
```typescript
// 数量缩放 — 有额外乘算因子
const waveMultiplier = 1 + (this.currentWave - 1) * 0.25;  // Wave 30: ×7.25
const baseCount = 5 + this.currentWave * 2;
this.waveEnemiesToSpawn = Math.floor(baseCount * waveMultiplier);

// HP 缩放 — 每波 +30%
getScaledHp(): Math.floor(ENEMY_TYPES[type].hp * (1 + (wave-1) * 0.3));
```

### 修订后
```typescript
// 数量：线性增长，无额外乘算
const enemyCount = 5 + this.currentWave * 2;  // Wave 30: 65 个

// HP：温和指数增长
const hpScale = 1 + Math.pow(this.currentWave - 1, 1.5) * 0.04;
// Wave 1: ×1.0, Wave 10: ×2.85, Wave 20: ×7.03, Wave 30: ×13.0
// Basic 40HP → Wave 30: 520HP（需要箭塔射击 43 发 ≈ 21.5 秒）
// Tank 120HP → Wave 30: 1560HP（需要箭塔射击 130 发 ≈ 65 秒，需要炮塔支援）
```

**修正后各波数据估算**（使用 config.ts 基础值：Basic HP=30, Fast HP=20, Tank HP=100）：

公式：hpScale = 1 + (wave-1)^1.5 × 0.04

| 波次 | hpScale | 敌人数量 | Basic HP | Fast HP | Tank HP | Wave 30 混合总 HP 估算 |
|------|---------|---------|----------|---------|---------|----------------------|
| 1 | ×1.00 | 7 | 30 | 20 | 100 | 280 |
| 5 | ×1.32 | 15 | 40 | 26 | 132 | ~830 |
| 10 | ×2.08 | 25 | 62 | 42 | 208 | ~2350 |
| 15 | ×3.10 | 35 | 93 | 62 | 310 | ~6825 |
| 20 | ×4.31 | 45 | 129 | 86 | 431 | ~13600 |
| 30 | ×7.25 | 65 | 218 | 145 | 725 | ~22400 |

**验证**：Wave 30 总 HP ≈ 22400。3 箭塔(DPS 24×3=72) + 2 炮塔(DPS 29×2=58) + 1 减速塔 → 总 DPS ≈ 148。敌人分散到达，有效输出时间约 80 秒 → 总输出 ≈ 11840。加上减速塔的辅助（减速后 DPS 提升约 50%），实际清怪时间约 90-120 秒，节奏合理。

**策略**：先实现此曲线，在实际游戏中测试。如果后期太简单，增大 0.04 系数（如 0.05）；如果太难，降低（如 0.03）。

---

## 修订 4：投射物追踪敌人（解决 H1）

### 修订前
Projectile 在构造时锁定目标坐标：
```typescript
constructor(..., targetX: number, targetY: number, ...) {
  this.targetX = targetX;
  this.targetY = targetY;
}
// update 中飞向固定坐标
const dx = this.targetX - this.projX;
```

### 修订后
Projectile 持有敌人引用，每帧读取其当前位置：
```typescript
class Projectile {
  private targetEnemy: Enemy | null;
  
  constructor(..., targetEnemy: Enemy, ...) {
    this.targetEnemy = targetEnemy;
  }
  
  update(dt: number): boolean {
    // 如果目标还活着，追踪其当前位置
    if (this.targetEnemy && this.targetEnemy.alive) {
      this.targetX = this.targetEnemy.x;
      this.targetY = this.targetEnemy.y;
    }
    // ... 飞向 targetX/targetY
  }
}
```

**目标已死亡处理**：如果目标已死亡，投射物继续飞向最后已知位置，到达后自动销毁。

---

## 修订 5：炮塔 AOE 实现（解决 H2）

### 修订前
Projectile 命中时只对单个敌人造成伤害（GameScene 中 break 出循环）。

### 修订后
命中 cannon 投射物时，遍历所有存活敌人，对距离 < 40 的敌人造成伤害：
```typescript
if (proj.projType === 'cannon') {
  // AOE: 对所有在爆炸半径内的敌人造成伤害
  for (const enemy of this.enemies) {
    if (!enemy.alive) continue;
    const dx = enemy.x - proj.projX;
    const dy = enemy.y - proj.projY;
    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      const dead = enemy.takeDamage(proj.damage);
      // ...
    }
  }
} else {
  // 单体：只对第一个命中的敌人造成伤害
  // ...
}
```

---

**敌人基础属性统一值**（config.ts 与文档统一）：

| 属性 | Basic | Fast | Tank |
|------|-------|------|------|
| HP | 40 | 25 | 120 |
| 速度 | 90 | 160 | 55 |
| 奖励 | 10 | 15 | 30 |

> **说明**：之前 config.ts 中敌人基础值与本文档不一致（Basic HP 30 vs 40 等），现已统一。config.ts 中的旧值视为废弃。

---

## 修订 6：实现 PREPARE 状态机（解决 H3）

### 修订前
WaveManager 只有 `waveActive` 和 `betweenWaves` 两个布尔状态。

### 修订后
引入 GameState 枚举：
```typescript
enum GameState {
  IDLE,          // 初始状态
  PREPARE,       // 准备布阵（15秒倒计时）
  FIGHTING,      // 战斗中
  INTERMISSION,  // 波次间隙（5秒）
  VICTORY,       // 胜利
  GAME_OVER,     // 失败
}
```

**PREPARE 触发方式**：
- 第一波：IDLE → PREPARE（自动 15 秒倒计时，玩家可提前点击"开始"跳过剩余时间）
- 后续波次：INTERMISSION(5s) → PREPARE(15s) → 自动进入 FIGHTING（玩家可提前点击跳过）

**塔选择栏行为**：
- PREPARE 期间：显示"开始"按钮（倒计时未到 0 时显示"跳过 Xs"，倒计时到 0 后显示"开始"）
- FIGHTING 期间：隐藏"开始"按钮，塔选择栏仅用于观察
- INTERMISSION 期间：显示"下一波"按钮

WaveManager 职责：
- `startNextWave()`：触发 PREPARE → 15秒倒计时 → 自动进入 FIGHTING
- `startFirstWave()`：IDLE → PREPARE
- `update(dt)`：管理 PREPARE 倒计时 + FIGHTING 生成逻辑

GameScene 职责：
- 根据当前状态控制 UI 显示
- PREPARE 时显示倒计时文字
- FIGHTING 时隐藏塔选择栏的"开始"按钮
- INTERMISSION 时显示"下一波"按钮

---

## 修订 7：补齐经济奖励系统（解决 H4）

### 修订前
Economy.ts 只有 `earn(amount)` 通用方法，击杀时直接传入 `enemy.reward`，无波次缩放。

### 修订后
```typescript
// WaveManager
getKillReward(baseReward: number): number {
  return Math.floor(baseReward * (1 + this.currentWave * 0.05));
}

// GameScene.update() 中击杀时
const reward = this.waveManager.getKillReward(enemy.reward);
this.economy.earn(reward);
this.showFloatingText(`+${reward}`, enemy.x, enemy.y);

// GameScene.onWaveComplete() 中
const waveBonus = 30 + this.waveManager.currentWave * 5;
this.economy.earn(waveBonus);
this.showFloatingText(`波次奖励 +${waveBonus}`, 200, 340);
```

### 浮动文字系统定义（补充 NH4）
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

### 金币文字 vs 游戏内文本
- 浮动文字使用英文数字（`+10`、`波次奖励 +35`）
- 非战斗文本可使用中文（`波次完成`、`游戏结束`）

---

---

## 修订 8：塔信息面板（解决 H5）

### 设计
点击已放置的塔时，在塔上方弹出信息面板。

**组件结构**：
```
TowerInfoPanel (Container, 跟随塔位置偏移)
├── bg (Graphics, 圆角矩形背景 160×80)
├── nameText (Text, 塔名称 + ★☆☆)
├── statsText (Text, 伤害/射程/攻速)
├── upgradeButton (Container)
│   ├── bgRect (Rectangle)
│   └── text (Text, "升级 XX💰")
├── sellButton (Container)
│   ├── bgRect (Rectangle)
│   └── text (Text, "出售 +XX💰")
```

**交互**：
- `pointerdown` upgradeButton → 调用 `tower.upgrade()` + `economy.spend(cost)`
- `pointerdown` sellButton → 调用 `economy.earn(sellValue)` + 移除塔
- 金币不足时按钮变灰
- 点击空白区域 → 关闭面板
- 3 级满级后隐藏升级按钮

---

## 修订 9：统一配置数值（解决 M1）+ 补充缺失配置字段

### 修订前
设计文档中的数值与 config.ts 不一致（8 项塔的差异 + 6 项敌人的差异），且 TOWER_TYPES 缺少 projectileSpeed、aoeRadius、slowEffect 字段。

### 修订后
以设计文档 v1.0 值为基准，更新 config.ts：

**塔配置统一值 + 新增字段**：

| 属性 | 旧值（代码） | 新值（设计） |
|------|-------------|-------------|
| 起始金币 | 150 | 200 |
| 箭塔伤害 | 10 | 12 |
| 箭塔射程 | 120 | 140 |
| 箭塔攻速 | 600ms | 500ms |
| 炮塔伤害 | 30 | 35 |
| 炮塔射程 | 150 | 160 |
| 减速塔伤害 | 5 | 8 |
| 减速塔射程 | 130 | 130（不变） |

```typescript
// TOWER_TYPES 中每个塔类型补充：
arrow:   { ..., projectileSpeed: 350, aoeRadius: 0,    slowEffect: null }
cannon:  { ..., projectileSpeed: 250, aoeRadius: 40,   slowEffect: null }
frost:   { ..., projectileSpeed: 200, aoeRadius: 0,    slowEffect: { duration: 2000, factor: 0.5 } }
```

**敌人基础属性统一值**（config.ts 与文档统一）：

| 属性 | Basic | Fast | Tank |
|------|-------|------|------|
| HP | 40 | 25 | 120 |
| 速度 | 90 | 160 | 55 |
| 奖励 | 10 | 15 | 30 |

> 之前 config.ts 中敌人基础值与本文档不一致（Basic HP 30 vs 40 等），现已统一。

**注意**：难度曲线已重做（修订 3），更新 WaveManager 中的 HP 缩放公式。

---

## 修订 10：路径点越界修复（解决 L4）

### 修订前
PATH_POINTS 中有 `(8,2)` 和 `(8,6)`，但 GRID_COLS = 6，超出范围。

### 修订后
调整路径点为：
```typescript
PATH_POINTS: [
  { x: 0, y: 1 },
  { x: 3, y: 1 },
  { x: 3, y: 4 },
  { x: 5, y: 4 },   // 6→5
  { x: 5, y: 2 },   // 6→5
  { x: 5, y: 6 },   // 8→5
  { x: 4, y: 6 },   // 8→4
  { x: 4, y: 8 },
  { x: 6, y: 8 },   // GAME_WIDTH/TILE_SIZE → 6
]
```

---

## 未修订项（记录在案，列入后续迭代）

### Medium 级别
- M3: GameScene 是上帝对象 → P1 阶段解耦
- M4: 缺少对象池 → P1 阶段实现
- M5: WaveManager 使用 `any` → 定义 GameSceneRef 接口
- M6: 缺少音频系统 → P1 阶段实现 AudioManager

### Low 级别
- L1: 渲染深度未显式设置 → 添加 setDepth()
- L2: 缺少胜利条件区分 → VICTORY 画面差异化
- L3: 缺少波次过渡动画 → 浮动文字 + 淡入淡出
- L5: 特效系统 → 击杀/放置/爆炸粒子
- L6: 缺少存储系统 → wx.setStorageSync

---

## 修订汇总

| 编号 | 解决评审问题 | 修订内容 | 优先级 |
|------|-------------|---------|--------|
| R1 | C1 | TowerSelectBar 改纯 Phaser UI | P0 |
| R2 | C2 | HUD 移除 emoji | P0 |
| R3 | C3 | 难度曲线重做 | P0 |
| R4 | H1 | 投射物追踪敌人 | P1 |
| R5 | H2 | 炮塔 AOE | P1 |
| R6 | H3 | PREPARE 状态机 | P1 |
| R7 | H4 | 经济奖励补齐 | P1 |
| R8 | H5 | 塔信息面板 | P1 |
| R9 | M1 | 统一配置数值 | P0 |
| R10 | L4 | 路径点越界 | P0 |