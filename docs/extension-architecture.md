# 扩展架构规划 — XXL Tower Defense

> 本文档定义游戏的长期扩展方向和架构预留设计。
> 目标：当前开发不增加过多复杂度，但架构上为后续扩展留好接口，避免推倒重做。

---

## 一、扩展方向总览

```
当前 MVP（微信验证）          中期扩展                    长期愿景
─────────────────          ──────────                  ──────────
3 种塔 / 3 种敌人    →    8+ 种塔 / 6+ 种敌人    →    20+ 种塔 / 10+ 种敌人
1 张地图 / 30 波     →    5+ 张地图 / 多难度      →    20+ 关卡 / 无尽模式
单货币（金币）       →    多货币 + 材料           →    完整经济系统
无主界面进度         →    炮台升级树 + 资源获取    →    科技树 + 成就 + 收藏
无商业化            →    激励视频广告             →    广告 + IAP + 赛季通行证
2.5D 旋转           →    2.5D 增强动画           →    全 3D 视角可旋转
```

---

## 二、组件化实体架构

### 2.1 设计思路

**不用类型继承，用能力组合。** 新增塔/敌人类型 = 新增 ScriptableObject + 选择能力组件，零代码修改。

### 2.2 塔能力组件

```csharp
// 能力枚举（可扩展）
public enum TowerAbility {
    SingleTarget,     // 单体攻击
    AOE,              // 范围伤害
    Slow,             // 减速
    Pierce,           // 穿透（打一条线上的敌人）
    Splash,           // 溅射（主目标周围）
    Chain,            // 链式弹跳
    Summon,           // 召唤物
    Buff,             // 增益周围塔
    CritChance,       // 暴击
    Burn,             // 持续灼烧
}

// 塔数据（单一类，不再分子类）
[CreateAssetMenu(menuName = "XXL/TowerData")]
public class TowerData : ScriptableObject {
    public string id;
    public string displayName;
    public int cost;
    public TowerStats baseStats;
    public TowerAbility[] abilities;      // 能力组合
    public AbilityParams[] abilityParams;  // 能力参数
    public Sprite icon;
    public Sprite[] levelSprites;         // 3 级外观
    public GameObject prefab;             // 预制体引用
}
```

### 2.3 敌人能力组件

```csharp
public enum EnemyAbility {
    Normal,           // 普通
    Fast,             // 高速
    Armored,          // 护甲（减伤）
    Flying,           // 飞行（无视地面塔）
    Split,            // 死亡分裂
    Stealth,          // 隐身（需特定塔揭示）
    Heal,             // 自愈
    Shield,           // 护盾（需击破后扣血）
    Boss,             // Boss（多阶段）
}

[CreateAssetMenu(menuName = "XXL/EnemyData")]
public class EnemyData : ScriptableObject {
    public string id;
    public string displayName;
    public EnemyStats baseStats;
    public EnemyAbility[] abilities;
    public AbilityParams[] abilityParams;
    public Sprite sprite;
    public GameObject prefab;
}
```

### 2.4 当前 3 种塔的能力映射

| 塔 | abilities | 说明 |
|----|-----------|------|
| 箭塔 | [SingleTarget] | 纯单体 |
| 炮塔 | [AOE] | 范围伤害 |
| 减速塔 | [SingleTarget, Slow] | 单体 + 减速 |

### 2.5 未来扩展示例

| 新塔 | abilities | 说明 |
|------|-----------|------|
| 闪电塔 | [Chain] | 弹跳 3 个目标 |
| 狙击塔 | [SingleTarget, CritChance] | 远射程 + 暴击 |
| 火焰塔 | [AOE, Burn] | 范围 + 持续灼烧 |
| 增益塔 | [Buff] | 增加周围塔攻速 |
| 穿透塔 | [Pierce] | 打一条线 |

---

## 三、多关卡架构

### 3.1 设计思路

GameScene 是**通用容器**，具体关卡内容通过 `LevelData` SO 注入。

### 3.2 LevelData 结构

```csharp
[CreateAssetMenu(menuName = "XXL/LevelData")]
public class LevelData : ScriptableObject {
    public string levelId;
    public string displayName;
    public int unlockCondition;          // 解锁条件（前置关卡星级）
    
    // 地图
    public PathPoint[] pathPoints;       // 路径点
    public int gridCols;
    public int gridRows;
    public Vector2Int[] blockedCells;    // 额外不可放置格子（障碍物）
    
    // 波次
    public WaveEntry[] waves;
    public float prepareTime;
    public float intermissionTime;
    
    // 难度
    public float hpScaleMultiplier;      // 全局 HP 倍率
    public int startingGold;
    public int startingLives;
    
    // 可用塔（某些关卡限制可用塔类型）
    public TowerData[] availableTowers;
    
    // 视觉
    public string tileTheme;             // 地图主题（草地/沙漠/雪地）
    public Color backgroundColor;
}
```

