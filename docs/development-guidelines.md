# 开发指引与规范

> 本项目所有 Agent（Claude Code、Codex、未来代理）必须阅读并遵守本文档。
> 违反本文档中的禁止项将导致代码不可在微信小游戏环境中运行。

---

## 一、引擎与平台约束

### 1.1 引擎选择

- **当前引擎**：Cocos Creator 3.8.8（TypeScript + Components）
- **不支持**：Unity、Phaser 3（无官方微信适配）
- **渲染接口**：WebGL 1.0（Cocos Creator 默认）
- **代码分包**：Cocos Creator 内置分包支持，首包目标 < 4MB
- **引擎运行时**：已内置微信客户端，无额外 WASM 成本

### 1.2 微信小游戏硬性限制

| 限制 | 值 | 说明 |
|------|-----|------|
| 首包大小 | < 4MB（目标 < 2MB） | 不含引擎运行时（已内置） |
| 首资源包 | ≤ 20MB | 可放包内或 CDN |
| RAM | < 256MB | 含引擎 + 游戏资源 |
| 字体 | ≤ 4MB | 中文精简字体 |
| 存储（Storage） | 10MB | `wx.setStorageSync` |
| 文件系统 | 200MB（可申请 1GB） | 与资源缓存共用 |
| 网络 | HTTPS + WebSocket + TCP/UDP | HTTP 用 `XMLHttpRequest` |

### 1.3 禁止项（硬性）

- ❌ `document.*` 或 `window.*`（微信环境无 DOM）
- ❌ 浏览器专用 API（localStorage 除外，需提供微信 fallback）
- ❌ 需要原生插件的第三方库（需在 WebGL/IL2CPP 下验证）
- ❌ 在 `Resources/` 目录下放运行时资源（会打包进首包）
- ❌ 多线程（`Worker`、`SharedArrayBuffer`）
- ❌ `System.Threading`、`Task.Run()`、`new Thread()`（WebGL 不支持真正的多线程）

> **注意**：`async/await`（单线程异步）在 WebGL 中完全可用，**不在禁止之列**。

### 1.4 必须项

- ✅ 使用 `EventTouch` 处理触摸事件
- ✅ 使用 `IPointerClickHandler` 处理点击
- ✅ 使用 `Graphics` 组件做动态绘制
- ✅ 使用 `Sprite` 组件显示精灵
- ✅ 使用 `Label` 组件显示文本
- ✅ 使用 `wx.setStorageSync` 做存档（编辑器 fallback 用 localStorage）
- ✅ 使用 Web Audio API 做音效
- ✅ **自动化优先**：所有构建、测试、部署步骤必须有脚本等价方案
- ✅ **AI Agent 验收门禁**：每次任务完成后必须通过——构建成功 + 单元测试通过 + 首包 < 4MB

### 1.5 架构原则（防止后期推倒重做）

- ✅ **数据驱动**：所有游戏数值从 `GameConfig.ts` 读取，无魔法数字
- ✅ **逻辑与渲染分离**：纯 TypeScript 系统类（Grid, Economy, Path）不引用渲染 API，Component 只做"数据→视觉"翻译
- ✅ **组件化实体**：塔/敌人/投射物通过 Component 类实现，通过 Node 组合
- ✅ **服务接口化**：存档/IAP/广告通过接口抽象，编辑器用 Mock，微信用真实实现
- ✅ **多关卡抽象**：地图/路径/波次通过 `GameConfig.ts` 和配置系统定义
- ✅ **多货币系统**：经济系统支持多种货币类型，不硬编码单一金币

---

## 二、代码规范

### 2.1 TypeScript 规范

```typescript
// 类：PascalCase
// 方法：camelCase
// 私有字段：_camelCase
// 常量：UPPER_SNAKE_CASE
// 接口：IPascalCase（I 前缀）

strict: true  // TypeScript 严格模式必须开启
experimentalDecorators: true  // Cocos Creator @ccclass 需要
```

- 使用 `readonly` 标记不变字段
- 使用 `async/await` 替代回调
- 事件使用自定义事件系统或回调接口
- 禁止 `@ts-ignore` 除非有注释说明原因

### 2.2 Cocos Creator 最佳实践

- **Component**：只做协调和渲染，逻辑委托给纯 TypeScript 系统类
- **Node**：作为容器和组织单元，通过 `addChild` 建立层级
- **Graphics**：动态绘制网格、路径、预览、范围圈
- **Sprite**：显示精灵，通过 `color` 属性做 tint
- **Label**：显示文本，通过 `string` 属性更新
- **EventTouch**：处理触摸事件，通过 `getUILocation()` 获取坐标
- **UITransform**：控制节点尺寸，通过 `setContentSize(w, h)` 设置

### 2.3 微信适配层

- 所有微信 API 调用集中在 `Adapters/` 目录
- 使用条件编译隔离平台代码：
  ```typescript
  if (typeof wx !== 'undefined') {
    // 微信环境
    wx.setStorageSync(key, value);
  } else {
    // 编辑器环境
    localStorage.setItem(key, JSON.stringify(value));
  }
  ```
- 编辑器环境必须提供模拟实现，确保可测试

---

## 三、构建与部署

### 3.1 Cocos Creator 构建流程

```bash
# 步骤 1：Cocos Creator 构建到微信小游戏
# 方式 A：编辑器菜单（项目 → 构建发布 → 微信小游戏）
# 方式 B：命令行构建
cocoscreator --project . --build "platform=wechatgame"

# 步骤 2：打开微信开发者工具
cli.bat auto --project <导出路径>/build/wechatgame --auto-port 5000 --trust-project

# 步骤 3：触发编译
mp.send('IDE.compile')

# 步骤 4：预览/测试
mp.send('ide.preview')
```

