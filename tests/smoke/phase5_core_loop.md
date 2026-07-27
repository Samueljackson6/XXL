# Phase 5 核心游戏循环冒烟测试门（Smoke Gate）

**项目**：XXL 塔防（XXL Tower Defense）· 微信小游戏（mini-game，非 mini-program）
**引擎**：Cocos Creator 3.8.8 · AppID `wx10c928d3274d2360`
**设计基准**：竖屏 400×700，6×10 网格，30 波敌人，3 种塔（arrow / cannon / slow）
**门控时机**：Phase 4 → Phase 5 转场质量门
**入口场景**：`assets/scenes/GameScene.scene`（`GameBootstrap.start()` 在运行时创建 `GameScene` 节点并挂 `GameScene` 组件；`GameScene.onLoad()` 在运行时构建全部游戏层级）

---

## 1. 门控目的（Gate Purpose）

本门控在正式进入 Phase 5「生产循环」（production loop：稳定出包、数值迭代、运营接入）之前，确认 **核心游戏循环的最小可运行性**——即项目能成功构建、微信开发者工具能无致命错误编译运行、Canvas 能渲染出非空画面、运行时初始化（含 `GameScene.onLoad()` 全量构建游戏层级）不抛未捕获异常。它是**冒烟级**门控，不替代完整测试套件：它只证明「游戏能起来、画面不黑、初始化不崩」，而敌人移动/塔放置/波次推进等玩法正确性必须由人工试玩或运行时日志插桩来兜底（见第 3 节）。自动化此门通过 ≠ 玩法验证通过。

---

## 2. 自动化可验证项（Automated-Verifiable Checks）

> 执行方式：`pnpm deploy`（= `node scripts/deploy-wechat.mjs`）。脚本依次：① CocosCreator.exe 构建 → ② 校验产物文件 → ③ 开发者工具 CLI 自动模式（端口 5000）启动 → ④ miniprogram-automator 连接、取 DevTools/SDK 版本、等待 3s、截一张图、断开。
> **已知限制**：脚本不插桩游戏*玩法*逻辑，只证明「能编译 + Canvas 能渲染 + 运行期无 console/异常错误」。第 2.6 项（控制台错误数）已由 `scripts/deploy-wechat.mjs` 自动采集并落盘证据。

| # | 检查项 | 验证手段 | PASS | CONCERN | FAIL |
|---|--------|----------|------|---------|------|
| 2.1 | **构建完成** | `pnpm deploy` 退出码 0，且 `build/` / `dist/` 产物生成 | 退出码 0，关键产物（game.js、首屏资源）存在 | 退出码 0 但个别非关键资源缺失（无线影响出包） | 构建报错退出，或产物缺失 |
| 2.2 | **DevTools 编译无致命错误** | 部署日志 + 开发者工具编译输出 | 无 fatal/error 级编译错误 | 仅有 warning（如废弃 API 提示） | 出现 fatal 编译错误、无法进入运行态 |
| 2.3 | **Canvas 渲染非空** | `build/playtest-screenshot.png` 非单一纯色 | 截图含多色像素（有实际绘制内容） | 截图偏暗但非纯色、疑似渲染异常待查 | 截图为单一纯色（黑/白屏），判定渲染失败 |
| 2.4 | **运行时初始化无未捕获异常** | automator 连接后 3s 内运行态稳定 | 连接成功、3s 等待期无进程崩溃/断开 | 连接成功但出现可恢复警告 | 连接失败，或等待期进程崩溃/断开 |
| 2.5 | **GameScene.onLoad() 构建不抛错** | 见 2.4 运行态；若需精确可加 onLoad 计时/日志 | onLoad 完成、游戏层级（grid/敌人路径/实体/输入）已挂载且无异常 | onLoad 耗时异常长但成功 | onLoad 抛错导致场景空白或崩溃 |
| 2.6 | **控制台错误数 = 0** ✅*已自动化* | 由 `scripts/deploy-wechat.mjs` 自动插桩捕获（证据见 `tests/smoke/console_evidence/`）；`errorCount ≤ CONSOLE_ERROR_THRESHOLD`（默认 0）即 PASS，否则 `process.exit(2)` 阻断流水线 | 运行期 console.error / 未捕获异常 = 0 | 仅非阻断性 warning | 存在 console.error 或运行时异常 |

