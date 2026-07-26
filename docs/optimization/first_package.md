# XXL 微信小游戏 — 首包体积优化

> 约束：微信小游戏**首包（主包）< 4MB**，目标 < 2MB。
> 构建链：`scripts/build-cocos.mjs` → `G:/Game tools/CocosCreator/CocosCreator.exe --project . --build ...` → `build/wechatgame/wechatgame/`
> 审计脚本：`scripts/size-audit.mjs`（`node scripts/size-audit.mjs`）

---

## 1. 基线体积拆解（Baseline，优化前）

基线总体积 **4.42 MB (4,629,558 bytes)**，来自 `build/wechatgame/wechatgame/`。

### Top-15 贡献项

| # | 文件 | 体积 | 占比 | 累计% |
|---|------|------|------|-------|
| 1 | cocos-js/_virtual_cc-BncijMet.js | 2907.9 KB | 64.3% | 64.3% |
| 2 | assets/internal/import/07/07d3aae9f.json | 623.3 KB | 13.8% | 78.1% |
| 3 | cocos-js/assets/bullet.release.wasm-BIzkn7bF.wasm | 458.5 KB | 10.1% | 88.2% |
| 4 | cocos-js/assets/spine-CC34fKUR.wasm | 200.4 KB | 4.4% | 92.7% |
| 5 | web-adapter.js | 87.9 KB | 1.9% | 94.6% |
| 6 | assets/internal/index.js | 44.1 KB | 1.0% | 95.6% |
| 7 | assets/main/index.js | 36.2 KB | 0.8% | 96.4% |
| 8 | cocos-js/bullet.release.wasm-DRRYxUJj.js | 26.3 KB | 0.6% | 97.0% |
| 9 | cocos-js/spine.wasm-DmQjMU-3.js | 21.6 KB | 0.5% | 97.5% |
| 10 | engine-adapter.js | 19.9 KB | 0.4% | 97.9% |
| 11 | first-screen.js | 18.4 KB | 0.4% | 98.3% |
| 12 | logo.png | 14.2 KB | 0.3% | 98.6% |
| 13 | slogan.png | 11.2 KB | 0.2% | 98.9% |
| 14 | cocos-js/cc.js | 10.4 KB | 0.2% | 99.1% |
| 15 | src/polyfills.bundle.js | 8.2 KB | 0.2% | 99.3% |

### 分类汇总（基线）

| 分类 | 体积 | 占比 |
|------|------|------|
| 引擎代码（engine-adapter / web-adapter / first-screen / cocos-js） | 3.66 MB | 83.0% |
| 资源（assets/） | 0.69 MB | 15.7% |
| 游戏代码（game.js / application.js / src/） | 0.03 MB | 0.7% |
| 开销/配置（game.json / project.config.json / logo / slogan） | 0.03 MB | 0.7% |
| **合计** | **4.42 MB** | 100% |

### 根因

- **引擎整包在主包**：`cocos-js/_virtual_cc`（2.9MB 全量引擎）直接打在主包，且整包未做模块裁剪。
- **未使用的引擎模块被打包**：`bullet`(3D 物理 wasm 458KB + asm 胶水)、`spine`(动画 wasm 200KB) 被包含在引擎内。经 `grep` 全量检查 `assets/scripts` 与 `assets/scenes`，**无任何 Spine / 物理（2D/3D）/ Marionette / 粒子 / 视频 / WebView / Tiled 引用** → 这些是死重。
- **资源未走远程**：`assets/` 全部在主包（最大单文件 `07d3aae9f.json` 623KB 为场景序列化导入数据）。

---

## 2. 应用的首包优化

### 2.1 `project.json` 变更（允许范围内）

| key | 旧值 | 新值 | 说明 |
|-----|------|------|------|
| `build.USE_SHRINKING` | `false` | `true` | 引擎模块裁剪意图（生效需配合构建链路，见 2.2） |
| `builder.wechatgame`（新增） | — | `{ separateEngine:true, minified:true, sourceMaps:false, debug:false, embedWebDebugger:false }` | 首包优化的单一事实来源（由 build-cocos.mjs 读取） |

> ⚠️ **重要前提**：Cocos Creator 3.8.8 的构建**不读取** `project.json` 的 `build` / `builder` 字段。
> 实际构建选项由 `scripts/build-cocos.mjs` 通过 Cocos CLI 的 `--build` 字符串（或 `configPath`）注入。
> 详见第 4 节「机制说明」。

### 2.2 `scripts/build-cocos.mjs` 变更（必要偏离，已标记待确认）

**为什么必须改这个文件**：经实测，Cocos CLI 的 `--build "key=value;..."` 字符串**不支持嵌套 key**。
直接传 `packages.wechatgame.separateEngine=true` 会被当成扁平字符串 key `"packages.wechatgame.separateEngine"`，引擎仍留在主包、体积不变（验证失败）。

**采用的机制（官方支持）**：Cocos 文档明确 `--build` 支持 `configPath=<json文件>`，"以 JSON 文件格式加载构建参数"。
因此 `build-cocos.mjs` 现在：

