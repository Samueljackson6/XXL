# XXL 塔防 — 技术架构文档

> **范围**：本文档**仅描述既有** Cocos Creator 3.8.8 → 微信小游戏 的构建/代码结构，**不改任何代码**（Phase 4→5 治理回填）。
> **引擎**：Cocos Creator `3.8.8`（`package.json` `creator.version` / `project.json` `version`）
> **目标平台**：微信小游戏 `platform=wechatgame`，竖屏 `400×700`，`type=mini-game`
> **AppID**：`wx10c928d3274d2360`（`project.config.json` / `project.json` / `.wechat-config.json`）
> **入口场景**：`assets/scenes/GameScene.scene`（uuid `25a94596-80db-4c86-bba2-819aa19b4152`）
> **语言**：TypeScript 严格模式，类型来自 `@cocos/creator-types`
> **构建产物**：`build/wechatgame/wechatgame/`（**禁止手工编辑**）

---

## 1. 模块与分层（Module / Layer Map）

| 层 | 目录 | 职责 | 依赖 |
|----|------|------|------|
| 表现/协调 | `core/` | `GameBootstrap`（入口，运行时构建 GameScene 节点）、`GameScene`（协调器，onLoad 构建所有层） | Cocos 引擎 API |
| 纯逻辑 | `systems/` | `Economy`、`Grid`、`WaveManager`（无渲染依赖，可 Vitest 单测） | 无引擎渲染依赖 |
| 实体 | `entities/` | `Enemy`、`Tower`、`Projectile`、`Path`（挂到节点的 Cocos Component） | Cocos 引擎 API |
| UI | `ui/` | `HUD`、`TowerInfoPanel`、`TowerSelectBar`（Cocos 节点/组件） | Cocos 引擎 API |
| 特效 | `fx/` | `FloatingText` | Cocos 引擎 API |
| 音频 | `audio/` | `AudioManager` | Cocos 引擎 API |
| 配置 | `utils/` | `GameConfig.ts`（集中配置，零魔法数字） | 全局引用 |

**分层原则**
- 表现/协调层（`core`/`ui`/`fx`/`audio`）依赖 Cocos 引擎 API。
- 纯逻辑层（`systems`）不依赖渲染，可独立单元测试（Vitest）。
- 实体层（`entities`）是挂到节点的 Component，由 `GameScene` 统一协调。
- 配置层（`utils/GameConfig`）被全局引用，是数值的单一事实来源（`GAME_WIDTH/HEIGHT`、`TILE_SIZE`、`GRID_COLS/ROWS`、`TOWER_TYPES`、`ECONOMY_CONFIG`、`WAVE_CONFIG`、`DEPTH`）。

**零 DOM 约束**：游戏内 UI 全部用 Cocos 节点/组件实现，禁止 `document.*` / `window.*`（微信适配层除外）。

---

## 2. 运行时初始化序列（Runtime Init Sequence）

> 依据 `assets/scripts/core/GameBootstrap.ts` 与 `assets/scripts/core/GameScene.ts`。

1. **Cocos 启动** → 加载 launchScene `GameScene.scene`。场景根节点挂载 `Canvas` + `GameBootstrap` 组件。
2. **`GameBootstrap.start()`**
   - `new Node('GameScene')` → `addComponent(GameScene)` → `addChild`。
   - 设置 `Canvas` 的 `UITransform` 内容尺寸为 `GAME_WIDTH × GAME_HEIGHT`（400×700）。
3. **`GameScene.onLoad()`**（构建所有层）
   - 实例化系统：`new Grid()` / `new Path()`（读取路径点并计算 `pathLength`）/ `new Economy()` / `new WaveManager().init(this)`。
   - 创建层节点：`grid` / `path` / `preview` / `entities` → 依次 `addChild` 到本节点。
   - `drawGrid()`：`Graphics` 填充 `GRID_COLS×GRID_ROWS`（6×10）格，顶部偏移 `HUD_HEIGHT`。
   - `drawPathOverlay()`：`Graphics` 沿 `Path` 点描边（两遍：底层粗描边 + 上层细描边）。
   - `setupInput()`：`EventTouch.TOUCH_START/MOVE` 挂本节点；`input.on(TOUCH_END)`。
   - `setupTowerSelect()`：**当前为空实现**（迁移脚手架未完成，`TowerSelectBar` 尚未接入，见 §7 缺口）。
   - `startPreparePhase()`：`state='prepare'`，`prepareTimer = WAVE_CONFIG.prepareTime * 1000`。