### 3.2 关键规则

- **DevTools 不关闭**：启动一次后，后续部署仅执行 `IDE.compile`，不关闭重开
- **授权插件**：首次使用需在 MP 后台「快适配能力」开通
- **分包策略**：首包 < 4MB，剩余资源分包加载
- **资源 CDN**：大资源部署到 CDN，配置安全域名白名单

### 3.3 自动化脚本

- `scripts/deploy-wechat.mjs` — 完整部署流程
- `scripts/build-cocos.mjs` — Cocos Creator 构建封装

---

## 四、微信平台常见错误规避

### 4.1 构建阶段

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 首包过大 | 资源未分包 | 启用 Cocos Creator 分包策略 |
| 微信 API 报错 | 未授权快适配 | MP 后台开通快适配能力 |
| 黑屏 | 资源路径错误 | 检查构建配置中的资源路径 |

### 4.2 运行时阶段

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 触摸无响应 | EventTouch 未绑定 | 检查 `setupInput()` 是否正确添加了 EventTouch |
| 资源加载失败 | CDN 未配置 | 配置 MP 后台安全域名白名单 |
| 存档丢失 | 用户删除小游戏 | 使用云端存储（推荐） |

### 4.3 性能规避

- ❌ 首场景 onLoad 中不要做重逻辑
- ❌ 动态创建过多 Node（使用对象池）
- ❌ 单个 Sprite 纹理 > 1024×1024
- ❌ 大量 Graphics 绘制（每帧 clear + redraw 昂贵）
- ❌ 频繁 `node.destroy()` + `new Node()`（使用对象池）
- ✅ 使用 Graphics 绘制静态元素（网格、路径）
- ✅ 使用 Sprite 显示动态精灵
- ✅ 使用对象池管理投射物、敌人
- ✅ 纹理压缩后上传 CDN

---

## 五、美术资源自动化管线

### 5.1 AI 生成管线

```
ComfyUI → LoRA + IP-Adapter + ControlNet → 精灵图 → TexturePacker → 纹理图集
```

- **工具栈**：ComfyUI（SD1.5 / SDXL）+ LoRA + IP-Adapter + ControlNet
- **输出**：PNG-8 精灵图（单帧 < 4KB）
- **打包**：TexturePacker 生成纹理图集（.atlas + .png）
- **尺寸限制**：单纹理 ≤ 1024×1024，总图集 ≤ 2048×2048
- **格式**：PNG-8 带 Alpha，微信小游戏环境兼容

### 5.2 用户职责

- 审查 AI 生成的精灵图质量
- 确认风格一致性
- 提供视觉反馈给 ComfyUI 工作流调整

### 5.3 命名约定

```
assets/
  textures/
    towers/
      arrow_L1.png
      arrow_L2.png
      arrow_L3.png
      cannon_L1.png
      cannon_L2.png
      cannon_L3.png
      frost_L1.png
      frost_L2.png
      frost_L3.png
    enemies/
      basic.png
      fast.png
      tank.png
    projectiles/
      arrow.png
      cannon.png
      frost.png
    ui/
      button_start.png
      icon_gold.png
```

---

## 六、测试规范

### 6.1 Node.js 测试

- 使用 Vitest 测试纯逻辑模块（Grid, Economy, Path, WaveManager 数学）
- `cc` 模块通过 vitest alias 映射到 `tests/unit/mocks/cc.ts`
- 只测试不含 Cocos Component 的纯类

### 6.2 编辑器测试

- 在 Cocos Creator 编辑器内测试 Component 行为
- 微信 API 调用通过接口抽象，编辑器环境提供 Mock

### 6.3 微信环境验证

- 微信开发者工具模拟器验证
- 真机预览验证（扫码）
- 性能数据：使用微信开发者工具性能面板

---

## 七、版本控制与协作

### 7.1 Git 规范

- `main`：稳定分支，始终可构建
- `feat/xxx`：功能分支
- `fix/xxx`：Bug 修复
- Commit 格式：`type(scope): description`
  - type: feat, fix, refactor, chore, docs, test, art
  - scope: gameplay, ui, audio, build, wechat, etc.

### 7.2 微信云托管

- 微信云托管（wxcloudrun）仅用于**服务端**（排行榜、存档、后端 API）
- 前端构建产物通过 DevTools CLI 上传
- CI/CD 可配置自动触发构建 → 部署

---

## 八、AI Agent 执行规则

### 8.1 所有 Agent 必读

Agent 在开始任何工作前，必须按顺序阅读：

1. `docs/development-guidelines.md`（本文档）
2. `docs/wechat-official-knowledge-base.md`
3. `docs/game-design-doc-v2.0.md`

### 8.2 Agent 禁止行为

- 在游戏代码中使用 `document` / `window`
- 修改构建配置导致首包 > 4MB
- 引入非 WebGL 兼容的第三方库
- 修改 `docs/development-guidelines.md` 中的禁止项规则

### 8.3 Agent 必须行为

- 所有数值从 `GameConfig.ts` 读取
- UI 使用 Cocos Creator 组件（Node + Label + Graphics）
- 触摸事件使用 `EventTouch`
- 存档使用微信 Storage API（编辑器 fallback 用 localStorage）
- 音频使用 Web Audio API
- 每个功能完成后更新 `docs/development-roadmap.md` 的任务状态

### 8.4 美术资源

- Agent 可调用 ComfyUI 生成精灵图
- 输出格式：PNG-8，尺寸 32×32 / 64×64
- 打包为纹理图集后引用
- 用户审查通过后入库
