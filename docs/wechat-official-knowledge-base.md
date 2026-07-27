# 微信小游戏官方知识库

> 基于 [微信小游戏开发指南](https://developers.weixin.qq.com/minigame/dev/guide/) 1:1 归档 + Unity 适配专题研究
> 抓取日期：2026-07-23
> 来源：微信官方文档 + 团结引擎官方文档 + Unity WebGL 文档 + MCP 文档 + 开发者工具 CLI 文档
> Markdown 版本：`docs-md/` 目录（113 个 .md 文件，由 `scripts/convert-html-to-md.mjs` 生成）

---

## 附录 A：微信开发者工具 CLI 文档（2026-07-22 实测）

来源：https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html

### A.1 安装位置

- Windows: `C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat`（默认）或自定义路径
- 本项目实际路径: `D:/DevCache/微信web开发者工具/cli.bat`
- 内含 Node.js v18: `D:/DevCache/微信web开发者工具/node.exe`

### A.2 CLI 命令

| 命令 | 说明 |
|------|------|
| `open <project>` | 打开项目（自动打开 IDE） |
| `open <project> --trust-project` | 打开项目并信任（绕过 AppID 验证） |
| `auto` | 启用自动化（开启 WebSocket 服务） |
| `auto --project <path>` | 启用自动化并打开指定项目 |
| `auto --project <path> --auto-port <port>` | 指定 WebSocket 端口 |
| `auto --project <path> --trust-project` | 自动化 + 信任项目 |
| `auto-preview` | 自动预览（需要 AppID） |
| `preview` | 预览（需要有效 AppID） |
| `upload` | 上传（需要有效 AppID） |
| `close` | 关闭项目 |
| `quit` | 退出 IDE |
| `login` | 重新登录 |
| `islogin` | 检查登录状态 |

### A.3 关键参数

- `--project <path>`: 项目路径（与 `--appid` 互斥，提供 project 时忽略 appid）
- `--appid <appid>`: 小程序 AppID（3rd 平台也支持）
- `--ext-appid <appid>`: 第三方平台开发的小程序 AppID
- `--port <port>`: IDE HTTP 服务器端口（IDE 已运行时需先 quit 再指定）
- `--auto-port <port>`: 自动化 WebSocket 端口
- `--trust-project`: 信任项目（绕过安全验证）
- `--ticket <ticket>`: 使用测试票据
- `--debug`: 开启调试模式
- `--lang <zh|en>`: 界面语言

### A.4 端口体系（实测验证）

```
.cli 文件: "3800---IDE---35956" 或仅 "3800"
  - 第一部分: 自动化 WebSocket 端口（默认 3800）
  - ---IDE--- 分隔符后的部分: IDE HTTP 服务器端口（每次重启变化）

.ide 文件: "35956"
  - IDE HTTP 服务器端口（仅 HTTP API，无 WebSocket）

自动化 WebSocket 端口: 用 --auto-port 指定，默认 3800
IDE HTTP 服务器端口: 从 .ide 文件读取，或通过 --port 指定
```

### A.5 自动化连接流程（已通过验证）

1. **启动 IDE + 打开项目 + 启用自动化**：
   ```bash
   cli.bat auto --project <项目路径> --auto-port 5000 --trust-project
   ```
   这会同时打开 IDE、加载项目、开启 WebSocket 服务

2. **WebSocket 连接**：
   ```javascript
   const { default: Automator } = require('miniprogram-automator');
   const auto = new Automator();
   const mp = await auto.connect({ wsEndpoint: 'ws://127.0.0.1:5000' });
   ```

3. **验证连接**：
   ```javascript
   const info = await mp.send('Tool.getInfo');
   // { version: "2.01.2510290", SDKVersion: "3.17.0" }
   ```

### A.6 miniprogram-automator API

```javascript
const automator = require('miniprogram-automator');

// 连接已运行的自动化实例
const mp = await automator.connect({ wsEndpoint: 'ws://127.0.0.1:5000' });

// 页面操作
await mp.pageStack();          // 获取页面栈
await mp.currentPage();        // 获取当前页面
await mp.navigateTo('/pages/index/index');
await mp.redirectTo('/pages/game/index');
await mp.navigateBack();
await mp.reLaunch('/pages/index/index');
await mp.switchTab('pages/tab/index');

// 小程序能力
await mp.systemInfo();         // 系统信息
await mp.callWxMethod('getSystemInfoSync');
await mp.evaluate(() => console.log('hello'));
await mp.screenshot({ path: '/path/to/screenshot.png' });

// 工具方法
await mp.send('Tool.getInfo');
await mp.send('IDE.compile');  // 触发编译
await mp.close();              // 退出小程序
```

### A.7 注意事项

- `touristappid` 在 `preview` 和 `upload` 命令中无效，需要真实的 AppID
- `auto --project <path>` 需要 `--trust-project` 才能正常加载项目（绕过安全验证）
- `automator.launcher.launch()` 方法可用，但需要正确传入 cliPath
- CLI v2 中 `--auto-port` 参数用于指定自动化 WebSocket 端口
- IDE HTTP 端口和自动化端口是独立的两个服务

### A.8 Mini Game 项目配置要求

- `project.config.json` 中 `compileType` 必须为 `"game"`（不是 `"miniprogram"`）
- 项目根目录需要 `game.json`（不是 `app.json`）
- `game.js` 必须位于项目根目录（Vite 构建输出到 `dist/game.js`，需要复制）

### A.9 常见问题

| 问题 | 解决方案 |
|------|----------|
| `project.config.json 不存在` | 确保 JSON 格式正确，无 trailing comma |
| `AppID invalid` | 使用 `--trust-project` 绕过 |
| `Failed connecting to ws://...` | 确保 DevTools 以 `auto` 模式启动，`--auto-port` 正确 |
| `cliPath not correctly specified` | 使用 `.bat` 文件（Windows），不要用 `.exe` |
| `spawn EINVAL` | `.bat` 文件不能直接 spawn，需要 `shell: true` |

---

## 一、平台与引擎的关系

微信小游戏平台是一个**引擎无关**的运行环境。平台本身不绑定任何特定游戏引擎，而是提供底层的渲染（WebGL/WebGL2/Metal）、音频（WebAudio/InnerAudio）、网络（HTTP/WebSocket/TCP/UDP）、文件系统等基础能力。

游戏引擎通过**适配层（Adapter）**对接这些底层能力，使得引擎编译或导出的游戏产物能够在微信小游戏环境中运行。

## 二、为什么需要引擎适配

不同游戏引擎有各自的编译产物形式和运行时依赖：
- HTML5 引擎（Cocos Creator、Laya、Egret）：编译产物为 JS 代码，运行时依赖浏览器的 BOM 和 DOM API
- 原生引擎（Unity、团结引擎）：编译产物为机器码/中间码，通过 WebAssembly 运行

**小游戏环境并非浏览器**，没有 `document`、`window` 等全局对象，提供的是 `wx` API。

### 核心示例

```javascript
// ❌ 浏览器中正常，小游戏中报错
let canvas = document.createElement('canvas');
let audio = document.createElement('audio');
console.log(window.innerWidth);

// ✅ 小游戏中的写法
let canvas = wx.createCanvas();
let audio = wx.createInnerAudioContext();
let { screenWidth } = wx.getSystemInfoSync();
```

## 三、适配方式

### 3.1 JavaScript 引擎适配

两种方式：
1. **引擎官方适配**：在构建工具中内置微信小游戏导出选项（Cocos Creator、LayaAir、Egret 已完成）
2. **Adapter 适配层**：在引擎和游戏代码之间引入一层 Adapter，通过 wx API 模拟 window、document 等浏览器对象

> Adapter 是**用户代码**，不是基础库的一部分。

### 3.2 WebAssembly 引擎适配

原生引擎（Unity、团结引擎、Cocos2d-x、UE）通过 Emscripten 编译为 Wasm 模块 + JS 胶水代码。

## 四、官方适配方案矩阵

| 引擎 | 适配方式 | 适配状态 | 说明 |
|------|---------|---------|------|
| Cocos Creator | 引擎官方内置适配 | ✅ 已支持 | 官方文档：https://docs.cocos.com/creator/manual/zh/editor/publish/publish-wechatgame.html |
| LayaAir | 引擎官方内置适配 | ✅ 已支持 | 官方文档：https://layaair.com/3.x/doc/released/miniGame/wechat/readme.html |
| Egret | 引擎官方内置适配 | ✅ 已支持 | 官方文档：https://www.egret.uk/egretengine2d/ |
| Unity/团结引擎 | WebAssembly 转换适配 | ✅ 已支持 | 转换插件 + C# SDK |
| Cocos2d-x | WebAssembly 通用适配 | ✅ 已支持 | 通用引擎适配方案 |
| Unreal Engine | WebAssembly 通用适配 | ✅ 已支持 | 通用引擎适配方案 |
| **Phaser** | **无官方支持** | ⚠️ **需自行适配** | 引入通用 Adapter 尝试运行 |

> Phaser 不在官方支持的引擎列表中。官方建议：对于其他 HTML5 游戏引擎，"先引入通用的 Adapter 尝试运行，再把遇到的问题逐个解决"。

## 五、小游戏能力地图

### 渲染
- `wx.createCanvas()` — 创建画布
- `wx.createPath2D()` — 创建路径
- Canvas 2D API、WebGL API
- `WebGLRenderingContext.wxBindCanvasTexture` — Canvas 纹理绑定
- `requestAnimationFrame` / `cancelAnimationFrame`

### 音频
- `wx.createWebAudioContext()` — Web Audio API
- `wx.createInnerAudioContext()` — 内部音频
- `wx.createMediaAudioPlayer()` — 媒体音频播放器
- AudioBuffer、BufferSourceNode 等完整 Web Audio 节点支持

### 输入
- `wx.onTouchStart/Move/End/Cancel` — 触摸事件
- `wx.onMouseUp/Down/Move` — 鼠标事件（PC）
- `wx.onWheel` — 滚轮
- 游戏手柄支持

### 网络
- `wx.request` — HTTPS 请求
- `wx.downloadFile` / `wx.uploadFile`
- `wx.connectSocket` — WebSocket
- `wx.createTCPSocket` — TCP
- `wx.createUDPSocket` — UDP

### 存储
- `wx.setStorageSync` / `wx.getStorageSync` — 本地缓存
- 文件系统 API（FileSystemManager）
- 存储上限：10MB（storage）/ 200MB（文件系统，可申请 1GB）

### 游戏服务
- `wx.getGameServerManager` — 帧同步/房间/匹配
- 开放数据域（排行榜、关系链）
- 虚拟支付
- 广告（Banner、插屏、激励视频）

### 其他
- Worker 多线程
- 分包加载
- 性能监控（`wx.getPerformance`）
- AI 推理（通用推理引擎）
- 视觉算法（VK 系列）

## 六、包体与性能限制

- 主包 + 分包总大小限制（具体以微信后台为准）
- 首资源包可放在包内（总上限 20MB）
- RAM < 256MB
- WebGL 1.0 正式支持，WebGL 2.0 Beta
- 启动速度直接影响用户留存

## 七、Unity 适配方案的参考信息

### 性能评估标准

| 优化项 | 建议 |
|--------|------|
| 启动速度 | 精简首场景，尽快渲染首画面 |
| 资源按需加载 | 单个包体不超过 2MB，并发不超过 20 |
| 纹理 | maxsize ≤ 1024，不生成 Mipmap，不使用可写属性 |
| 字体 | 压缩前不超过 4MB |
| 内存 | 不初始化未使用资源，释放不使用资源 |
| 音频 | 尽可能强制单声道 |

### 适用游戏类型（塔防在列）

> "考虑到游戏体积与逻辑复杂度，目前建议中轻度 2D/3D 游戏进行转换，游戏类目包括：休闲：消除，答题，模拟经营，**塔防**，益智等"

---

## 附录 B：Unity 适配专题（2026-07-22 研究）

> 来源：微信官方文档 + 本地抓取归档
> 归档文件：`scripts/docs/wechat-official/unity-*.txt`

### B.1 兼容性评估结论

| 评估项 | 结论 | 说明 |
|--------|------|------|
| **游戏类型** | 塔防 ✅ | 官方明确列为推荐转换类型 |
| **引擎版本** | 团结引擎 + Unity 2018-2022 ✅ | 宽泛兼容 |
| **渲染接口** | WebGL 1.0 ✅ | 2.0 处于 Beta |
| **渲染管线** | URP 支持 ✅ | 部分 shader 需注意兼容性 |
| **Scripting Backend** | IL2CPP ✅ | 团结引擎必须 |
| **资源加载** | Addressable / AssetBundle ✅ | 官方推荐 |
| **音频** | Unity AudioSource ✅ | 转换插件已适配 WebAudio |
| **网络** | UnityWebRequest / WebSocket ✅ | 原生 Socket 不支持 |
| **存储** | WX SDK Storage ✅ | 10MB / 200MB |
| **多线程** | ❌ 不支持 | 需删除，用异步替代 |
| **文件 API** | ❌ System.IO.File 不支持 | 用 WX SDK 文件 API |
| **Lua** | 标准 Lua ✅ | Luajit 不支持 |
| **第三方插件** | 大部分 C# 插件 ✅ | 平台相关 C 插件需验证 |
| **FMOD** | ❌ 不支持 | 仅 Unity AudioSource |
| **Wwise** | ❌ 不支持 | — |

### B.2 转换流程（5 阶段）

```
【阶段一】兼容性评估 → 确认技术方案
【阶段二】项目转换 → 可体验的 WebGL / 小游戏项目
【阶段三】平台能力接入 → 微信 API（登录、设备、广告）
【阶段四】体验调优 → 启动速度、资源加载、性能
【阶段五】发布上线 → 审核、监控、运维
```

### B.3 转换工具脚本集成

```csharp
// 方式 1：Unity Editor 菜单
// 微信小游戏 → 转换小游戏 → 填写参数 → 生成并转换

// 方式 2：脚本调用（CI/CD 用）
var win = new WXEditorWindow();
win.DoExport();

// 方式 3：WXConvertCore 底层 API
if (WXConvertCore.DoExport() == WXConvertCore.WXExportError.SUCCEED) {
    Debug.Log("转换成功");
}
```

### B.4 资源按需加载策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| **首包内** | 总上限 20MB | 核心资源（首屏必需） |
| **CDN 下载** | Brotli/gzip 压缩 | 大型资源（纹理图集） |
| **预下载** | 网络空闲时下载 | 非关键但预计需要的资源 |
| **Addressables** | 按需异步加载 | 所有运行时资源 |

### B.5 常见错误规避

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `MONO_WASM: Failed to load config file ./blazor.boot.json` | 团结引擎 Mono 后端 | 设置 Scripting Backend 为 IL2CPP |
| Shader 编译报错（CoreBlit） | WebGL 2.0 URP shader | 使用 WebGL 1.0 或升级 URP |
| 中文字体不显示 | 中文字体未打包 | 自定义字体放入首包或 AssetBundle，≤ 4MB |
| 资源下载失败 | CDN 未配置或安全域名未加 | 配置 MP 后台安全域名白名单 |
| PlayerPref 失效 | 用户删除小游戏 | 使用云端存储（推荐） |
| 订阅消息失败 | 不在 Touch 回调中调用 | 手动监听 OnTouch，在回调内调用 |
| 多点触控丢失 | Touch 事件处理 | 附加 WXTouchInputOverride.cs 到 EventSystem |
| Android 卡首屏 | 安全域名 / 跨域 / SSL | 检查 CDN 证书和域名配置 |
| iOS 性能差 | 未开启高性能模式 | 申请 iOS 高性能+ 模式 |
| 插件未授权 | 未开通快适配 | MP 后台 → 能力地图 → 生产提效包 → 快适配 |
| 代码分包提示"首次拉取" | 收集函数不完备 | 更新分包工具，重新生成 |
| `game.json 未找到` | 打开导出的 minigame 子目录 | 不是导出根目录 |

### B.6 性能优化总览

| 优化项 | 建议 | 优先级 |
|--------|------|--------|
| 首场景精简 | 尽快渲染首画面 | P0 |
| CDN 压缩 | Brotli / gzip | P0 |
| 代码分包 | WASM 分包工具 | P0 |
| 资源按需加载 | Addressables | P0 |
| 纹理 maxsize | ≤ 1024 | P1 |
| 不生成 Mipmap | 小游戏环境不需要 | P1 |
| 纹理不可写 | 减少内存 | P1 |
| 强制单声道 | 音频资源 | P1 |
| 不初始化未用资源 | 按需初始化 | P1 |
| 释放不资源 | 及时 Unload | P2 |
| iOS 高性能模式 | 申请开通 | P2 |
| 限制帧率 | 中低端机 | P2 |

### B.7 展示案例（已转换为微信小游戏的 Unity 游戏）

| 游戏 | 品类 | 说明 |
|------|------|------|
| 无尽冬日 | SLG | 探索冻土，重建家园 |
| 地铁跑酷 | 3D 跑酷 | 超好玩的 3D 跑酷 |
| 我叫 MT2 | 3D MMORPG | 精美 3D 手游 |
| 大侠不哭 | 武侠 | 剑走天涯 |
| 守护球球 | 休闲 | 塔防类 |
| 巨兽战场 | 3D SLG | 恐龙自由捕捉 |
| 小小蚁国 | 模拟经营 | 建立地下王国 |
| 翡翠大师 | 模拟经营 | 翡翠原石选石 |

### B.8 微信云托管（服务端）

微信云托管（wxcloudrun）是**服务端**能力，提供：
- Git 集成（GitHub / GitLab）
- CI/CD 流水线
- 容器部署
- 运维（版本管理、灰度发布、监控）

**适用场景**：排行榜、用户数据、游戏进度存档的云端托管。

**注意**：前端构建仍需本地或 CI 完成，产物通过 DevTools CLI 上传。云托管与前端构建是**互补关系**，非替代关系。

### B.9 转换后目录结构

```
导出路径/
├── minigame/           ← 微信小游戏项目（用开发者工具打开此目录）
│   ├── game.js
│   ├── game.json
│   ├── project.config.json
│   └── ...
└── webgl/              ← Unity WebGL 导出资源
    ├── Build/
    ├── StreamingAssets/
    └── ...
```

---

## 附录 C：Unity vs Phaser 对比

| 维度 | Phaser 3 | Unity 团结引擎 |
|------|---------|---------------|
| 微信适配 | 无官方支持 | 官方转换插件 + C# SDK |
| 2.5D/3D 能力 | 无 | 完整 3D 能力 |
| AI 自动化 | 无成熟案例 | batchmode + DoExport 全自动化 |
| 美术管线 | 需手动精灵图 | ComfyUI + LoRA + 自动打包 |
| 构建速度 | 快（TS 编译） | 较慢（IL2CPP 编译） |
| 包体 | < 2MB | 首包 ~2.8MB（WASM 特性） |
| 社区案例 | 塔防少 | 大量案例（无尽冬日等） |
| 编辑器 | 代码驱动 | Scene 驱动 + Inspector |
| 调试 | 浏览器 DevTools | Unity Profiler + 微信 DevTools |
| 长期维护 | 风险（非官方支持） | 稳定（官方支持） |

---

*知识库持续更新，原始文件保存在 `scripts/docs/wechat-official/` 目录*