4. **逐帧 `update(dt)`**
   - 状态机：`idle` / `prepare` / `fighting` / `intermission` / `victory` + `gameOver` 标志。
   - `prepare`：`prepareTimer` 倒计时 → `startFightingPhase()` → `waveManager.startNextWave()`。
   - 敌人循环：沿 `Path` 移动（`getPointOnPath(distanceTraveled)`）、应用减速；`distanceTraveled ≥ pathLength` → 死亡 + `onEnemyReachEnd`（扣命，命数≤0 调 `endGame()`）；通知 `waveManager.onEnemyRemoved`。
   - 防御塔循环：对每个 `canFire` 的塔，在射程内选最近敌人 → `fire()` → 生成 `Projectile` 节点（`targetNode`/`damage`/`speed`/`aoeRadius`/`slowEffect`）。
   - 子弹循环：`proj.update`；命中时结算伤害/AOE/减速；`economy.killReward` + `earn`；销毁节点。
5. **输入处理**（`onPointerDown/Move/Up`）：`prepare` 态下放置塔（`grid.canPlace` + `economy.canAfford`）；点击已有塔显示射程；`onTowerSelect` 切换 `selectedTowerType`（受 `prepare` 态限制）。

---

## 3. 构建与部署流水线（Build & Deploy Pipeline）

### 3.1 `scripts/build-cocos.mjs`（`pnpm build:cocos`）
- **预处理**：剥离 `NODE_OPTIONS` 中的 `--use-system-ca`；删除 `ELECTRON_RUN_AS_NODE`。
- **library 缓存规则**：`CI=1` 或 `CLEAN_LIBRARY=1` → `rm -rf library/`（强制引擎裁剪重新打包）。本地默认保留缓存（见 §4）。
- **调用**：`CocosCreator.exe --project <ROOT> --build configPath=<temp/wechatgame-build-config.json>`。
- **配置来源**：`buildWechatConfig()` 以 `project.json → builder.wechatgame` 为单一事实来源，叠加 `includeModules`（见 §4）；`separateEngine` 取自 `project.json`（当前 `true`，引擎拆至分包）。
- **成功判定**：Cocos CLI 可能非零退出（`collectMetricFromScene` 报 `Missing class GameBootstrap`，属无害度量步骤）→ **以产物完整性判定**（需 `game.js`/`game.json`/`project.config.json` + `src/`/`assets/`/`cocos-js/`），不以退出码判定。
- **`patchAppId`**：强制输出 `project.config.json` 的 `appid = wx10c928d3274d2360`（Cocos 可能回退到内置测试 AppID `wx6ac3f5090a6b99c5`）。
- **输出**：`build/wechatgame/wechatgame/`。

### 3.2 `scripts/deploy-wechat.mjs`（`pnpm deploy`）
- **阶段 1**：委托 `build-cocos.mjs`（spawnSync），复用 separateEngine 路径，首包 <4MB。
- **阶段 2**：`verifyOutput()`（`game.json`/`project.config.json` + `src/`/`assets/`/`cocos-js/`）。
- **`patchAppId`**（GBK 安全）：`utf-8 → latin1 → {}` 多级降级解析；**剥离 `miniprogramRoot` 并设 `gameRoot='./'`**（code-19 修复）；删除 `libVersion` / `condition.game.currentL`；`description` 收敛为纯 ASCII。
- **阶段 3 `launchDevTools()`**：`cli.bat auto --project "<buildDir>" --auto-port 5000 --trust-project`。最多 3 轮重试：每轮先杀陈旧 DevTools 整棵树（PowerShell UTF-8 BOM 处理中文进程名）+ 删除陈旧 `.ide` 端口文件（**绝不碰 `.ide-status`**）；自动应答 "Enable IDE Service (y/N)" 为 `y`；`waitForPort(5000, 150s)`。
- **阶段 4 `autoCompile()`**：`miniprogram-automator` 连接 `ws://127.0.0.1:5000`；`Tool.getInfo`；挂载 `console`/`exception` 监听；采集 5s 控制台；落盘 `tests/smoke/console_evidence/*.json+.log`；错误数超 `CONSOLE_ERROR_THRESHOLD`（默认 0）→ 退出 2；截图（8s 竞速，超时跳过）；退出 0/2。

### 3.3 `scripts/ci-full.mjs`（`pnpm ci:full`）
- **[0/4]** 仅当 `CI_WITH_MCP=1` 才确保编辑器+MCP 就绪（否则跳过，避免与 CLI 构建争用工程锁）；轮询 `http://127.0.0.1:3000/health` 至多 90s。
- **[1/4]** best-effort 场景校验：`POST /api/scene_management`（非阻断）。
- **[2/4]** `build-cocos.mjs`。
- **[3/4]** `check-bundle-size.mjs`（仅构建成功时）。
- **[4/4]** `deploy-wechat.mjs`。
- **退出码**：构建/部署失败 → 1；部署控制台错误超阈 → 2；首包门禁任意非零 → 1（WARN 退出 2 在 CI 升级为失败）。

