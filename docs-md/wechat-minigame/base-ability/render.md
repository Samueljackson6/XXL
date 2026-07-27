# [#](#渲染) 渲染

## [#](#画布) 画布

小游戏只有一个上屏画布，可以有多个离屏画布。通过 [wx.createCavans](https://developers.weixin.qq.com/minigame/dev/api/render/canvas/wx.createCanvas.html) 可以创建一个画布对象。

**约定：首次调用此接口创建的是上屏画布，剩下的是离屏画布。**

## [#](#绘图上下文及接口。) 绘图上下文及接口。

通过 `Canvas.getContext` 可以创建绘图上下文。返回的具体绘图上下文类型可查看 `RenderingContext`。

## [#](#锁帧) 锁帧

[wx.setPreferredFramesPerSecond](https://developers.weixin.qq.com/minigame/dev/api/render/frame/wx.setPreferredFramesPerSecond.html) 接口可以实现锁帧。

## [#](#使用压缩纹理) 使用压缩纹理

从基础库 [2.5.0](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility) 开始支持压缩纹理。其中 iOS 支持 pvr 格式，Android 支持 etc1 格式。

The translations are provided by WeChat Translation and are for reference only. In case of any inconsistency and discrepancy between the Chinese version and the English version, the Chinese version shall prevail.Incorrect translation. [Tap to report.](javascript:;)

-   [关于腾讯](http://www.tencent.com/zh-cn/index.shtml)
-   [文档中心](https://mp.weixin.qq.com/debug/wxadoc/introduction/index.html?t=1484641676)
-   [辟谣中心](https://kf.qq.com/faq/17030722muuu170307MFBny2.html)
-   [客服中心](http://kf.qq.com/faq/120911VrYVrA1509086vyumm.html)

Copyright © 2012-2026 Tencent. All Rights Reserved.

-   画布

-   绘图上下文及接口。

-   锁帧

-   使用压缩纹理

-   复制
-   问题反馈

点击咨询小助手

[

](javascript:;)