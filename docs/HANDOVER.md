# XXL 塔防项目 — 交接文档

> 最后更新：2026-07-23
> 项目路径：`D:\Tare-workspace\Game\WeChat Game\XXL`

---

## 一、项目概述

微信小游戏竖屏塔防，使用**团结引擎**（Tuanjie Engine v1.9.3，内部版本 2022.3.62t11）。规划为 2.5D→3D 可扩展架构，支持多关卡、多货币、广告/IAP、升级树等长期功能。开发模式以 AI + 自动化为主力。

---

## 二、当前完成状态

### 已完成 ✅

| 项目 | 状态 | 说明 |
|------|------|------|
| 团结引擎安装 | ✅ | `G:\Game tools\TuanjieEngine\2022.3.62t11\Editor\Tuanjie.exe` |
| Unity 工程初始化 | ✅ | ProjectSettings、Packages、Assets 目录结构完整 |
| C# 代码编译 | ✅ | 26 个 .cs 文件全部通过编译（零错误） |
| 4 个场景创建 | ✅ | BootScene / MenuScene / GameScene / GameOverScene |
| 核心游戏循环代码 | ✅ | PathSystem / GridSystem / ProjectileController / TowerPlacementController |
| 组件化实体架构 | ✅ | AbilityTypes / TowerData / EnemyData / TowerController / EnemyController |
| 自动化基础设施 | ✅ | AssetFactory / PrefabFactory / SceneBuilder / BuildScript / TestRunnerBatch |
| 多关卡架构 | ✅ | LevelData SO / CurrencySystem / GameManager / ServiceLocator / UIManager |
| Unity-MCP 集成 | ✅ | v0.86.1，38 个工具可用（需 Editor 运行） |
| WX-WASM-SDK 安装 | ✅ | `com.qq.weixin.minigame v0.1.1`（通过 Gitee git URL） |
| MiniGame 构建 | ✅ | BuildTarget=47，产物在 `Build/MiniGame/`（Brotli 压缩） |
| 微信开发者工具导入 | ✅ | 项目已导入 DevTools（小游戏模式，AppID: wx10c928d3274d2360） |
| 设计文档体系 | ✅ | 6 份文档（设计/规范/路线图/迁移/环境/扩展架构） |
| 美术素材 | ✅ | 8 张 GPT 生成素材（3 塔双状态 + 3 投射物 + 完整地图），在 `pix/stock photos/` |
| 微信凭证 | ✅ | 存储在 `.wechat-config.json`（已 gitignore） |

### 当前阻塞 ❌

**WX-WASM-SDK 转换导出无法执行**

- SDK 包已安装（`com.qq.weixin.minigame v0.1.1`），文件在 `Library/PackageCache/com.qq.weixin.minigame@ed4ad28f43/`
- `WXConvertCore.cs` 文件存在（命名空间 `WeChatWASM`），但 Roslyn 动态编译和反射均无法加载该程序集
- 原因：SDK 的 Editor 程序集未被 Unity-MCP 的 Roslyn 编译器引用，反射搜索 `AppDomain.CurrentDomain.GetAssemblies()` 也找不到（可能是延迟加载）
- **解决方向**：
  1. 在 Unity Editor GUI 中手动操作：菜单 → 微信小游戏 → 转换小游戏（SDK 安装后应出现此菜单）
  2. 写一个 Editor 脚本（.cs 文件放到 Assets/Scripts/Editor/），通过 `[MenuItem]` 触发 `WeChatWASM.WXConvertCore.DoExport()`，然后用 batchmode 执行
  3. 检查 SDK 是否需要先在 Editor 中初始化配置（WXEditorWindow 面板）

### 待优化 ⚠️

| 项目 | 当前值 | 目标 | 方法 |
|------|--------|------|------|
| MiniGame 首包 | 4.8MB（WASM 4.8MB） | < 4MB | 将 Managed Stripping / IL2CPP Size 设置应用到 MiniGame 平台（当前只设了 WebGL） |
| 微信运行时 | 黑屏 | 正常渲染 | 需要 SDK 转换生成正确的 game.js + adapter |

---

## 三、关键文件路径

### 引擎与工具