### 3.3 关卡解锁与评价

```csharp
public class LevelProgress {
    public string levelId;
    public int bestWave;                 // 最高波次
    public int stars;                    // 1-3 星评价
    public bool completed;
    public int totalKills;
}

// 星级评价规则
// 3 星：生命值未减少
// 2 星：生命值 > 50%
// 1 星：通关
```

### 3.4 当前 MVP 与扩展的兼容

- MVP 阶段：只创建 1 个 `LevelData` 实例（当前地图），GameScene 从 SO 读取
- 扩展时：创建更多 `LevelData` 实例，加入关卡选择界面，零代码修改

---

## 四、多货币与经济系统

### 4.1 货币类型

```csharp
public enum CurrencyType {
    Gold,       // 金币（局内获取，用于建塔/升级）
    Diamond,    // 钻石（IAP/广告获取，用于解锁/复活）
    Material,   // 材料（关卡掉落，用于炮台永久升级）
    Energy,     // 体力（时间恢复，限制每日游玩次数）— 可选
}
```

### 4.2 经济系统接口

```csharp
public class CurrencySystem {
    private Dictionary<CurrencyType, int> _balances;
    
    public event Action<CurrencyType, int, int> OnBalanceChanged;
    
    public int GetBalance(CurrencyType type);
    public bool CanAfford(CurrencyType type, int amount);
    public bool Spend(CurrencyType type, int amount);
    public void Earn(CurrencyType type, int amount);
    
    public void Save();  // → WXStorage / 云端
    public void Load();
}
```

### 4.3 局内 vs 局外经济

| 货币 | 作用域 | 获取方式 | 消耗方式 |
|------|--------|---------|---------|
| Gold | 局内 | 击杀/波次奖励 | 建塔/升级/出售 |
| Diamond | 局外 | IAP/广告/成就 | 解锁关卡/复活/购买材料 |
| Material | 局外 | 关卡掉落/商店 | 炮台永久升级 |

### 4.4 当前 MVP 兼容

- MVP 阶段：只使用 Gold（局内），CurrencySystem 已支持多类型但只激活 Gold
- 扩展时：激活 Diamond/Material，加入商店 UI，零架构修改

---

## 五、主界面与进度系统

### 5.1 主界面功能规划

```
主界面（MenuScene 扩展）
├── 开始游戏 → 关卡选择
├── 炮台升级（永久升级树）
│   ├── 箭塔：伤害+5% / 攻速+5% / 射程+10
│   ├── 炮塔：AOE半径+5 / 伤害+8%
│   └── 减速塔：减速时间+0.5s / 范围+10
├── 商店（钻石购买材料/皮肤）
├── 成就（里程碑奖励）
├── 设置（音效/音乐/语言）
└── 排行榜（最高波次）
```

### 5.2 永久升级系统

```csharp
[CreateAssetMenu(menuName = "XXL/UpgradeTree")]
public class UpgradeTreeData : ScriptableObject {
    public UpgradeNode[] nodes;
}

[Serializable]
public class UpgradeNode {
    public string id;
    public string displayName;
    public CurrencyType costType;
    public int[] costPerLevel;           // 每级消耗
    public int maxLevel;
    public UpgradeEffect effect;         // 效果类型
    public float valuePerLevel;          // 每级数值
    public string prerequisiteId;        // 前置节点
}
```

### 5.3 存档结构

```csharp
public class SaveData {
    // 跨局进度（持久化）
    public int bestWave;
    public int totalKills;
    public LevelProgress[] levelProgress;
    public int[] upgradeLevels;          // 永久升级等级
    public Dictionary<CurrencyType, int> currencies;  // 局外货币
    
    // 不存：局内金币、局内生命值（每局重置）
}
```

---

## 六、商业化预留

### 6.1 广告触发点

| 触发点 | 类型 | 奖励 |
|--------|------|------|
| 局内复活 | 激励视频 | 恢复 5 点生命 |
| 波次奖励翻倍 | 激励视频 | 金币 ×2 |
| 免费开箱 | 激励视频 | 随机材料 |
| 主界面底部 | Banner | 持续展示 |
| 关卡失败 | 插屏 | — |