---

## 4. 引擎裁剪机制（Engine-Trimming Mechanism）

存在**两套互补控制**，真正生效的是 (A)：

- **(A) `settings/v2/packages/engine.json`** → `modules.default.configs.defaultConfig.cache`：将未使用特性标记为 `_value:false`。这是「项目设置 → 功能裁剪」的权威配置。**当前 _value:false 共 39 项**（团队口头称 "36 模块裁剪集"，最新 engine.json 实际为 39 项，以文件为准）。
- **(B) `build-cocos.mjs → buildWechatConfig().includeModules`**：43 个模块键置 `'off'` 作双保险。**注意（代码注释明确）**：本项目里 `includeModules:'off'` 实际未起到排除作用（引擎被缓存且该字段仅强制包含而非排除）；保留 `'off'` 仅为安全网。**真正机制是 (A) + 重新打包**。

**保留模块**（engine.json 中未标记 off，且为 2D 塔防所需）：`base` / `gfx-webgl` / `2d` / `ui` / `tween` / `graphics` / `mask` / `rich-text` / `ui-skew` / `affine-transform` / `sorting-2d` / `intersection-2d` / `profiler` / `custom-pipeline(+builtin-scripts)`。

**裁剪掉的模块**：所有 3D / 物理（framework/cannon/physx/ammo/builtin/2d 全套）/ 动画 / 骨骼动画 / 粒子 / 音频 / 视频 / Spine / DragonBones / XR / 地形 / WebView / TiledMap / WebSocket / vendor-google / meshopt 等。

> **⚠️ library 缓存规则（关键）**：裁剪**仅在 `library/` 重新打包后生效**。温/陈旧的 `library/`（约 36MB）会让 Cocos 复用旧全量引擎包 → 首包回弹到 3.47MB+。因此 `CI=1`（或 `CLEAN_LIBRARY=1`）会在构建前清空 `library/`；本地开发保留缓存以加速。
>
> **效果**：裁剪后实测基线 ~0.58MB（提交 `b9de720`）；项目目标 <2MB；微信主包硬上限 4MB。

---

## 5. CI 首包体积门禁（CI Bundle Gate）

`scripts/check-bundle-size.mjs` 三级阈值（字节）：

| 范围 | 判定 | 退出码 |
|------|------|--------|
| 首包 ≤ 2.0MB | ✅ PASS（达标，含余量） | 0 |
| 2.0MB < 首包 ≤ 2.5MB | ⚠️ WARN（接近目标上限） | 2 |
| 首包 > 2.5MB | ❌ FAIL（突破 <2MB 目标门禁） | 1 |
| 首包 > 4.0MB | ❌ FAIL（微信主包硬上限兜底） | 1 |

- **`.github/workflows/ci.yml`**：`push`/`PR` 到 `main` 触发；`runs-on: windows-latest`；设 `CI=1`（清空 library）；`pnpm build:cocos` 后 `pnpm size:gate`。**任一非零退出码即令任务失败、阻断合并**（本地 `pnpm size:gate` 退出 2 仅告警，CI 中升级为失败）。
- **基线参考**：0.58MB（b9de720 裁剪后）。
- **自托管 runner 需求**：GitHub 托管 runner **不含** Cocos Creator 3.8.8（Windows 专属 `G:/Game tools/CocosCreator/CocosCreator.exe`）。必须用**装有 Cocos 3.8.8 的自托管 Windows runner**；路径经 `COCOS_CREATOR` 仓库变量覆盖。

---

## 6. 已知陷阱与缓解（Known Gotchas & Mitigation）