| 工具 | 路径 |
|------|------|
| 团结引擎 | `G:\Game tools\TuanjieEngine\2022.3.62t11\Editor\Tuanjie.exe` |
| Tuanjie Hub | `G:\Game tools\TuanjieEngine\Tuanjie Hub\` |
| 微信开发者工具 CLI | `D:\DevCache\微信web开发者工具\cli.bat` |
| Node.js | 系统 PATH |

### 项目结构

```
D:\Tare-workspace\Game\WeChat Game\XXL\
├── Assets/
│   ├── Scripts/
│   │   ├── Core/          — GameManager, ServiceLocator, TowerPlacementController, AbilityTypes, IPoolable
│   │   ├── Data/          — TowerData, EnemyData, LevelData, EconomyConfig (ScriptableObjects)
│   │   ├── Editor/        — AssetFactory, PrefabFactory, SceneBuilder, BuildScript, TestRunnerBatch
│   │   ├── Entities/      — TowerController, EnemyController, ProjectileController
│   │   ├── Systems/       — PathSystemImpl, GridSystem, WaveManager, EconomySystem, CurrencySystem, ObjectPool, AbilityResolver, SaveSystem
│   │   └── UI/            — UIManager, UIPanel
│   ├── Scenes/            — BootScene, MenuScene, GameScene, GameOverScene (.unity)
│   ├── ScriptableObjects/ — (待创建 SO 实例)
│   └── Prefabs/           — (待创建预制体)
├── Build/
│   ├── MiniGame/          — MiniGame 构建产物（.br 压缩）
│   └── WebGL/             — 早期 WebGL 构建产物（.gz 压缩）
├── Library/
│   └── PackageCache/
│       ├── com.qq.weixin.minigame@ed4ad28f43/  — WX-WASM-SDK
│       └── com.ivanmurzak.unity.mcp@0.86.1/    — Unity-MCP
├── Packages/manifest.json — 包管理（含 SDK git URL + OpenUPM）
├── ProjectSettings/       — 项目设置
├── minigame/              — 微信小游戏项目（DevTools 打开此目录）
│   ├── game.js            — 入口（当前为简化版，需 SDK 转换替换）
│   ├── game.json
│   ├── project.config.json
│   ├── weapp-adapter.js   — 简化版适配器（不完整）
│   └── Build/             — 构建产物副本
├── pix/stock photos/      — GPT 生成的美术素材（8 张）
├── scripts/               — Node.js 自动化脚本
│   ├── build-unity.mjs
│   ├── check-bundle-size.mjs
│   ├── deploy-wechat.mjs
│   └── restart-devtools.mjs
├── docs/                  — 项目文档
│   ├── game-design-doc-v2.0.md
│   ├── development-guidelines.md
│   ├── development-roadmap.md
│   ├── engine-migration-plan.md
│   ├── extension-architecture.md
│   ├── dev-environment.md
│   ├── wechat-official-knowledge-base.md
│   └── review-material.md
├── .wechat-config.json    — 微信凭证（gitignore）
├── CLAUDE.md              — AI Agent 工作手册
└── temp-wx-sdk*.zip       — 下载失败的临时文件（可删除）
```

---

## 四、构建命令参考

```bash
# 编译验证（batchmode）
"G:/Game tools/TuanjieEngine/2022.3.62t11/Editor/Tuanjie.exe" \
  -batchmode -nographics \
  -projectPath "D:/Tare-workspace/Game/WeChat Game/XXL" \
  -logFile build/compile.log -quit

# 创建场景
"G:/Game tools/TuanjieEngine/2022.3.62t11/Editor/Tuanjie.exe" \
  -batchmode -nographics \
  -projectPath "D:/Tare-workspace/Game/WeChat Game/XXL" \
  -executeMethod "XXL.Editor.SceneBuilder.BuildAllScenes" \
  -logFile build/scenes.log -quit

# MiniGame 构建（BuildTarget=47）
"G:/Game tools/TuanjieEngine/2022.3.62t11/Editor/Tuanjie.exe" \
  -batchmode -nographics \
  -projectPath "D:/Tare-workspace/Game/WeChat Game/XXL" \
  -executeMethod "XXL.Editor.BuildScript.PerformBuild" \
  -logFile build/minigame.log -quit

# 打开微信开发者工具
"D:/DevCache/微信web开发者工具/cli.bat" auto \
  --project "D:/Tare-workspace/Game/WeChat Game/XXL/minigame" \
  --auto-port 5000 --trust-project

