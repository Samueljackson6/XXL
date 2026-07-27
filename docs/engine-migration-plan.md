# 引擎迁移方案 — Phaser 3 → Unity 团结引擎

> 目标：将现有 Phaser 3 + TypeScript 项目迁移至 Unity 团结引擎 + C#，
> 获得官方微信适配、2.5D/3D 能力、完整 AI 自动化管线。

## 迁移概览

```
Phase 0：项目初始化（Unity 工程搭建）
Phase 1：核心系统迁移（纯 C# 逻辑）
Phase 2：Unity 渲染与 UI（视觉还原）
Phase 3：微信适配与部署
Phase 4：AI 美术管线 + 性能优化
```

## Phase 0：项目初始化

### 0.1 环境准备

- [ ] 安装团结引擎（要求：支持 Unity 2018-2022 API，IL2CPP 后端）
- [ ] 安装微信小游戏适配插件（WX-WASM-SDK）
- [ ] 安装微信开发者工具（稳定版）
- [ ] 配置 ComfyUI + LoRA + IP-Adapter（AI 美术管线）
- [ ] 安装 TexturePacker（纹理图集打包）

### 0.2 Unity 工程创建

- [ ] 新建 2D 项目（URP 可选）
- [ ] 导入 WX-WASM-SDK 插件
- [ ] 配置 Build Settings：
  - Target: WebGL
  - Scripting Backend: IL2CPP
  - Managed Stripping Level: High
  - Compression: None（转换插件自动处理）
  - WebGL 1.0（非 2.0）
- [ ] 创建项目目录结构：
  ```
  Assets/
    ScriptableObjects/Data/    — 配置数据
    Scripts/Core/              — 核心系统
    Scripts/Entities/          — 游戏实体
    Scripts/Systems/           — 游戏系统
    Scripts/UI/                — Unity UI
    Scripts/Adapters/          — 平台适配
    Scripts/Audio/             — 音频
    Scenes/                    — 场景
    Resources/Sprites/         — 程序化精灵图
    StreamingAssets/           — 配置后备
  ```

### 0.3 工具链配置

- [ ] 配置 Addressables（资源按需加载）
- [ ] 配置 TexturePacker 导出脚本（自动生成图集）
- [ ] 配置 ComfyUI 工作流（塔/敌人/投射物精灵图生成）
- [ ] 创建 Unity batchmode 构建脚本：
  ```csharp
  // BuildScript.cs
  public static void PerformBuild() {
      var scenes = new[] { "Assets/Scenes/Boot.unity", "Assets/Scenes/Game.unity" };
      BuildPipeline.BuildPlayer(scenes, "Build/WebGL", BuildTarget.WebGL, BuildOptions.None);
  }
  ```
- [ ] 配置微信转换插件自动化调用（`WXEditorWindow.DoExport()`）

## Phase 1：核心系统迁移

### 1.1 配置数据迁移

从 `src/utils/config.ts` 迁移至 ScriptableObjects：

