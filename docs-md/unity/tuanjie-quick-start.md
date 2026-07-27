# tuanjie quick start

!function(){var t=function(){try{return new URLSearchParams(window.location.search).get("docusaurus-theme")}catch(t){}}()||function(){try{return window.localStorage.getItem("theme")}catch(t){}}();document.documentElement.setAttribute("data-theme",t||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")),document.documentElement.setAttribute("data-theme-choice",t||"system")}(),function(){try{const c=new URLSearchParams(window.location.search).entries();for(var\[t,e\]of c)if(t.startsWith("docusaurus-data-")){var a=t.replace("docusaurus-data-","data-");document.documentElement.setAttribute(a,e)}}catch(t){}}() window.dataLayer=window.dataLayer||\[\],"function"!=typeof window.gtag&&(window.gtag=function(){window.dataLayer.push(arguments)})

[跳到主要内容](#__docusaurus_skipToContent_fallback)

[

![Tuanjie AI Logo](/img/logo.png)

**Tuanjie AI**](https://codely.tuanjie.cn/)[Tuanjie AI](/getting-started/overview)[TJGenerators](/ai-generation-tools/intro)[集成与生态](/using-codely/codely-cowork)[学习](/learn/ai-programming-environment-setup-guide)[常见问题](/faq/common-questions)[使用教程](/tutorials/codely-game-dev-beginner)

[简体中文](#)

-   [简体中文](/ai-generation-tools/quick-start/)
-   [English](/en/ai-generation-tools/quick-start/)

ctrlK

[下载](https://codely.tuanjie.cn/download)

-   [介绍](/ai-generation-tools/intro)
-   [快速入门](/ai-generation-tools/quick-start)
-   [玩转指南](/ai-generation-tools/play-guide)
-   [编辑器工具介绍](#)

-   [3D 模型生成](/ai-generation-tools/3d-models)
-   [带动画3D角色生成](/ai-generation-tools/animated-character)
-   [模型绑骨与动作生成](/ai-generation-tools/rigged-animated-model)
-   [地形生成](/ai-generation-tools/terrain)
-   [天空盒生成](/ai-generation-tools/skybox)
-   [2D 精灵生成](/ai-generation-tools/2d-models)
-   [表面材质生成](/ai-generation-tools/surface-material)
-   [2D 动作序列帧](/ai-generation-tools/2d-animation)
-   [2D 精灵表序列帧](/ai-generation-tools/sequence-frames)
-   [音频生成](/ai-generation-tools/audio)
-   [语音合成（TTS）](/ai-generation-tools/tts)
-   [图片生成](/ai-generation-tools/images)
-   [视频生成](/ai-generation-tools/video)
-   [Generator MCP](/learn/cowork-generator-mcp)
-   [常见问题](/ai-generation-tools/q-and-a)

-   [](/)
-   快速入门

本页总览

# 快速入门

[玩转指南](/ai-generation-tools/play-guide)[编辑器工具介绍](/ai-generation-tools/3d-models)[MCP配置](/learn/cowork-generator-mcp)[游戏制作指南](/tutorials/codely-game-dev-beginner)

## 安装[​](#安装)

### 通过 Tuanjie/Unity Editor 安装[​](#通过-tuanjieunity-editor-安装)

以Tuanjie Editor为例， 在Hub中打开项目，编辑器项目页面会默认打开Tuajie AI对话框。点击对话框里的 **"/"** 按钮，选择 **Manage Extensions**。

![Bridge](/images/ai generator/cowork8.png)

在**Extensions**中找到**TJGenerators**，点击安装。

![Bridge](/images/ai generator/cowork9.png)

自动安装 TJGenerators 包。

![Bridge](/images/ai generator/cowork10.png)

安装完成后，**Editor**中点击**AI**，出现以下菜单则表示已安装成功。

![Bridge](/images/ai generator/cowork7.png)

### 通过 Tuanjie Cowork 安装[​](#通过-tuanjie-cowork-安装)

#### 连接编辑器[​](#连接编辑器)

点击窗口上方，选择 **Open Game Project**。

![Bridge](/images/ai generator/cowork4.png)

选择您的 Unity 或者 Tuanjie 项目打开。

![Bridge](/images/ai generator/cowork5.png)

在 Tuanjie 编辑器中打开对应的项目，点击 Tuanjie 项目界面，将自动安装 Codely Bridge 的包。

![Bridge](/images/ai generator/image_11.png)

安装成功后，Console 会出现相应的日志信息：

![Bridge](/images/ai generator/image_12.png)

重新切换回 Tuanjie Cowork 界面，对话框下方 Codely Bridge 的状态已经切换为"可用"状态。

![Bridge](/images/ai generator/cowork6.png)

#### 安装 Extension - TJGenerators[​](#安装-extension---tjgenerators)

点击对话框里的 **"/"** 按钮，选择 **Manage Extensions**。

![Bridge](/images/ai generator/cowork1.png)

或者点击Settings，进入**Manage Extensions**。

![Bridge](/images/ai generator/cowork2.png)

在**Extensions**中找到**TJGenerators**，点击安装。

![Bridge](/images/ai generator/cowork3.png)

再次将界面切换到 Tuanjie 项目中，点击项目界面，将自动安装 TJGenerators 包。

![Bridge](/images/ai generator/image_4.png)

安装完成后，**Editor**中点击**AI**，出现以下菜单则表示已安装成功。

![Bridge](/images/ai generator/cowork7.png)

### 通过 Package Manager 安装[​](#通过-package-manager-安装)

1.  打开 Unity/Tuanjie编辑器
2.  菜单：`Window > Package Manager`
3.  点击左上角 `+` 按钮，选择 `Add package by name`
4.  输入包名：`cn.tuanjie.ai.generators`
5.  点击 Add

### 通过 MCP 使用[​](#通过-mcp-使用)

如果你不想通过 Tuanjie/Unity Editor 安装使用 TJGenerators，也可以在 Cowork 中通过 MCP 使用，无需依赖 Unity 或团结项目即可生成游戏素材。具体配置和使用方法请参考 [使用 Cowork Generator MCP 生成游戏素材](/learn/cowork-generator-mcp)。

## 使用[​](#使用)

### 打开生成窗口[​](#打开生成窗口)

菜单：`AI > 生成`

![Bridge](/images/ai generator/cowork7.png)

### 搜索生成的资产[​](#搜索生成的资产)

菜单：`AI > 搜索生成的资产`

会在 Project 窗口中显示所有通过 AI 生成的资产，方便查找和管理。

### AI 生成的资产[​](#ai-生成的资产)

如何生成资产请查看对应页面：

1.  [生成3D模型](/ai-generation-tools/3d-models)
2.  [生成带动画3D角色](/ai-generation-tools/animated-character)
3.  [模型绑骨与动作生成](/ai-generation-tools/rigged-animated-model)
4.  [生成地形](/ai-generation-tools/terrain)
5.  [生成天空盒](/ai-generation-tools/skybox)
6.  [生成2D精灵](/ai-generation-tools/2d-models)
7.  [生成表面材质](/ai-generation-tools/surface-material)
8.  [2D 动作序列帧](/ai-generation-tools/2d-animation)
9.  [2D 精灵表序列帧](/ai-generation-tools/sequence-frames)
10.  [生成音频](/ai-generation-tools/audio)
11.  [语音合成（TTS）](/ai-generation-tools/tts)
12.  [生成图片](/ai-generation-tools/images)
13.  [生成视频](/ai-generation-tools/video)

* * *

[下一章：生成3D模型](/ai-generation-tools/3d-models)

[

上一页

介绍

](/ai-generation-tools/intro)[

下一页

玩转指南

](/ai-generation-tools/play-guide)

-   [安装](#安装)
-   [通过 Tuanjie/Unity Editor 安装](#通过-tuanjieunity-editor-安装)
-   [通过 Tuanjie Cowork 安装](#通过-tuanjie-cowork-安装)
-   [连接编辑器](#连接编辑器)
-   [安装 Extension - TJGenerators](#安装-extension---tjgenerators)
-   [通过 Package Manager 安装](#通过-package-manager-安装)
-   [通过 MCP 使用](#通过-mcp-使用)
-   [使用](#使用)
-   [打开生成窗口](#打开生成窗口)
-   [搜索生成的资产](#搜索生成的资产)
-   [AI 生成的资产](#ai-生成的资产)

[![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAC2VBMVEUAAAD+/ODz6Kr//+PeqFfYrn3x167oxnyaaVzhs2ifaFXbrGLkvFnpyF7v2X/kwm3cp1nhsGfqw3rZqG3ntVzjrFPt3oDjvGnfr2fbnFGti3q0lH7ktoLryXn9v1T4znr/74bnvGz034v+2I/ktoDz6ZLkwY/Dfz7buoftzYbq2IPr0pjs3bLv6KPRrnbKhFv79ND488n/+dDZr4Lx38f/+cH/95f42oL7/97s2Y3++uzw1rvTk3DmuloAAHkBAm7uzWYAAGXktV3qvFr/0ljksE7fo0rWHxhrdocAAIAABHf143Pyy27w1GwGA2jtymHpwWDqxV/qyVyTeFrrwFflwFPislP+xVLpsErbmUfVkEbysETemUTpgj7ThT3XdTg5FDjdhTXWZTDaTCm7TCbTOCLXPiD9LA/QFg3UAwnOAQOEj5kcPpdyhZSptJEACJFpfo4AG44XMInFvYfTvIejmYSVkINyeoJzdoK9un6SjX7FrnwAEHp8enny2HjWwHjKtnhcX3jYzHeNhnfu2HWUjHWsonPNwnH70m9WTm8AAW//723pym3dtmn/0mbnxGa0o2ZeWWb8zGT/4mPtwmJuYmL/22D/vmB5ZGC9kF7/2l0MAF3uyFqnjVn4xFjYnli0mVi5i1jiqVfyyVbmtlbXkVNUOFPlvFLpt1LNrFKjfVLuvlBgHlDsuU/ouU9ONU/ov05ODk7/2E02Gk3jqkqEaUr/tUngjkf7n0bXikb6xERCJETdn0LckUG1gD/ooD3Ulj3jkz3TZT3WjjzOeDqBWDr3pDnglTlMADnbbTf2gjbkbzaTYDZpAjbplzTtcTTEazPXXzOeXzDscS3MPi38jizJWSrVSCrrXynzfCjVdCjZRyjTQCbFUiTlYCPXPSHLPSHWMR/wXh7iRh7GPh3PLBrSIRrWGhfMJxPGJxPRDBG/ABG2ABCxDg7BDAvEGArZAAbJAALPAABwPJeHAAAAPXRSTlMACEIaxqxp+/v59/X08Ozs6+fm5eTk4eDb0tHLx8TDwb68urKxq5+cmJWTjIN8b11cWkxIQUE1MCknIRwUAZA0XgAAAXFJREFUGNNigAJmNmkpNmYGZGDKynXp6NZVHKxGCDHGmQlnLty73NuWsJARrlV+ffDNzNTkrB15y5Shohacmydefeb+9HbGu+keu4UswYJmrZ5zH2U+fP4q9eONSvtmc5CYtVyV177HH9zvp7l/SmvqqlWwAgrqHSv1XHAq69qB0O0Z59vty1x0gIIa56rzp+5KeZIUf3Ln5Bl2xdFqQEHhRJ8c+5TY6w8u3jl9yK+o7rgEUBAw7iPbcu3epCfdjY9Nf+1XEB4nDhRU2TOppPDE2/cvXyRfOVvT0BGmCRSU2buoL9vL0XHjmtmOduWznLbIAgXZ5y896FMf7DFhZWNnxZT9ka58QEHD5W5Rt+ZN2xQe7dLtkhgVFsQEcr0Bb2jcYQdnV1sH35jIHn6wGIOJYFDgkpDAAH9nN1vffgGIoJJ3i5OTs2vAihg3W1sHb1VIaGrxrFu8OmJtRMicDf5iurAAtdFXZ5EUFWFR1DYG8wEUrIUMZ1ticAAAAABJRU5ErkJggg==)沪公网安备31010902103595号](http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=31010902103595)[沪ICP备2022020141号-2](http://beian.miit.gov.cn)