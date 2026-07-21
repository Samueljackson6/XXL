# 微信小游戏官方知识库

> 基于 [微信小游戏开发指南](https://developers.weixin.qq.com/minigame/dev/guide/) 1:1 归档
> 抓取日期：2026-07-21
> 来源：developers.weixin.qq.com/minigame/dev/guide/

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

*知识库基于官方文档自动归档，完整原始文件保存在 `scripts/docs/wechat-official/` 目录*
