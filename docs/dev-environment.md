# 开发环境与工具链配置

> 本文档记录所有开发工具的安装路径、版本、配置方式，供跨团队协作和 AI Agent 使用。
> 最后更新：2026-07-23

---

## 一、团结引擎（Tuanjie Engine）

| 项目 | 值 |
|------|-----|
| 版本 | v1.9.3（内部版本号 2022.3.62t11） |
| 安装路径 | `G:\Game tools\TuanjieEngine\2022.3.62t11\Editor\Tuanjie.exe` |
| Hub 路径 | `G:\Game tools\TuanjieEngine\Tuanjie Hub\` |
| Hub 版本 | 1.4.4 |
| 已安装模块 | Editor、WebGL Build Support、Documentation、Mini Game Build Support |
| Scripting Backend | IL2CPP（WebGL 平台必须） |
| Managed Stripping | High（WebGL 平台） |
| IL2CPP 配置 | Master + Size 优化 |

### batchmode 命令模板

```bash
# 编译验证（打开项目、编译脚本、退出）
"G:/Game tools/TuanjieEngine/2022.3.62t11/Editor/Tuanjie.exe" \
  -batchmode -nographics \
  -projectPath "D:/Tare-workspace/Game/WeChat Game/XXL" \
  -logFile build/unity-compile.log -quit

# 创建场景
"G:/Game tools/TuanjieEngine/2022.3.62t11/Editor/Tuanjie.exe" \
  -batchmode -nographics \
  -projectPath "D:/Tare-workspace/Game/WeChat Game/XXL" \
  -executeMethod "XXL.Editor.SceneBuilder.BuildAllScenes" \
  -logFile build/unity-scenes.log -quit

# WebGL 构建
"G:/Game tools/TuanjieEngine/2022.3.62t11/Editor/Tuanjie.exe" \
  -batchmode -nographics \
  -projectPath "D:/Tare-workspace/Game/WeChat Game/XXL" \
  -executeMethod "XXL.Editor.BuildScript.PerformBuild" \
  -logFile build/unity-build.log -quit
```

---

## 二、Unity-MCP（AI 编辑器集成）

| 项目 | 值 |
|------|-----|
| 插件版本 | 0.86.1 |
| 包名 | `com.ivanmurzak.unity.mcp` |
| 安装方式 | OpenUPM（`unity-mcp-cli install-plugin <项目路径>`） |
| 缓存位置 | `Library/PackageCache/com.ivanmurzak.unity.mcp@0.86.1/` |
| MCP 传输协议 | HTTP（Cloud 模式） |
| MCP 服务 URL | `https://ai-game.dev/mcp/p/1ebf403f` |
| 可用工具数 | 38/73（~36.1K tokens） |
| 面板入口 | Unity 菜单 → Window → AI Game Developer |

### MCP 连接配置（QoderWork / Claude Desktop）

```json
{
  "ai-game-developer": {
    "type": "http",
    "url": "https://ai-game.dev/mcp/p/1ebf403f"
  }
}
```

### 首次使用注意

1. Unity Editor 必须处于打开状态（MCP 服务运行在 Editor 进程内）
2. 首次使用需在 AI Game Developer 面板点击 "Authorize" 完成云端授权
3. 授权码每次重启 Editor 可能变化，需重新确认
4. 如需本地模式（无需云端），切换面板中的 "Custom" 模式

### 可用 MCP 工具类别

- 资产管理（创建/修改/删除 Asset）
- 场景管理（创建/加载/保存 Scene）
- GameObject 操作（创建/修改/查询）
- 组件操作（添加/修改/删除 Component）
- 脚本管理（创建/编辑 C# 脚本）
- 编辑器控制（Play Mode、菜单操作）
- 控制台日志读取
- Profiler 和截图

---

## 三、微信开发者工具

| 项目 | 值 |
|------|-----|
| 版本 | Stable 2.01.2510290 |
| CLI 路径 | `D:/DevCache/微信web开发者工具/cli.bat` |
| 自动化端口 | 5000（`--auto-port 5000`） |
| 项目路径 | `D:/Tare-workspace/Game/WeChat Game/XXL/minigame` |
| AppID | 见 `.wechat-config.json`（已 gitignore） |