| Phaser (TS) | Unity (C#) |
|------------|-----------|
| `TOWER_TYPES` | `TowerTypeData` ScriptableObject |
| `ENEMY_TYPES` | `EnemyTypeData` ScriptableObject |
| `ECONOMY_CONFIG` | `EconomyConfig` ScriptableObject |
| `WAVE_CONFIG` | `WaveConfig` ScriptableObject |
| `PATH_POINTS` | `PathData` ScriptableObject |

创建基类：
```csharp
public abstract class GameData : ScriptableObject {
    public string id;
    public string displayName;
}

[CreateAssetMenu(menuName = "Game/TowerType")]
public class TowerTypeData : GameData {
    public int cost;
    public int damage;
    public float range;
    public float fireRate;
    public float projectileSpeed;
    public float aoeRadius;
    public SlowEffect slowEffect;
    public Color color;
    public Sprite icon;
}

[CreateAssetMenu(menuName = "Game/EnemyType")]
public class EnemyTypeData : GameData {
    public int hp;
    public float speed;
    public int reward;
    public float hitRadius;
    public Color color;
    public Sprite sprite;
}

[CreateAssetMenu(menuName = "Game/WaveConfig")]
public class WaveConfig : ScriptableObject {
    public int totalWaves = 30;
    public float prepareTime = 15f;
    public float intermissionTime = 5f;
    public WaveEntry[] waves;
}

[Serializable]
public class WaveEntry {
    public int basicCount;
    public int fastCount;
    public int tankCount;
    public float hpScale;
}
```

### 1.2 纯逻辑系统迁移

这些系统从 Phaser 的 `systems/` 迁移为纯 C# 类（不继承 MonoBehaviour）：

| Phaser 系统 | Unity 系统 | 说明 |
|------------|-----------|------|
| `Grid` | `GridSystem` | 地图数据、可放置检测 |
| `Path` | `PathSystem` | 路径点、距离→位置映射 |
| `WaveManager` | `WaveManager` | 波次生成、状态机 |
| `Economy` | `EconomySystem` | 金币/生命值、存档 |
| `Pathfinding` | `PathfindingService` | 敌人路径跟随 |

核心逻辑可以直接移植（算法不变），只需替换类型系统：
```csharp
// Phaser (TS)
export class Grid {
  readonly occupied: boolean[][] = [];
  isPlaceable(col: number, row: number): boolean { ... }
}

// Unity (C#)
public class GridSystem {
    private readonly bool[,] _occupied;
    public bool IsPlaceable(int col, int row) { ... }
}
```

### 1.3 游戏实体迁移

| Phaser 实体 | Unity 实现 | 说明 |
|------------|-----------|------|
| `Tower` (Container) | `TowerController` (MonoBehaviour) + `TowerData` | 预制体 + 数据驱动 |
| `Enemy` (Container) | `EnemyController` (MonoBehaviour) + `EnemyData` | 预制体 + 状态机 |
| `Projectile` (Container) | `ProjectileController` (MonoBehaviour) | 对象池管理 |
| `FloatingText` | `FloatingTextController` | 对象池管理 |

### 1.4 游戏循环

```csharp
// GameManager.cs — 单例协调器
public class GameManager : MonoBehaviour {
    [SerializeField] private GridSystem _grid;
    [SerializeField] private WaveManager _waveManager;
    [SerializeField] private EconomySystem _economy;
    [SerializeField] private TowerSelectBar _towerSelectBar;

    private void Update() {
        // 最小化 Update：仅轮询输入和状态机
        _waveManager.Update(Time.deltaTime);
    }
}
```

### 1.5 状态机

```csharp
public enum GameState {
    Idle,
    Prepare,    // 15s 倒计时
    Fighting,   // 战斗中
    Intermission, // 5s 间隙
    Victory,
    GameOver
}

public class GameStateMachine : MonoBehaviour {
    public GameState CurrentState { get; private set; }
    
    public void TransitionTo(GameState newState) {
        // 状态切换逻辑
    }
}
```

## Phase 2：Unity 渲染与 UI

### 2.1 视觉资源

| 资源 | 生成方式 | 说明 |
|------|---------|------|
| 塔精灵图 | ComfyUI + LoRA | 32×32 / 64×64，3级外观 |
| 敌人精灵图 | ComfyUI + LoRA | 32×32，3种类型 |
| 投射物 | ComfyUI | 16×16 箭头/炮弹/冰弹 |
| 地图纹理 | TexturePacker | 草地棋盘格 + 路径 |
| UI 图标 | ComfyUI | 塔选择图标、按钮 |

### 2.2 渲染管线

- 使用 URP 2D Renderer（或内置 2D）
- 纹理图集：TexturePacker 生成，Addressables 加载
- 相机：Orthographic，Size = 350（适配 400×700）
- 渲染层次：通过 Sorting Order 控制（替代 Phaser 的 setDepth）

### 2.3 UI 系统

所有 UI 使用 Unity UI (uGUI) Canvas：

| Phaser UI | Unity UI |
|-----------|---------|
| `HUD` | `HUDController`（Canvas + Text） |
| `TowerSelectBar` | `TowerSelectBar`（ScrollView 或横向 Layout） |
| `TowerInfoPanel` | `TowerInfoPanel`（Popup Panel） |
| `FloatingText` | `FloatingText`（World Space Canvas） |

- 触摸事件：`IPointerClickHandler` / `EventTrigger`
- 热区：所有按钮最小 44×44px
- 字体：Arial / 系统无衬线字体

### 2.4 2.5D 增强

- 炮塔旋转：使用 Unity Transform.Rotate 面向目标
- 投射物轨迹：AddForce 或手动插值
- 爆炸粒子：ParticleSystem 2D
- 冰霜减速：Material.PropertyBlock 修改颜色

## Phase 3：微信适配与部署

### 3.1 微信 API 集成

```csharp
// Adapters/WXStorage.cs
public static class WXStorage {
    public static void SetSync(string key, string value) {
        #if UNITY_WEBGL && !UNITY_EDITOR
            WXSDK.SetSync(key, value);
        #else
            PlayerPrefs.SetString(key, value);
        #endif
    }
    
    public static string GetSync(string key) {
        #if UNITY_WEBGL && !UNITY_EDITOR
            return WXSDK.GetSync(key);
        #else
            return PlayerPrefs.GetString(key, "");
        #endif
    }
}
```

### 3.2 部署脚本

```javascript
// scripts/deploy-wechat.mjs
// 1. 调用 Unity batchmode 构建 WebGL
// 2. 调用 WXEditorWindow.DoExport() 转换
// 3. 打开 DevTools（auto --project --auto-port 5000 --trust-project）
// 4. 等待 WebSocket 连接
// 5. 发送 IDE.compile
// 6. 截图验证
```

### 3.3 验证清单

- [ ] 开发者工具模拟器正常启动
- [ ] 真机预览无黑屏
- [ ] 触摸交互正常
- [ ] 音频正常播放
- [ ] 存档功能正常
- [ ] 首包大小 < 4MB
- [ ] 内存使用 < 256MB
- [ ] 帧率稳定 30fps+（中低端机）

## Phase 4：AI 美术管线 + 性能优化

### 4.1 ComfyUI 工作流

- 塔精灵图：LoRA + ControlNet（边缘检测）+ IP-Adapter（风格一致）
- 敌人精灵图：LoRA + 文本提示词 + 背景移除
- 批量生成 → TexturePacker 打包 → Addressables 导入

### 4.2 性能优化

- [ ] 代码分包（WASM 分包）
- [ ] 纹理压缩（PVRTC / ETC2）
- [ ] 对象池（投射物、粒子、浮动文字）
- [ ] 空间哈希碰撞检测
- [ ] 首场景精简
- [ ] iOS 高性能模式
- [ ] Perfdog 真机分析

## 数据迁移对照表

| Phaser 模块 | Unity 模块 | 复杂度 | 说明 |
|------------|-----------|--------|------|
| `config.ts` | ScriptableObjects | 低 | 直接映射 |
| `Grid` | `GridSystem` | 低 | 纯逻辑，直接移植 |
| `Path` | `PathSystem` | 低 | 纯逻辑，直接移植 |
| `WaveManager` | `WaveManager` | 中 | 状态机需重写为 C# |
| `Economy` | `EconomySystem` | 低 | 纯逻辑 + 存储适配 |
| `Tower` | `TowerController` | 中 | MonoBehaviour + 预制体 |
| `Enemy` | `EnemyController` | 中 | MonoBehaviour + 预制体 |
| `Projectile` | `ProjectileController` | 中 | MonoBehaviour + 对象池 |
| `HUD` | `HUDController` | 中 | Unity UI 重写 |
| `TowerSelectBar` | `TowerSelectBar` | 中 | Unity UI 重写 |
| `TowerInfoPanel` | `TowerInfoPanel` | 中 | Unity UI 重写 |
| `FloatingText` | `FloatingText` | 低 | World Space Canvas |
| `GameScene` | `GameScene` + `GameManager` | 高 | 场景编排 |
| `AudioManager` | `AudioManager` | 低 | Unity AudioSource |

## 迁移后的优势

| 方面 | Phaser 3 | Unity 团结引擎 |
|------|---------|---------------|
| 微信适配 | 无官方支持，需自行适配 | 官方转换插件 + C# SDK |
| 2.5D/3D | 不支持 | 完整 3D 能力 |
| AI 自动化 | 无成熟案例 | batchmode + DoExport 全自动化 |
| 美术管线 | 需手动精灵图 | ComfyUI + LoRA + 自动打包 |
| 构建速度 | 快（TS 编译） | 较慢（IL2CPP 编译） |
| 包体 | < 2MB | 首包 < 4MB（WASM 特性） |
| 社区案例 | 塔防案例少 | 无尽冬日、地铁跑酷等大量案例 |