# 包体检查
node scripts/check-bundle-size.mjs Build/MiniGame
```

---

## 五、下一步计划（按优先级）

### P0：解除阻塞 — SDK 转换导出

1. **打开 Unity Editor**（双击 Tuanjie.exe 或从 Hub 启动）
2. **检查菜单栏**是否出现"微信小游戏"菜单（SDK 安装后应自动出现）
3. 如果有菜单：点击"微信小游戏 → 转换小游戏"，配置导出路径，执行转换
4. 如果没有菜单：
   - 在 `Assets/Scripts/Editor/` 下创建 `WXExportMenuItem.cs`：
     ```csharp
     using UnityEditor;
     using WeChatWASM;
     public class WXExportMenuItem {
         [MenuItem("XXL/导出微信小游戏")]
         static void Export() {
             WXConvertCore.Init();
             WXConvertCore.DoExport();
         }
     }
     ```
   - 等 Unity 编译完成后，菜单 XXL → 导出微信小游戏
   - 或用 batchmode：`-executeMethod "WXExportMenuItem.Export"`
5. 转换成功后，将产物复制到 `minigame/` 目录，替换当前的简化版 game.js
6. 在 DevTools 中刷新验证

### P1：包体优化（4.8MB → <4MB）

在 `ProjectSettings/ProjectSettings.asset` 中为 MiniGame 平台设置：
```yaml
scriptingBackend:
  MiniGame: 1        # IL2CPP
il2cppCompilerConfiguration:
  MiniGame: 2        # Master（Size 优化）
il2cppCodeGeneration:
  MiniGame: 1        # Size
managedStrippingLevel:
  MiniGame: 3        # High
```
重新构建验证。

### P2：核心游戏循环可视化

当前逻辑代码已完成但无视觉呈现。需要：
1. 用 AssetFactory 创建 3 种塔 + 3 种敌人的 ScriptableObject 实例
2. 用 PrefabFactory 创建预制体（导入 `pix/stock photos/` 素材作为 Sprite）
3. 在 GameScene 中搭建 Tilemap 地图（参考素材中的完整地图）
4. 连接 GameManager → 敌人沿路径移动 → 塔射击 → 投射物飞行 → 命中反馈
5. 实现 UI（HUD、塔选择栏、塔信息面板）

### P3：微信功能集成

- 存档（WX SDK Storage）
- 音频（Unity AudioSource → WebAudio 自动适配）
- 触摸输入优化
- 广告/IAP 接口（已预留 IAdService / IPurchaseService）

### P4：内容扩展

- 多关卡（LevelData SO 已支持）
- 新塔/新敌人（组件化 Ability 系统已支持）
- 主界面升级树
- 排行榜（微信开放数据域）

---

## 六、已知问题与注意事项

1. **项目路径含空格**（`WeChat Game`）：Unity-MCP 警告可能影响 AI Game Developer 插件，建议未来迁移到无空格路径
2. **GitHub 仓库 `minigame-unity-webgl-transform` 已被封禁**（商标政策），团结引擎用的是另一个仓库 `minigame-tuanjie-transform-sdk`
3. **命令行无法访问 GitHub/Gitee**（连接被重置/403），但 PowerShell 的 `Invoke-WebRequest` 走系统代理可以下载
4. **Unity-MCP 的 script-execute 无法引用 SDK 程序集**（Roslyn 编译上下文限制），需要写 Editor 脚本文件而非动态代码
5. **MCP 对长操作（>2分钟）会超时**，构建类操作必须用 batchmode
6. **BuildScript 当前输出到 `Build/MiniGame/`**，首包检查逻辑已修正为只统计 WASM+JS（不含 .data）
7. **微信凭证**在 `.wechat-config.json`（已 gitignore），AppID: `wx10c928d3274d2360`

---

## 七、文档索引

| 文档 | 用途 |
|------|------|
| `CLAUDE.md` | AI Agent 工作手册（原则/约束/命令/架构） |
| `docs/game-design-doc-v2.0.md` | 游戏设计规范（数值/机制/UI/技术架构） |
| `docs/development-guidelines.md` | 开发规范（禁止项/必须项/代码规范/构建流程） |
| `docs/development-roadmap.md` | 开发路线图（Phase 0-4，48 个任务） |
| `docs/extension-architecture.md` | 扩展架构（组件化/多关卡/多货币/商业化） |
| `docs/dev-environment.md` | 环境配置（引擎/工具/路径/命令模板） |
| `docs/engine-migration-plan.md` | Phaser→Unity 迁移方案 |
| `docs/wechat-official-knowledge-base.md` | 微信官方知识库（CLI/限制/适配） |

---

*本文档供接手人员使用。如有疑问，项目所有设计决策和技术细节均可在上述文档中找到。*