> ✅ **第 2.6 项已落地**：`scripts/deploy-wechat.mjs` 已在 automator 会话挂载 `console` / `exception`（= pageerror 等价）监听，于运行时初始化窗口（5s）采集结构化记录，落盘至 `tests/smoke/console_evidence/<ISO-timestamp>.json` 与 `.log`；`errorCount > CONSOLE_ERROR_THRESHOLD`（默认 0）时打印 `Console errors: N (FAIL)` 并 `process.exit(2)` 阻断流水线。阈值可用环境变量 `CONSOLE_ERROR_THRESHOLD` 调整。

---

## 3. 人工试玩验证（Human-Play Verification，必做，无法自动验证）

> 在微信开发者工具内手动运行小游戏，逐项观察打勾。**自动化门通过不代表这些项通过**，必须由人工或运行时插桩确认。每项记 PASS / FAIL。

- [ ] **3.1 敌人生成并沿路径移动**：开局可见敌人按预定路径点逐格推进，速度合理。
- [ ] **3.2 塔放置可用（3 种类型）**：网格空位可放置 arrow / cannon / slow 三种塔，放置后计入资源消耗。
- [ ] **3.3 波次推进 1→30**：能逐波开始、清波、进入下一波，进度可达第 30 波。
- [ ] **3.4 HUD / 生命值更新**：顶部 HUD（金币、波次、生命/基地血量）随事件实时变化；漏怪扣血可见。
- [ ] **3.5 长时间运行不崩溃**：连续跑多波（建议 ≥10 波）无卡死、无内存暴涨、无崩溃。

> 人工试玩结论单独记录为 **HUMAN_PLAY = PASS / PENDING / FAIL**，与自动化结果分开。

---

## 4. 需采集的证据（Evidence to Capture）

| 证据 | 位置 / 来源 |
|------|-------------|
| 运行截图 | `build/playtest-screenshot.png`（由 `pnpm deploy` 生成，用于 2.3 非空判定） |
| DevTools / SDK 版本 | `pnpm deploy` 输出中 automator 取到的版本号（记录进报告） |
| 控制台日志 / 异常证据 | `tests/smoke/console_evidence/<ISO-timestamp>.json`（结构化记录 + summary）+ `<ISO-timestamp>.log`（可读） |
| 部署/构建日志 | `deploy.log` / `build-cocos.log`（用于 2.1–2.2 回溯） |
| 人工试玩结论 | 本文件第 3 节勾选 + HUMAN_PLAY 标记 |

---

## 5. 门控裁决规则（Gate Verdict Rules）

**AUTOMATED 结果**（基于第 2 节 2.1–2.5，2.6 由控制台采集自动判定）：

- **AUTOMATED = PASS**：2.1–2.5 全 PASS（2.6 N/A 或 PASS）。
- **AUTOMATED = CONCERNS**：2.1–2.5 全 PASS，但存在可观察风险（如 2.3 偏暗、2.5 耗时异常、或仅 2.6 warning）。
- **AUTOMATED = FAIL**：2.1–2.5 任一 FAIL（构建失败 / 编译 fatal / 黑屏 / 初始化崩溃）。

**最终门控裁决**（AUTOMATED + HUMAN_PLAY 组合）：

| 情形 | 裁决 | 动作 |
|------|------|------|
| AUTOMATED = PASS **且** HUMAN_PLAY = PASS | ✅ **PASS** | 进入 Phase 5 生产循环 |
| AUTOMATED = PASS **但** HUMAN_PLAY = PENDING（未试玩） | ⚠️ **CONCERNS** | 可进入 Phase 5，但**人工试玩未完成前不得宣布玩法达标**；尽快补 3.1–3.5 |
| AUTOMATED = PASS **但** HUMAN_PLAY = FAIL | ⚠️ **CONCERNS → 视严重度升级** | 记录具体失败项；若影响核心循环（如 3.2 塔不可放）建议回 Phase 4 修 |
| AUTOMATED = CONCERNS | ⚠️ **CONCERNS** | 带风险进入 Phase 5，跟踪风险项 |
| AUTOMATED = FAIL | ⛔ **FAIL** | **阻断**，回 Phase 4 修复后再过门 |

> **关键区分**：`AUTOMATED = PASS` 仅证明「能编译、能渲染、初始化不崩」，**不等于核心玩法正确**。玩法正确性以 `HUMAN_PLAY = PASS`（或等价的运行时插桩证据）为最终判据。未拿到 HUMAN_PLAY 结论前，门控最高只到 **CONCERNS**，不得直接判 PASS 进入 Phase 5 生产循环。

---

*本文档为冒烟级质量门，不替代完整测试套件。不修改任何游戏代码或脚本，仅作计划与裁决依据。*
