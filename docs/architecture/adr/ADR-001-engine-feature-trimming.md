# ADR-001: 引擎特性裁剪（Engine Feature-Trimming）

- **状态（Status）**：Accepted
- **日期**：2026-07-27
- **决策人**：程基岩（技术负责人）

## 上下文（Context）

微信小游戏主包硬上限 **4MB**，项目目标首包 **<2MB**。Cocos Creator 全量引擎经实测会使主包达 **3.47MB+**，突破目标。XXL 塔防为纯 2D 玩法，仅用到 `base / gfx-webgl / 2d / ui / tween / graphics` 等少量模块；3D、物理、动画、粒子、音频、视频、Spine、DragonBones、XR、地形、WebView、WebSocket、TiledMap、vendor-google、meshopt 等均为死代码。

存在两套候选控制：
- **(A)** 项目设置「功能裁剪」：`settings/v2/packages/engine.json` 的 `cache` 中将未使用特性标记为 `_value:false`。
- **(B)** 构建配置 `build-cocos.mjs → buildWechatConfig().includeModules` 将模块键置 `'off'`。

## 决策（Decision）

1. **权威机制 = (A) engine.json 功能裁剪**（`settings/v2/packages/engine.json`，`modules.default.configs.defaultConfig.cache`），把未使用特性标记为 `_value:false`。
2. **保留 (B) `includeModules:'off'` 作双保险**——但明确记录：在本项目中 `includeModules:'off'` 实际**未起到排除作用**（引擎被缓存，且该字段仅强制包含而不强制排除）；真实生效的是 (A) + 重新打包。不得单独依赖 (B)。
3. **构建前必须清空 `library/`**（`CI=1` 或 `CLEAN_LIBRARY=1`）。裁剪仅在 `library/` 重新打包后生效；温/陈旧的 `library/`（约 36MB）会让 Cocos 复用旧全量引擎包，首包回弹到 3.47MB+。
4. **保留模块集**（2D 塔防所需，均不在裁剪名单）：`base` / `gfx-webgl` / `2d` / `ui` / `tween` / `graphics` / `mask` / `rich-text` / `ui-skew` / `affine-transform` / `sorting-2d` / `intersection-2d` / `profiler` / `custom-pipeline(+builtin-scripts)`。其余全部裁剪。
5. **实际裁剪数量**：当前 `engine.json` 中 `_value:false` 共 **39 项**（团队口头称 "36 模块裁剪集"，最新文件实际为 39 项，**以 `engine.json` 为准**）。

## 后果（Consequences）

- **正面**：裁剪后实测首包基线 ~0.58MB（提交 `b9de720`），远低于 2MB 目标与 4MB 硬上限。
- **正面**：无运行时风险——引擎仍在启动时加载，仅移除死模块。
- **负面**：后续若引入被裁剪的特性（如音频、物理、Spine），须在 `engine.json` 重新启用**并**重打包 `library/`，增加构建步骤。
- **负面**：CI 必须清空 `library/`（构建更慢）才能维持门禁有意义；本地开发保留缓存以提速。
- **负面**：`includeModules:'off'` 当前对排除无效，不可单独依赖。

## 参考（References）

- `settings/v2/packages/engine.json`
- `scripts/build-cocos.mjs`（`buildWechatConfig().includeModules` 注释）
- `scripts/check-bundle-size.mjs`（基线 0.58MB）
- `project.json`（`builder.wechatgame.separateEngine`）
- `docs/architecture/adr/ADR-002-bundle-size-ci-gate.md`
