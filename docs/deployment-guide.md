# XXL Tower Defense — 自动化部署完整指南

> **版本**: v1.0 (2026-07-24) | **状态**: 部署管道可运行（IDE 启动 + 文件校验已通，wsEndpoint 连接待完善）

---

## 目录

1. [架构概览](#1-架构概览)
2. [端到端流程](#2-端到端流程)
3. [脚本说明](#3-脚本说明)
4. [前置条件](#4-前置条件)
5. [快速开始](#5-快速开始)
6. [故障排查](#6-故障排查)
7. [Unity 编辑器预测试](#7-unity-编辑器预测试)
8. [已知限制](#8-已知限制)

---

## 1. 架构概览

```
┌─────────────┐     Unity Batchmode      ┌──────────┐
│  Unity 编辑器 │ ──── WebGL Build ──────→ │ minigame/│
│  (团结引擎)   │                          └────┬─────┘
└─────────────────┐                           │
                  │                           │ deploy-auto.cjs
                  │                           │ (文件校验 + IDE 启动)
                  │                           ▼
                  │                    ┌──────────────┐
                  │                    │ 微信开发者工具  │
                  │                    │ (自动启动 + 编译)│
                  │                    └──────────────┘
```

### 五步管道

| 步骤 | 名称 | 说明 |
|------|------|------|
| 1 | 文件校验与修补 | 验证 minigame/ 文件完整性，同步 `.framework/`，注入 `game-init.js` |
| 2 | IDE 启动与连接 | 通过 `cli.bat` 启动微信开发者工具，等待 HTTP 就绪，连接 wsEndpoint |
| 3 | 触发编译 | 通过 CDP 或 Windows UI Automation 发送 Ctrl+B |
| 4 | 运行时监控 | 监听 DevTools console，捕获 JS 错误/异常 |
| 5 | 报告 | 输出部署结果摘要 |

---

## 2. 端到端流程

### 2.1 Unity Batchmode 构建（WebGL）

```bash
pnpm unity:build
```

- 输出目录：`minigame/`
- 产物：`game.json`、`game.js`、`framework/`、`weapp-adapter.js`、`unity-namespace.js`
- 构建完成后 `minigame/` 即为微信小游戏的完整项目目录

### 2.2 自动部署

```bash
node scripts/deploy-auto.cjs
```

### 2.3 手动调试（可选）

如果需要手动打开 DevTools：

```bash
"D:\DevCache\微信web开发者工具\微信开发者工具.exe" --project minigame/ --appid wx10c928d3274d2360 --auto-port 5000
```

---

## 3. 脚本说明

### `scripts/deploy-auto.cjs` — 主管道

**步骤详解：**

#### Step 1: verifyAndPatchFiles()

验证必需文件是否存在：
- `game.json` — 游戏配置
- `game.js` — 入口脚本
- `weapp-adapter.js` — 微信环境适配
- `unity-namespace.js` — Unity 命名空间
- `framework/MiniGame.loader.js` — 加载器
- `framework/MiniGame.framework.js.br` — 引擎代码（压缩）
- `framework/MiniGame.wasm.br` — WASM 二进制（压缩）

自动修复：
1. 创建 `.framework/` 目录并镜像 `framework/` 内容（微信小游戏从 dot 前缀路径加载）
2. 创建 `game-init.js` 预初始化 shim（polyfill `navigator`/`window`/`canvas`）
3. 在 `game.js` 头部注入 `import './game-init'`（确保全局对象在引擎初始化前就绪）

#### Step 2: launchAndConnect()

启动微信开发者工具并连接自动化 API：

```
shell:true + cli.bat → IDE 启动
     ↓
probeHttp(127.0.0.1, 5000) → 等待 HTTP 就绪（~3s）
     ↓
等待 20s（wsEndpoint 初始化）
     ↓
launcher.connect({ wsEndpoint: 'ws://127.0.0.1:9996' })
```

**关键发现**（来自诊断脚本）：
- `cli.bat` 必须用 `shell:true` 才能在 Windows 上执行（Node.js spawn 默认无法执行 .bat）
- wsEndpoint 端口（9996）与 HTTP 端口（5000）不同
- `miniprogram-automator` 的 `launcher.launch()` 内部 spawn 不传 `shell:true`，无法在 Windows 运行

#### Step 3: triggerCompilation()

触发编译的优先级：
1. **CDP 发送** — 通过 `mp.getNewCDPSession()` 发送键盘事件
2. **Windows UI Automation** — 通过 PowerShell + `SendKeys` 模拟 Ctrl+B

#### Step 4: monitorConsole()

监听 DevTools 的 console 输出，过滤错误：
- `TypeError`、`SyntaxError`、`ReferenceError`、`Error`
- 初始化成功标志：出现 `game.*init|unity|loaded|ready|MiniGame|compile` 关键词且无错误

### 辅助诊断脚本

| 脚本 | 用途 |
|------|------|
| `scripts/diagnose-ws.cjs` | 扫描 IDE 的 wsEndpoint 端口 |
| `scripts/diagnose-ws2.cjs` | 全端口扫描 + launcher.connect 测试 |
| `scripts/diagnose-v2.cjs` | 复现 v2.0 连接方法 |

---

## 4. 前置条件

### 软件依赖

| 组件 | 版本/路径 | 说明 |
|------|-----------|------|
| 团结引擎 | `G:\Game tools\TuanjieEngine\2022.3.62t11\Editor\Tuanjie.exe` | Unity 2022.3.62t11 + WebGL Build Support + Mini Game Build Support |
| 微信开发者工具 | `D:\DevCache\微信web开发者工具\` | 本地稳定版 |
| Node.js | v20+ | 运行部署脚本 |
| pnpm | 最新 | 包管理 |

### 目录结构确认

```
D:\DevCache\微信web开发者工具\
├── cli.bat          # DevTools CLI（必需）
├── cli.js           # CLI JS 入口（可选，备用）
├── node.exe         # DevTools 自带 Node.js（备用）
└── nw.exe           # 浏览器内核（IDE 运行时）
```

### 环境变量

无需特殊环境变量。脚本使用绝对路径定位 DevTools 安装目录。

---

## 5. 快速开始

### 一键部署（完整流程）

```bash
# 1. Unity Batchmode 构建
pnpm unity:build

# 2. 自动部署
node scripts/deploy-auto.cjs
```

### 预期输出

```
╔════════════════════════════════════════════╗
║  XXL Tower Defense — WeChat MiniGame      ║
║  Auto-Deploy Pipeline v4.0                ║
╚════════════════════════════════════════════╝

[0.0s] [1/5] Verifying and patching minigame files...
[0.0s]   OK: .framework/ in sync
[0.0s]   OK: game.js already has game-init import
[0.0s] All files verified and patched.

[0.1s] [2/5] Launching DevTools and connecting...
[3.1s]   IDE HTTP ready (3.0s)
[23.1s]   Connecting via launcher.connect() ws://127.0.0.1:9996...
[24.0s]   OK: Connected on ws://127.0.0.1:9996
[24.5s]   DevTools v1.09.2502180

[24.5s] [3/5] Triggering compilation...
[25.0s]   OK: Ctrl+B sent via CDP
[25.0s] Compilation triggered.

[55.0s] [4/5] Monitoring runtime console...
[65.0s]   Game initialized! (65.0s)

  ┌─────────────────────────────────────────────┐
  │   XXL Tower Defense — Deployment Report     │
  │  Status:  SUCCESS ✓                          │
  │  Time:    65.0s                              │
  │  AppID:   wx10c928d3274d2360                │
  │  Errors:  0                                  │
  └─────────────────────────────────────────────┘
```

---

## 6. 故障排查

### IDE 启动但端口未就绪

```
[10s]   IDE HTTP not ready
```

**原因**：DevTools 首次启动较慢，或 cli.bat 参数有问题。

**解决**：
1. 确认 DevTools 安装路径正确
2. 检查端口 5000 是否被占用：`netstat -ano | findstr :5000`
3. 增加等待时间（修改 `AUTO_PORT` 超时循环）

### wsEndpoint 连接失败

```
ws:9996 failed: connect ECONNREFUSED
Scanning all ports for ws endpoint...
```

**当前状态**：端口 9996 的 ws 连接待验证。如果扫描也无法找到 ws 端点：

**临时解决方案**：
1. 手动打开 DevTools（脚本已启动 IDE）
2. 在 IDE 中手动按 Ctrl+B 编译
3. 观察控制台输出

### 编译未触发

```
Could not trigger compilation automatically.
```

**解决**：
1. 确保 DevTools 窗口可见（最小化状态可能无法接收键盘事件）
2. 手动按 Ctrl+B 触发编译

### 文件修补失败

```
ERROR: Missing: framework/MiniGame.wasm.br
```

**原因**：Unity 构建未完成或输出目录不对。

**解决**：重新运行 Unity batchmode 构建。

---

## 7. Unity 编辑器预测试

在部署到微信开发者工具之前，应在 Unity 编辑器中进行功能验证。

### 预测试清单

| 类别 | 测试项 | 验证方法 |
|------|--------|----------|
| **基础渲染** | 场景加载、网格显示 | Play Mode，观察 Game View |
| **游戏逻辑** | 敌人沿路径移动 | Play Mode，观察敌人行为 |
| **塔防机制** | 塔放置、攻击、升级 | Play Mode，点击放置塔 |
| **经济系统** | 击杀奖励、塔费用扣除 | Play Mode，观察金钱变化 |
| **波次系统** | 波次递进、难度曲线 | Play Mode，观察波次提示 |
| **UI 交互** | HUD、面板、按钮 | Play Mode，触摸/点击 UI |
| **音频** | 背景音乐、音效 | Play Mode，确认 AudioSource 播放 |
| **性能** | FPS、内存、GC | Profiler Window |

### 自动化测试

项目使用 Vitest 进行纯逻辑单元测试：

```bash
# 运行所有测试
pnpm test

# 监听模式（开发时）
pnpm test:watch
```

**注意**：Unity C# 代码的自动化测试需在 Unity Editor 中运行（EditMode / PlayMode Tests），当前阶段以手动测试为主。

### 构建前检查清单

部署前在 Unity Editor 中确认：

- [ ] 场景无编译错误（Console Window 干净）
- [ ] 所有 ScriptableObject 数据已配置（塔类型、敌人类型、波次）
- [ ] WebGL 平台已选中（File → Build Settings）
- [ ] Player Settings 中 Company Name / Product Name 已设置
- [ ] 无 `#if UNITY_EDITOR` 导致的运行时逻辑差异

---

## 8. 已知限制

### wsEndpoint 连接（进行中）

**问题**：`launcher.connect()` 在 Windows 上的 wsEndpoint 端口发现不稳定。

**影响**：步骤 2 的连接可能超时，但 IDE 已成功启动。

**临时规避**：手动在 DevTools 中按 Ctrl+B 编译。

**解决方向**：
- 使用 `diagnose-ws2.cjs` 的全端口扫描方法
- 或研究 DevTools CLI 的 `--auto-port` 输出格式

### WebGL 包体大小

**问题**：当前首包约 143MB，严重超过微信小游戏 4MB 限制。

**解决**：
1. 纹理压缩为 ASTC（团结引擎 WebGL 设置）
2. 启用代码拆分（Brotli 压缩）
3. 使用 Addressables 进行资源分帧加载
4. 纹理图集化（所有精灵合并为 ≤ 100KB 的图集）

### IL2CPP 限制

WebGL 使用 IL2CPP 后端，不支持：
- `System.Threading`、`Task.Run()`、`new Thread()`
- `async/await` 的单线程异步是安全的

---

## 附录 A：脚本快速参考

```bash
# 诊断 wsEndpoint 端口
node scripts/diagnose-ws.cjs

# 全端口扫描
node scripts/diagnose-ws2.cjs

# 复现 v2.0 连接方法
node scripts/diagnose-v2.cjs

# 主部署管道
node scripts/deploy-auto.cjs

# 单元测试
pnpm test

# Unity 构建
pnpm unity:build
```

## 附录 B：关键路径

| 路径 | 说明 |
|------|------|
| `minigame/` | Unity WebGL 输出 + 微信小游戏项目根目录 |
| `minigame/game-init.js` | 预初始化 shim（自动创建） |
| `minigame/.framework/` | 引擎文件镜像目录（自动同步） |
| `scripts/deploy-auto.cjs` | 主部署管道 |
| `docs/deployment-guide.md` | 本文档 |