### DevTools 自动化命令

```bash
# 打开项目 + 启用自动化
"D:/DevCache/微信web开发者工具/cli.bat" auto \
  --project "D:/Tare-workspace/Game/WeChat Game/XXL/minigame" \
  --auto-port 5000 --trust-project

# 触发编译（通过 WebSocket）
# 需先连接 ws://127.0.0.1:5000
mp.send('IDE.compile')
```

---

## 四、WX-WASM-SDK（微信转换插件）

| 项目 | 值 |
|------|-----|
| 状态 | **待安装**（Gitee git 拉取失败，需手动导入） |
| 包名 | `com.qq.weixin.minigame` |
| 来源 | `https://gitee.com/wechat-minigame/minigame-tuanjie-transform-sdk.git` |
| 备选来源 | Tuanjie Hub → 小游戏中心 → 安装转换插件 |
| 功能 | Unity WebGL → 微信小游戏格式转换（DoExport） |

### 安装方式（三选一）

1. **Tuanjie Hub GUI**：Hub → 小游戏中心 → 找到转换插件 → 安装到项目
2. **UPM Git URL**：manifest.json 添加 `"com.qq.weixin.minigame": "<git-url>"`（需网络通畅）
3. **手动导入**：下载 .unitypackage → Unity 菜单 Assets → Import Package

### 使用方式

```csharp
// 方式 1：Editor 菜单
// 微信小游戏 → 转换小游戏 → 填写参数 → 生成并转换

// 方式 2：脚本调用（CI/CD）
var win = new WXEditorWindow();
win.DoExport();

// 方式 3：底层 API
if (WXConvertCore.DoExport() == WXConvertCore.WXExportError.SUCCEED) {
    Debug.Log("转换成功");
}
```

---

## 五、Node.js 工具链

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | v18+ | 构建脚本运行环境 |
| unity-mcp-cli | latest | Unity-MCP 插件安装 |
| miniprogram-automator | — | DevTools 自动化 |

### 项目脚本

```bash
node scripts/build-unity.mjs       # Unity batchmode 构建封装
node scripts/check-bundle-size.mjs # 包体大小检查
node scripts/deploy-wechat.mjs     # 完整部署流程
```

---

## 六、构建产物与包体

| 指标 | 当前值 | 限制 |
|------|--------|------|
| 首包（WASM+JS） | 3.8MB | < 4MB ✅ |
| 资源（.data） | 1.1MB | ≤ 20MB（CDN） |
| 总计 | 4.79MB | — |
| 构建耗时 | ~317s | — |

### 优化配置（已应用）

- Managed Stripping Level: High
- IL2CPP Compiler Configuration: Master
- IL2CPP Code Generation: Size
- Strip Engine Code: true
- 包精简：49 → 13 个（移除全部 3D/VR/XR/视频/广告模块）

---

## 七、项目路径总览

```
D:\Tare-workspace\Game\WeChat Game\XXL\     ← 项目根目录
├── Assets/Scripts/                          ← C# 游戏代码（26 个文件）
├── Assets/Scenes/                           ← 4 个 Unity 场景
├── Assets/ScriptableObjects/                ← 数据配置
├── Assets/Prefabs/                          ← 预制体
├── Build/WebGL/                             ← WebGL 构建产物
├── Library/                                 ← Unity 缓存（不提交）
├── Packages/manifest.json                   ← 包管理
├── ProjectSettings/                         ← 项目设置
├── minigame/                                ← 微信小游戏项目（DevTools 打开此目录）
├── scripts/                                 ← Node.js 自动化脚本
├── docs/                                    ← 项目文档
├── pix/stock photos/                        ← GPT 生成的美术素材
├── .wechat-config.json                      ← 微信凭证（gitignore）
└── build/                                   ← 构建日志
```

---

*本文档随环境变更持续更新。任何工具版本升级或路径变更必须同步修改此文件。*
