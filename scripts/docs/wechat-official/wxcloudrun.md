# 微信云托管（WeChat Cloud Hosting / wxcloudrun）

> 来源：developers.weixin.qq.com/minigame/dev/wxcloudrun/src/
> 抓取日期：2026-07-22

## 概述

微信云托管是微信小游戏平台提供的**后端服务托管**能力，支持 CI/CD、容器部署、Git 集成。

## 核心能力

| 能力 | 说明 |
|------|------|
| **Git 集成** | 支持 GitHub、GitLab 等代码仓库 |
| **CI/CD 流水线** | 自动构建、自动部署 |
| **容器部署** | 基于容器技术的服务部署 |
| **运维** | 版本管理、灰度发布、监控告警 |
| **自动构建** | 代码 push 后自动触发构建 |

## 关键功能关键词

- CI（持续集成）
- Git / GitHub 集成
- 自动部署
- 流水线（Pipeline）
- 容器 / Docker
- 运维
- 版本管理
- 构建

## 适用场景

小游戏后端服务（排行榜、用户数据、游戏进度存档等）的云端托管和自动化部署。

## 注意事项

- 微信云托管是**服务端**能力，不直接替代前端构建流程
- 前端构建仍需要本地或 CI 环境完成，产物通过 CLI 上传
- 与小游戏前端构建是**互补关系**，非替代关系

---
*来源：[微信云托管官方文档](https://developers.weixin.qq.com/minigame/dev/wxcloudrun/src/)*