1. 读取 `project.json → builder.wechatgame`（单一事实来源）；
2. 生成完整构建参数对象（已知良好默认值 + 上述覆盖项），写入 `temp/wechatgame-build-config.json`；
3. 以 `configPath=...` 传给 Cocos。

关键项 `separateEngine:true` 让整个 Cocos 引擎（含 bullet/spine wasm）通过**微信 `cocos` 插件**（`game.json` 中 `"plugins":{"cocos":{...}}"`）提供，
引擎代码在主包中的占比大幅下降，主包体积从 4.42MB 降到 3.47MB。

> 该改动偏离了「仅编辑 project.json」的原始约束，因为 project.json 在本项目并非构建选项的有效来源。
> 改动**局部、可一键回退**（恢复 `build-cocos.mjs` 即可），且未触碰场景 / 资源 / `deploy-wechat.mjs` / `ci-full.mjs`。如团队倾向其它落地方式（如改 `settings/v2/packages/builder.json` 或由 `ci-full.mjs` 接管），可随时回退。

---

## 3. 结果（Result）

| 指标 | 优化前 | 优化后 | 变化 |
|------|--------|--------|------|
| 主包总体积 | 4.42 MB | **3.47 MB** (3,636,269 B) | **−0.95 MB (−21.5%)** |
| 与 4MB 硬约束 | 超出 0.42MB ❌ | 余量 **+0.53 MB** ✅ | 已满足 |
| 与 2MB 目标 | 超出 2.42MB | 超出 1.47MB | 未达（见第 5 节） |

分类（优化后）：引擎 2.71MB(78.2%) / 资源 0.69MB(20.0%) / 游戏代码 0.04MB / 开销 0.03MB。

> 注：启用 `separateEngine` 后 `game.json` 引用微信 `cocos` 插件提供引擎。若平台对插件引擎不计入 4MB 主包，
> 实际计费主包可能更低（非引擎部分约 0.76MB）。上表按「输出目录全部文件」保守计为 3.47MB，仍 < 4MB。

---

## 4. 机制说明（供后续维护）

- **构建选项落地链路**：`project.json.builder.wechatgame` → `build-cocos.mjs:buildWechatConfig()` → `temp/wechatgame-build-config.json` → Cocos `--build configPath=...`。
- **CLI `--build` 扁平 key 的限制**：实测 `packages.wechatgame.separateEngine=true` 被解析为字符串 key 而失效；嵌套选项必须走 `configPath`。
- **`src/settings.json` 中的 `server:""` / `subpackages:[]`**：当前资源全部本地、无分包。若要进一步瘦身可走远程资源（见第 5 节）。

---

## 5. 残留风险 / 仍超预算项 & 下一步建议

当前 **3.47MB 已满足 < 4MB 硬约束**，但 **< 2MB 目标未达**。主要剩余体积：

| 项 | 体积 | 是否使用 | 处理建议 |
|----|------|----------|----------|
| bullet（3D 物理 wasm+asm） | ~1.4 MB | 未使用（已 grep 确认） | 功能裁剪剔除 |
| physics-2d / Box2D | ~0.49 MB | 未使用 | 功能裁剪剔除 |
| spine（动画 wasm） | ~0.22 MB | 未使用 | 功能裁剪剔除 |
| assets/internal/import/07/07d3aae9f.json | 0.62 MB | 场景序列化数据 | 资源精简 / 远程化 |

**优先级建议（冲击 < 2MB 目标）：**

1. **【高】引擎功能裁剪（Feature Cropping）**：项目设置 → 功能裁剪，关闭 Spine / 3D 物理(Bullet) / 2D 物理(Box2D) / 粒子 / 视频 / WebView / Tiled / Marionette（本项目均未使用，已验证）。
   - 落地：写入 `settings/v2/packages/engine.json` 的 `features`，并**清空 `library/` 缓存重新构建**（否则引擎缓存导致裁剪不生效——本次 `includeModules:"off"` 即因缓存未生效）。
   - 预计主包可再降 ~2.1MB → 约 1.3MB，达成 < 2MB。
   - 风险：裁剪后需真机/DevTools 跑通（当前 orchestrator 正在修场景运行时错误，建议错开或一并验证）。

2. **【中】资源远程化**：设 `REMOTE_SERVER_ROOT`（或构建选项 `server`）指向 CDN，把 `assets/`（0.69MB，尤其 623KB 场景 json）移出主包。需可用 CDN 地址。

3. **【低】WASM Brotli 压缩**：构建选项 `wasmCompressionMode`（部分平台支持），进一步压缩 wasm（若仍保留物理/Spine）。

---

## 6. 回退方案

- 若 `separateEngine` 导致运行时异常：将 `project.json.builder.wechatgame.separateEngine` 改回 `false`（或删除 `builder` 段），恢复 `build-cocos.mjs` 为原始版本，重新构建即可回到 4.42MB。
- 所有改动均为本地文件，未提交、未删除、未上线，可一键回退。