### 6.2 IAP 商品规划

| 商品 | 价格 | 内容 |
|------|------|------|
| 去广告 | ¥12 | 移除 Banner + 插屏 |
| 钻石小包 | ¥6 | 100 钻石 |
| 钻石大包 | ¥30 | 600 钻石 |
| 新手礼包 | ¥1 | 50 钻石 + 20 材料 |

### 6.3 接口预留

```csharp
public interface IAdService {
    void ShowRewardedVideo(Action<bool> onComplete);  // true=看完
    void ShowBanner();
    void HideBanner();
    void ShowInterstitial();
}

public interface IPurchaseService {
    void Purchase(string productId, Action<bool> onComplete);
    void RestorePurchases();
}
```

---

## 七、2.5D → 3D 扩展路径

### 7.1 当前 2.5D 实现

- 炮塔：Sprite + Z 轴旋转（`transform.rotation = Quaternion.Euler(0, 0, angle)`）
- 飞行物：2D 轨迹 + 轻微 Z 轴偏移（视觉深度）
- 敌人：Sprite + 受击缩放反馈

### 7.2 中期 2.5D 增强

- 炮塔：3D 模型（低面数）+ 全角度旋转
- 飞行物：3D 抛物线轨迹
- 敌人：3D 模型 + 行走动画
- 地图：Tilemap 保持 2D，实体 3D

### 7.3 长期全 3D

- 相机：可旋转/缩放的 3D 透视相机
- 地图：3D 地形
- 全部实体 3D 模型 + 动画

### 7.4 架构兼容

关键：**逻辑层不关心渲染维度**。

```csharp
// 逻辑层：纯 2D 坐标计算
public class PathSystem {
    public Vector2 GetPointOnPath(float distance);  // 始终返回 2D
}

// 渲染层：根据维度设置转换
public class EnemyView : MonoBehaviour {
    void Update() {
        var pos2D = _enemy.GetPosition();  // 从逻辑层获取 2D 坐标
        transform.position = new Vector3(pos2D.x, pos2D.y, _zOffset);  // 映射到 3D
    }
}
```

逻辑层用 `Vector2`，渲染层决定是 `Vector3(x, y, 0)` 还是 `Vector3(x, z, y)`。切换 2D/3D 只改渲染层。

---

## 八、场景管理扩展

### 8.1 当前（MVP）

```
BootScene → MenuScene → GameScene → GameOverScene
```

### 8.2 扩展后

```
PersistentScene（常驻，DontDestroyOnLoad）
├── AudioManager
├── SaveManager
├── CurrencySystem
└── ServiceLocator（广告/IAP/排行榜）

ContentScenes（可切换）
├── MenuScene（主菜单）
├── LevelSelectScene（关卡选择）
├── GameScene（游戏，通用容器）
├── ShopScene（商店）
├── UpgradeScene（炮台升级树）
└── ResultScene（结算）

PanelStack（弹窗，叠加在 ContentScene 上）
├── SettingsPanel
├── PausePanel
├── TowerInfoPanel
├── RevivePanel（广告复活）
└── RewardPanel（结算奖励）
```

### 8.3 UI 管理器

```csharp
public class UIManager : MonoBehaviour {
    private Stack<UIPanel> _panelStack;
    
    public void OpenPanel<T>() where T : UIPanel;
    public void CloseTopPanel();
    public void CloseAllPanels();
}
```

---

## 九、实施节奏

| 阶段 | 时间 | 扩展内容 |
|------|------|---------|
| MVP（当前） | Week 1-10 | 1 地图 / 3 塔 / 3 敌人 / 30 波 / 微信验证 |
| V1.1 | +2 周 | 多货币 + 存档修正 + 激励视频广告 |
| V1.2 | +3 周 | 3 张新地图 + 关卡选择 + 星级评价 |
| V1.3 | +3 周 | 3 种新塔 + 2 种新敌人（组件化验证） |
| V1.4 | +2 周 | 主界面升级树 + 商店 + 成就 |
| V2.0 | +4 周 | 2.5D 增强（3D 模型炮塔/敌人） |
| V3.0 | 远期 | 全 3D + 更多关卡 + 赛季系统 |

**关键原则**：每个版本都是可发布的完整产品，不存在"半成品"状态。

---

*本文档随项目演进持续更新。每个扩展阶段开始前，需在此文档中补充详细设计。*
