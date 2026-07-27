# ADR-002: 首包体积 CI 门禁（Bundle-Size CI Gate）

- **状态（Status）**：Accepted
- **日期**：2026-07-27
- **决策人**：程基岩（技术负责人）

## 上下文（Context）

引擎裁剪只在 `library/` 重新打包后生效（见 ADR-001）。若缓存未清，首包会静默回弹到 3.47MB+，且本地开发难以察觉。需要在流水线里**固化**"裁剪胜利"，使任何体积回弹都在 PR 阶段暴露并阻断合并。

本地与 CI 行为需不同：本地仅告警（不阻断开发），CI 必须阻断（防回归）。

## 决策（Decision）

1. **三级阈值**（`scripts/check-bundle-size.mjs`，单位字节）：

   | 范围 | 判定 | 退出码 |
   |------|------|--------|
   | 首包 ≤ 2.0MB | ✅ PASS（达标，含余量） | 0 |
   | 2.0MB < 首包 ≤ 2.5MB | ⚠️ WARN（接近目标上限） | 2 |
   | 首包 > 2.5MB | ❌ FAIL（突破 <2MB 目标门禁） | 1 |
   | 首包 > 4.0MB | ❌ FAIL（微信主包硬上限兜底） | 1 |

2. **基线参考**：0.58MB（`b9de720` 裁剪后实测）。
3. **CI（`.github/workflows/ci.yml`）**：`push`/`PR` 到 `main` 触发；`runs-on: windows-latest`；设 `CI=1`（清空 library）；`pnpm build:cocos` → `pnpm size:gate`。**任一非零退出码即令任务失败、阻断合并**（WARN 退出 2 在 CI 中升级为失败）。
4. **本地**：`pnpm size:gate` 退出 2 仅为告警（非阻断），便于提前预警。
5. **自托管 runner 需求**：GitHub 托管 runner **不含** Cocos Creator 3.8.8（Windows 专属 `G:/Game tools/CocosCreator/CocosCreator.exe`）。必须用**装有 Cocos 3.8.8 的自托管 Windows runner**；路径经 `COCOS_CREATOR` 仓库变量覆盖。

## 后果（Consequences）

- **正面**：首包体积回归（如 3.47MB 回弹）在 PR 阶段即被捕获并阻断。
- **正面**：本地 `pnpm size:gate` 提供早期预警且不阻断开发。
- **负面**：依赖装有 Cocos 的自托管 Windows runner——基础设施耦合。
- **负面**：WARN 阈值（2.0–2.5MB）偏紧；合法资源增量会触发并在 CI 阻断，须重新校准基线或将资源远程化。
- **负面**：门禁量的是**整个构建输出目录**而非严格"主包"；其有效性依赖 `separateEngine` 把引擎留在分包（见 `project.json`）。

## 参考（References）

- `scripts/check-bundle-size.mjs`
- `.github/workflows/ci.yml`
- `scripts/build-cocos.mjs`（`CI=1` 清空 library）
- `docs/architecture/adr/ADR-001-engine-feature-trimming.md`