| # | 陷阱 | 症状 | 缓解（实现位置） |
|---|------|------|------------------|
| 1 | **code-19** | DevTools `getProjectInfo` 失败：小游戏项目含 `miniprogramRoot` + 陈旧 `.ide` + 空格路径未加引号 | `patchAppId` 剥离 `miniprogramRoot` 且设 `gameRoot='./'`；每轮删除陈旧 `.ide`（不碰 `.ide-status`）；`--project` 加引号双保险（路径现已无空格） |
| 2 | **pnpm 11 `allowBuilds.core-js`** | `core-js@2.6.12` 弃用 postinstall 未 deny → 致命 `[ERR_PNPM_IGNORED_BUILDS]` | `pnpm-workspace.yaml` 设 `allowBuilds: { core-js: false, esbuild: true }` |
| 3 | **`NODE_OPTIONS --use-system-ca`** | 沙箱环境下使 CocosCreator.exe / DevTools 的 node 崩溃 | `build-cocos`/`deploy`/`ci-full` 开头过滤掉该项 |
| 4 | **`ELECTRON_RUN_AS_NODE=1`** | Electron 内核的 Cocos/DevTools 退化为裸 Node → `--project/--build` 报 "bad option" | 三脚本开头 `delete` 该变量 |
| 5 | **Cocos CLI 非零退出** | `collectMetricFromScene` 报 `Missing class GameBootstrap` | 仅度量步骤崩溃，按产物完整性判定成功，忽略退出码 |
| 6 | **Cocos AppID 回退** | 产物 `project.config.json` 用了内置测试 AppID | `patchAppId` 强制写 `wx10c928d3274d2360` |
| 7 | **GBK `description`** | `project.config.json` 以 GBK 写出，`utf-8` 解析抛错 | 多级降级 `utf-8 → latin1 → {}`；重写时收敛为纯 ASCII |
| 8 | **DevTools "Enable IDE Service (y/N)"** | CLI 交互式挂起等待 stdin → 直到超时（类 code-19） | 监测提示自动喂 `y` + 4s 主动预喂 |
| 9 | **陈旧 DevTools 树（automator 连接抖动）** | CLI 挂到陈旧 IDE → code-19 / 不开放 5000 端口 | 多轮杀整棵树（PowerShell UTF-8 BOM 处理中文名）+ 删 `.ide`；`killDevTools()` 在重拉前执行 |
| 10 | **separateEngine 嵌套键** | `--build` 扁平字符串不支持 `packages.wechatgame.separateEngine`，被当成无效 key | 改用 `configPath` 指向 `project.json → builder.wechatgame`（单一事实来源） |
| 11 | **`includeModules:'off'` 不生效** | 该字段仅强制包含、不强制排除 | 仅作双保险；真实裁剪靠 engine.json + library 重打包 |
| 12 | **library 缓存未清** | 裁剪不生效，首包回弹 3.47MB+ | `CI=1` / `CLEAN_LIBRARY=1` 清空 library |
| 13 | **`temp/` 缺失** | 全新 checkout / CI 下写入构建配置失败 | `build-cocos` 写前 `mkdirSync(recursive)`；`deploy` 为 `console_evidence` 建目录 |
| 14 | **DevTools CLI 3799 代理补丁** | DevTools `cli/index.js` 需本地代理补丁（环境相关，不入库） | 运维备注：在用于部署的 DevTools 安装上手动打补丁；升级 DevTools 后需重打 |
| 15 | **自托管 Windows + Cocos runner** | GitHub 托管 runner 无 Cocos | 见 §5 自托管 runner + `COCOS_CREATOR` 变量 |

---

## 7. 运行时缺口（代码层，超出本文档范围，仅提示团队）

- `GameScene.setupTowerSelect()` 为空 → `TowerSelectBar` / `TowerInfoPanel` / `HUD` 尚未挂载到运行时。
- `spawnEnemyAt` 用 `Date.now()` 作节点名，快速连续生成时存在命名碰撞风险。
- 以上属玩法实现缺口，不在本次"文档化既有构建/代码"范围内，但建议 `lin`/`vince` 跟进。

---

## 8. 目录与产物（Directories / Artifacts）

| 路径 | 说明 |
|------|------|
| `assets/scripts` / `assets/scenes` | **唯一**构建来源 |
| `src/`（Phaser 旧实现）、`minigame-unity-legacy/` | 已归档历史方案，不参与构建 |
| `build/wechatgame/wechatgame` | Cocos 构建产物（**禁止手工编辑**） |
| `library/` | Cocos 导入缓存（CI 中清空） |
| `temp/` | 构建配置 + Cocos 临时文件（可能缺失，写前建目录） |
| `tests/` | Vitest 单测 + `smoke/console_evidence` 部署证据 |
| `extensions/cocos-mcp-server` | 编辑器 MCP（端口 3000，见 ADR-003） |

---

## 9. 参考（References）

- `scripts/build-cocos.mjs`、`scripts/deploy-wechat.mjs`、`scripts/check-bundle-size.mjs`、`scripts/ci-full.mjs`
- `.github/workflows/ci.yml`
- `settings/v2/packages/engine.json`、`project.json`、`project.config.json`、`pnpm-workspace.yaml`
- `CLAUDE.md`
- `docs/architecture/adr/ADR-001-engine-feature-trimming.md`
- `docs/architecture/adr/ADR-002-bundle-size-ci-gate.md`
- `docs/architecture/adr/ADR-003-scene-via-cocos-mcp-server.md`
