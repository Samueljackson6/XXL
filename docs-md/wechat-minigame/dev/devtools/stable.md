## [#](#稳定版-Stable-Build-更新日志) 稳定版 Stable Build 更新日志

### [#](#_1-05-2108130-Windows-64-、-Windows-32-、-macOS) 1.05.2108130 [Windows 64](https://servicewechat.com/wxa-dev-logic/download_redirect?type=x64&from=mpwiki&download_version=1052108130&version_type=1) 、 [Windows 32](https://servicewechat.com/wxa-dev-logic/download_redirect?type=ia32&from=mpwiki&download_version=1052108130&version_type=1) 、 [macOS](https://servicewechat.com/wxa-dev-logic/download_redirect?type=darwin&from=mpwiki&download_version=1052108130&version_type=1)

### [#](#_2021-08-13-更新说明) 2021.08.13 [更新说明](https://developers.weixin.qq.com/community/minihome/doc/000cea19598d10ff619c5c8565bc01)

1.  `A` 新增 小程序、小游戏插件支持workers
2.  `A` 新增 支持从扩展面板导入解包的文件夹安装扩展
3.  `A` 新增 体验评分面板新增HTML格式导出 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000aa0fc4fce481ed95cdf4d556000)
4.  `A` 新增 小游戏支持实验室数据接口
5.  `A` 新增支持工具配置自定义主题色
6.  `A` 新增 云开发新手引导
7.  `A` 新增 真机性能分析工具
8.  `A` 新增 工具支持 wx.getExptInfoSync 调试能力
9.  `A` 新增 小程序压测工具（在拓展设置->测试工具路径下）
10.  `A` 新增 支持编辑 JSON 文件时点按跳转和补全 WXML 文件路径
11.  `A` 新增 支持 Page/Component 的 JSON 文件内容补全
12.  `A` 新增 支持调试版基础库推送
13.  `A` 新增 支持调试wx.onLocationChange，可通过修改调试器sensor里的location信息触发更新
14.  `U` 优化 trace 面板支持暗色主题
15.  `U` 优化 在 TS 项目中可新建 ts 文件的 Page
16.  `U` 优化 插件开发模式下，【详情】-【基本信息】中展示插件的大小信息
17.  `U` 优化 AppData 面板键值按字母序排列 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000eca013cc7f0af553c77ed556c00)
18.  `U` 优化 WXML 面板自定义组件数据编辑
19.  `U` 优化 插件开发支持生成骨架屏功能 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000240aaa4950500cdb00cb256c00)
20.  `U` 优化 改云开发quickstart，更新uploadCloudFunction模板
21.  `F` 修复小游戏项目使用本地插件时报错的问题
22.  `F` 修复 WXML 面板自定义组件不显示 externalClass 的问题
23.  `F` 修复 切换代码片段项目类型提示的 appid 列表类型不对的问题
24.  `F` 修复 真机调试时出现 U.createEvent 报错，现在会显示真正的报错信息
25.  `F` 修复 部分项目使用增强编译后，因压缩问题导致代码包体积变大。[反馈详情](https://developers.weixin.qq.com/community/develop/doc/00066e91d50b588d1c6ce9e6656400)
26.  `F` 修复 需要编译两次才会执行最新的代码的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00084e3a78c1000ac35c3a1ef56c00)
27.  `F` 修复 调试器 sources 面板 snippet 断点符号不显示
28.  `F` 修复 局部编译下 wxml 编译报错的bug [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006660bb1496003a55c31da35bc00)
29.  `F` 修复 编译模式弹窗样式
30.  `F` 修复 无法获取客户端 trace 文件的问题
31.  `F` 修复 工具菜单导入项目&导入代码片段部分问题
32.  `F` 修复 调试时进入 WAService.js 卡死的问题
33.  `F` 修复 视频播放无声音的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00062c0b560f40f5695cd170054c00)
34.  `F` 修复 弹窗调试器网址清空的问题
35.  `F` 修复 云同步设置关闭不了的问题
36.  `F` 修复 真机调试下修改 window 属性报错的问题
37.  `F` 修复 windows 点立即更新后工具消失没有弹出安装程序的问题
38.  `F` 修复 开发者工具可能会进入 vim 状态的问题
39.  `F` 修复 WXML 面板选择器包含 body 会被替换为 page 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00040cca43c42072dd3cfab875f400)
40.  `F` 修复 版本管理内右键菜单可能出现无效项目的问题
41.  `F` 修复 局部编译的bug
42.  `F` 修复 MacOS 12工具crash闪退问题
43.  `F` 修复 Mac 自动真机调试后扫码真机调试白屏
44.  `F` 修复 代码片段基础库列表加载问题
45.  `F` 修复 修复真机调试加载独立分包的问题
46.  `F` 修复 rc 升级上来后快速回退到1.05.2104251失败
47.  `F` 修复 修复JS 编译为 ES5逻辑错误的bug
48.  `F` 修复 小程序workers增强编译报错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e263b770bb8af087c1f2c951000)
49.  `F` 修复 downloadFile指定下载存储路径后报错问题
50.  `F` 修复 查看小程序分享页和打开小程序会报错 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000eacbb1e0e08c58a7c0d22451c00)
51.  `F` 修复 自动创建ts文件的bug [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ae4a1e8cea8f4a78cdbfdb56000)
52.  `F` 修复 热重载修改样式后 wxml 里没有体现
53.  `F` 修复 小游戏多账号调试时加载分包可能失效的问题
54.  `F` 修复 小游戏加载分包时没有触发 onProgressUpdate 的问题
55.  `F` 修复 调试器 AppData 面板数据未更新的问题
56.  `F` 修复 工具打开项目后，再次双击打开工具，原有项目会退出的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000aec3ba00a904b108c6a05d55400)
57.  `F` 修复 WXML 面板选取元素可能失败的问题
58.  `F` 修复 windows 设置使用系统代理失败的问题
59.  `F` 修复 多账号调试，测试号窗口 getUserProfile 授权半屏窗显示的是主窗口的头像昵称)

### [#](#_2021-07-09) 2021.07.09

1.  `F` 修复 部分项目使用增强编译后，因压缩问题导致代码包体积变大。[反馈详情](https://developers.weixin.qq.com/community/develop/doc/00066e91d50b588d1c6ce9e6656400)
2.  `F` 修复 初始新建云开发项目编译异常的相关问题

### [#](#_2021-06-30-更新说明) 2021.06.30 [更新说明](https://developers.weixin.qq.com/community/minihome/doc/000a2ea2030c30df855ce57c751401)

1.  `F` 修复 需要编译两次才会执行最新的代码的问题
2.  `F` 修复 局部编译下 wxml 编译报错的bug [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006660bb1496003a55c31da35bc00)

### [#](#_2021-06-25) 2021.06.25

1.  `A` 新增 代码主题/配色扩展
2.  `A` 新增 WXML 方法和样式补全支持点按跳到定义
3.  `A` 新增 居中显示所有窗口的菜单选项
4.  `A` 新增 插件开发模式支持真机调试
5.  `A` 新增 支持PC小游戏指针锁定API
6.  `A` 新增 云开发支持腾讯云环境转换为云开发环境
7.  `A` 新增 企业微信模拟器插件基础库新增2.12.3 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e0476aa4590d28f2cf08e351800)
8.  `A` 新增 通过 URL Scheme 编译的方式
9.  `A` 新增 小程序压测工具（在拓展设置->测试工具路径下）
10.  `A` 新增 支持调试 wx.onLocationChange，可通过修改调试器 sensor 里的 location 信息触发更新
11.  `U` 优化 游戏引擎改为使用compiler模块中的构建npm
12.  `U` 优化 app-config.json 注入大小
13.  `U` 优化 菜单栏重构
14.  `U` 优化 减少启动期间窗口抢焦点的情况
15.  `U` 更新 ES6转ES5和增强编译合并成将JS 编译成 ES5，如仅需ES6转ES5，可在 project.config.json 文件 setting 中，将showES6CompileOption 设置为 true
16.  `U` 更新 增强编译 babel版本 v7.12.1
17.  `U` 优化 工具拓展屏窗口打开展现位置
18.  `U` 优化 云开发访问用户列表支持按时间排序
19.  `U` 优化 公众号网页调试的开放标签跳转体验
20.  `U` 优化 支持下拉选择appid时，展示有权限的appid [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ec4268644e8f1defb4faa458400)
21.  `U` 优化 局部编译的UI展示
22.  `U` 优化 公众号网页调试的开放标签跳转体验
23.  `U` 完善 工具支持模拟 opentype="feedback" 的 button 行为
24.  `U` 优化 命令行 CLI 二维码支持设置大小 `--qr-size=small`
25.  `U` 优化 站内消息通知形式
26.  `U` 优化 AppData 面板键值按字母序排列 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000eca013cc7f0af553c77ed556c00)
27.  `U` 优化 WXML 面板自定义组件数据编
28.  `F` 修复 调试器 sources 面板无法解析 wasm 文件
29.  `F` 修复 在项目列表页窗口没有显示的情况下，网页上点击代码片段链接不能直接导入代码片段
30.  `F` 修复 公众号网页调试某些场景下开放标签无法渲染的问题
31.  `F` 修复 打开项目时编辑器配色可能不正确的问题
32.  `F` 修复 Windows 下公众号开发窗口可能遮挡任务栏的问题
33.  `F` 修复 含有 WXS 代码的 WXML 文件格式化缩进可能错误的问题
34.  `F` 修复 云开发公众号环境共享进入设置提示错误的问题
35.  `F` 修复 云开发共享环境时样式问题
36.  `F` 修复 sources 面板重编出现多个 worker 的问题
37.  `F` 修复 首次编译JS耗时过长的问题
38.  `F` 修复 模拟器重编内存不断增加的问题
39.  `F` 修复 关闭模拟器的情况下，上传版本的map文件可能丢失的问题
40.  `F` 修复 编译条件列表选择和展示不正确的问题
41.  `F` 修复 AppData 面板数据不更新的问题
42.  `F` 修复弹出模拟器自定义设备失效问题
43.  `F` 修复 memory 面板录制失败的问题
44.  `F` 修复 打开没有权限的项目目录会卡在加载中的问题
45.  `F` 修复 编辑器设置了预览时自动保存文件不生效
46.  `F` 修复 登录后仍然提示 41001 的问题
47.  `F` 修复 删除 miniprogram 目录可能导致 “app.json 未找到” 的 bug
48.  `F` 修复 代码片段未过滤掉不支持版本的基础库列表的问题
49.  `F` 修复 局部编译不支持 app.json 中的 usingComponents 情况
50.  `F` 修复 上传时代码遗留在 weappdest 目录的 bug
51.  `F` 修复 MacOS 12 工具 crash 闪退问题
52.  `F` 修复 WXML 面板选择器包含 body 会被替换为 page 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00040cca43c42072dd3cfab875f400)
53.  `F` 修复 开发者工具可能会进入 vim 状态的问题
54.  `F` 修复 弹窗调试器网址清空的问题
55.  `F` 修复 真机调试下修改 window 属性报错的问题
56.  `F` 修复 云同步设置关闭不了的问题
57.  `F` 修复 windows 点立即更新后工具消失没有弹出安装程序的问题
58.  `F` 修复 局部编译 tabbar 组件不展示的问题
59.  `F` 修复 局部编译切换成普通编译时样式丢失的问题
60.  `F` 修复 工具菜单导入项目&导入代码片段部分的问题

### [#](#_2021-05-17-更新说明) 2021.05.17 [更新说明](https://developers.weixin.qq.com/community/minihome/doc/000440c0cbc1f0b7f81c2771756801)

1.  `A` 新增 不再提供 `小程序打开App技术服务` 提示逻辑 [详情](https://developers.weixin.qq.com/community/develop/doc/000c04d94c0588744a2cf4d9c5bc09)

### [#](#_2021-05-10) 2021.05.10

1.  `A` 新增 公众号网页调试支持云开发
2.  `A` 新增 可视化编辑器支持复制粘贴组件
3.  `A` 新增 游客模式
4.  `A` 新增 自动使用最新的小程序/小游戏定义文件
5.  `A` 新增 云同步保留开发者个人习惯
6.  `A` 新增 小程序漏洞扫描插件
7.  `A` 新增 web-view 调试按钮放到底部栏预览旁边
8.  `A` 新增 错误信息之后增加复制按钮
9.  `U` 优化 小程序\\小游戏的 snippets 代码片段补全
10.  `U` 优化 WXML编辑器插件能力优化
11.  `U` 优化 重构Storage面板，优化展示效果
12.  `U` 优化 针对 5MB 以上的代码包，预览和上传时采用异步方式
13.  `U` 优化 工具授权框的交互和真机一致
14.  `F` 修复 小程序设置静音后，重启项目即失效的问题
15.  `F` 修复 默认占用8001调试端口
16.  `F` 修复 小游戏非独立域 wx.connectSocket 死循环的问题
17.  `F` 修复 部分 windows webview 白屏问题
18.  `F` 修复 工具放置一段时间模拟器白屏无法编译的问题
19.  `F` 修复 devtools无法添加storage键值对的问题
20.  `F` 修复 小游戏点击选取元素时未给插件发送鼠标事件
21.  `F` 修复 webview crash会引发工具整个崩溃的问题
22.  `F` 修复 mac多账号调试窗口无法使用快捷键复制的问题
23.  `F` 修复 模拟器工具栏 home 按钮点击后不触发 onHide
24.  `F` 修复 云控制台费用中心-收支明细详情无法点开多次
25.  `F` 修复 面板切到别的 tab 收起再展开，会错误地显示调试器
26.  `F` 修复 分享到朋友圈跳转后的表现不符合预期的问题
27.  `F` 修复 多账号调试，调试器位置问题
28.  `F` 修复 公众号网页调试Performance面板点击刷新异常的问题
29.  `F` 修复 弱网场景下登录态丢失问题
30.  `F` 修复 设置编辑器字体异常
31.  `F` 修复 稳定版 websocket 发送数据报错的问题
32.  `F` 修复 模拟器显示比例缩小后，场景值选择框显示不全且会超出模拟器的问题
33.  `F` 修复 调试模拟器 webview 部分页面会白屏的问题
34.  `F` 修复 登录后仍然提示 41001 的问题
35.  `F` 修复 删除 miniprogram 目录可能导致 “app.json 未找到” 的 bug
36.  `F` 修复 代码片段未过滤掉不支持版本的基础库列表的问题
37.  `F` 修复 局部编译不支持 app.json 中的 usingComponents 情况
38.  `F` 修复 上传时代码遗留在 weappdest 目录的 bug
39.  `F` 修复 云开发支付页面无法获取代金券的问题
40.  `F` 修复 memory 面板录制失败的问题
41.  `F` 修复 工具放置一段时间模拟器白屏无法编译的问题
42.  `F` 修复 打开没有权限的项目目录会卡在加载中的问题
43.  `F` 修复 编辑器设置了预览时自动保存文件不生效

### [#](#_2021-04-16-更新说明) 2021.04.16 [更新说明](https://developers.weixin.qq.com/community/minihome/doc/00064a2d3087c800e7db142625c801)

1.  `A` 新增 `getUserInfo` 接口适配检测逻辑

### [#](#_2021-03-19) 2021.03.19

1.  `A` 新增 云函数本地调试支持模拟环境变量
2.  `A` 新增 云开发云托管消息推送
3.  `A` 新增 公众号网页开发支持音频标签
4.  `A` 新增 公众号网页调试支持横屏
5.  `A` 新增 wx.request 支持使用 enableHttp2 参数 [详情](https://developers.weixin.qq.com/minigame/dev/api/network/request/wx.request.html)
6.  `A` 新增 可视化编辑增加组件面板
7.  `A` 新增 调试菜单增加打开工具调试相关文件快捷操作
8.  `A` 新增 支持 getUserProfile 接口的交互
9.  `U` 优化 公众号网页调试窗口支持自定义标题栏
10.  `U` 优化 二次编译 JSON 文件的速度
11.  `U` 优化 新建云开发项目体验优化
12.  `U` 优化 sitemap 文件的检测方式
13.  `U` 优化 背景音频支持倍速设置 playbackRate [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002829b6f41b01a67ab3ad1256800)
14.  `U` 优化 调试器 js context appservice 展示改为非红色
15.  `U` 优化 调试器 sources 面板默认自动展开当前 instanceframe 内的代码目录
16.  `U` 优化 10MB以上代码包采用异步方式上传
17.  `U` 优化 模拟器更多功能半屏弹窗，横屏时对齐客户端样式
18.  `F` 修复 分包插件页无法引用分包组件的问题
19.  `F` 修复 小游戏模拟器分离窗口显示不全的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00042085700938f0a1cb9903951c00)
20.  `F` 修复 调试器 sensor 面板重力模拟无法使用的问题
21.  `F` 修复 WeappApplication 目录下 Temp 文件占满磁盘问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000288a6b20450f781e92a69e56c00)
22.  `F` 修复 二维码编译打不开的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008424afd42106caf8bea9a456800)
23.  `F` 修复 无手机号小程序无法开通云开发的问题
24.  `F` 修复 多项目窗口切换登录用户后没有同步头像等状态
25.  `F` 修复 代码片段分享失败的问题
26.  `F` 修复 模拟器网络设为 offline，WebSocket 依然能通信的问题[反馈详情](https://developers.weixin.qq.com/community/develop/doc/00046843e90cf845de8b66d3a56400)
27.  `F` 修复 showToast icon 为 error 展示不正确的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008c62ef6c4003ac09b5764b51000)
28.  `F` 修复 `<web-view />` 中 safe-area-inset-bottom 可能失效的问题
29.  `F` 修复 小游戏开发模式下读取非game.json的json文件时，控制台会输出警告的问题
30.  `F` 修复 第三方平台开发模式下，真机调试获取不到ext.json内容的bug [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c44000c05205cf3cb9505656400)
31.  `F` 修复 导入项目不能选择云开发的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e0ecc824180e1a8db3e3a656000)
32.  `F` 修复 部分机器调试器白屏问题
33.  `F` 修复 编译条件参数为空时 onLoad 方法获取的 options 为 {"": ""} 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008420acb0698d5c6db3885851000)

### [#](#_2021-02-22-更新说明) 2021.02.22 [更新说明](https://developers.weixin.qq.com/community/minihome/doc/0000e8a9c5c8a8365eabd638150801)

1.  `A` 新增 `getUserInfo` 接口适配检测逻辑

### [#](#_2021-02-01) 2021.02.01

1.  `A` 新增 支持调试用微信内素材打开小程序的场景
2.  `A` 新增 代码静态依赖分析支持小游戏类型
3.  `A` 新增 sourceMap 匹配调试插件 [详情](https://developers.weixin.qq.com/miniprogram/dev/devtools/sourcemap)
4.  `A` 新增 小程序可视化编辑面板 [详情](https://developers.weixin.qq.com/miniprogram/dev/devtools/visualedit)
5.  `A` 新增 支持小程序复制链接的调试
6.  `A` 新增 支持在微信开发者工具中，以仅代码编辑器的形式打开其他类型的项目或文件夹
7.  `A` 新增 将编译条件单独配置到 `project.private.config.json` [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008e2ef6bc870d9ac3beedb451000)
8.  `A` 新增 支持公众号调试订阅消息
9.  `U` 优化 优化云开发开通界面流程，支持同时开通云开发和创建环境
10.  `U` 优化 云开发云托管编辑器支持
11.  `F` 修复 暗黑模式下工具启动调试器会白屏的问题
12.  `F` 修复 小游戏项目 `signature.json` 可能校验失败的问题
13.  `F` 修复 使用 kbone 项目报错的问题
14.  `F` 修复 横屏时 `safe-area-inset-bottom` 数值不对的问题
15.  `F` 修复 部分场景使用体验评分导致工具闪退的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000668a7b84cb8a86a6b047b256800)
16.  `F` 修复 云开发腾讯云弹窗白屏的问题
17.  `F` 修复 修复第三方平台在cli预览时参数不正确的问题
18.  `F` 修复 WXML 面板自定义组件 class 重复显示的问题
19.  `F` 修复 1.05版本工具小游戏真机调试加载失败的问题
20.  `F` 修复 真机调试 `Network` 面板显示请求数不正确的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00080afee585705f836b3026951400)
21.  `F` 修复 `project.config.json` 中的 projectname 未同步的问题
22.  `F` 修复 调试器弹出空白的问题
23.  `F` 修复 `wx.request`返回值类型错误的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e8ae7aac3182092fa5fda151c00)
24.  `F` 修复 点击云开发控制台可能无反应的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a486b6746189a587bbb9b457800)
25.  `F` 修复 胶囊位置与客户端保持一致
26.  `F` 修复 小程序 webview 组件打开公众号网页出现无效签名报错的问题
27.  `F` 修复 开启热重载时修改 js 文件报错的问题
28.  `F` 修复 使用2.14.0及以下版本基础库时，配置防盗链的资源可能无法正常使用的问题
29.  `F` 修复 使用 weui 拓展库出现 `getApp()` 返回 undefined 的问题
30.  `F` 修复 小程序 tabbar 在刘海屏机型表现和真机不一致的问题
31.  `F` 修复 `fs.unlink` 不为异步的问题
32.  `F` 修复 WXML 面板 shadowRoot 子节点不正确的问题
33.  `F` 修复 `wx.uploadFile` 失败的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00048c393e83c845d76b669cd56800)
34.  `F` 修复 调用 `wx.vibrateLong()` 时模拟器会震出屏幕的问题
35.  `F` 修复 uniapp 框架生成的小程序 sourcemap 问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c82ca5a46407c4a8b8a9105b400)
36.  `F` 修复 小程序导航条是黑色时无法看到 home 按钮的问题
37.  `F` 修复 小游戏开发模式下读取非 `game.json` 的 json 文件时，控制台会输出警告的问题
38.  `F` 修复 公众号网页调试授权信息缺失的问题
39.  `F` 修复 wxml 编译错误显示缺失的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004448994c568c79b8b6dbdb56c00)
40.  `F` 修复 调试器显示 \_\_wxConfig.xxx is deprecated 的问题
41.  `F` 修复 showToast 弹窗 icon 为 error 的时候展示不对的问题
42.  `F` 修复 Android 模拟器 胶囊有重影的问题
43.  `F` 修复 小游戏 downloadFile API 没有自动解压 unzip 返回包的问题

### [#](#_2021-01-15) 2021.01.15

1.  `F` 修复 工具一直处于加载中的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a00ec260760d3d38bf3a5856800)
2.  `F` 修复 多次编译导致工具闪退问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c4c23e842605ea88b45ca35e400)

### [#](#_2021-01-04-更新说明) 2021.01.04 [更新说明](https://developers.weixin.qq.com/community/minihome/doc/0008a8231389802a088b6ab005e401)

1.  `A` 新增 小程序插件开发支持打开功能页
2.  `A` 新增 `wx.getVideoInfo` 支持
3.  `A` 新增 `wx.compressVideo` 支持
4.  `A` 新增 `<wxs/>` src 支持使用绝对路径
5.  `A` 新增 云开发支持内容管理
6.  `A` 新增 云函数本地调试支持快速安装 npm 依赖
7.  `A` 新增 快捷键缩放模拟器区域
8.  `A` 新增 代码静态依赖分析
9.  `A` 新增 `env(safe-area-inset-bottom)` 支持
10.  `U` 优化 iphone 刘海屏机型的模拟器
11.  `U` 优化 windows 版本的部分样式
12.  `U` 优化 多账号调试窗口的菜单栏
13.  `U` 优化 首次打开项目时编译 JSON 耗时过长的问题
14.  `U` 优化 首次打开项目文件列表获取异步化
15.  `F` 修复 `wx.downloadFile` 无法下载 200M 大小的文件的问题
16.  `F` 修复 WXML 面板中自定义组件数据无法编辑的问题
17.  `F` 修复 模拟器区域过小时无法分离模拟器窗口的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000eaaa1f6cee0216c5b153175b400)
18.  `F` 修复 项目列表窗口会自动弹出来的问题
19.  `F` 修复 调试器 Network 面板无法显示云函数请求大于 1M 的回包请求
20.  `F` 修复 `wx.getSystemInfo` 返回的 safeArea 与真机不一致的问题
21.  `F` 修复 1.03.2011120 部分视频无法播放的问题

### [#](#_2020-11-26-更新说明) 2020.11.26 [更新说明](https://developers.weixin.qq.com/community/minihome/doc/0000a0b95a8800310f5b95eca5c801)

1.  `A` 新增 支持设置插件页面为自定义编译条件的启动页面
2.  `A` 新增 第三方平台小程序支持使用企业微信模拟器进行调试
3.  `A` 新增 保留上次预览的二维码
4.  `A` 新增 云开发控制台文件存储配置
5.  `A` 新增 修改 appid 时支持下拉选取最近使用的appid
6.  `A` 新增 体验评分支持导出报告
7.  `A` 新增 支持切后台后可以获取用户位置
8.  `A` 新增 云开发静态网站托管支持自定义域名
9.  `A` 新增 静态网站和云存储支持上传文件夹
10.  `A` 新增 云开发支持云托管
11.  `A` 新增 预览时报错通过弹框提供错误信息 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000688c7f984b077311bb1d9551000)
12.  `U` 优化 云开发拓展功能入口优化
13.  `U` 优化 新建项目流程
14.  `U` 优化 安装包体积
15.  `F` 修复 调试器在模拟器右侧时，选择机型会导致调试器错位
16.  `F` 修复 公众号网页调试模式下调试器白屏
17.  `F` 修复 项目列表页，删除项目时的弹框无法纵向滚动
18.  `F` 修复 工具导入代码片段会直接新建一个新的代码片段
19.  `F` 修复 WXML面板节点元素无法选中
20.  `F` 修复 新的编译模块在win7系统预览报错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000082a55fc1c0bacb2becea25b400)
21.  `F` 修复 udp onClose与客户端表现不一致
22.  `F` 修复 打开工具全屏的问题
23.  `F` 修复 多账号调试，编译一直使用缓存
24.  `F` 修复 2.13.0以上基础库，无法触发 onPageNotFound [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004c683d2474088c52b8314a51400)
25.  `F` 修复 非系统菜单栏 Mac 下左上角的放大无法按住option最大化 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006eefc094908d5d40b86ae858c00)
26.  `F` 修复 关闭所有项目窗口后，不能从菜单里打开项目选择界面 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a8c6d3cc678704ab8443b55b800)
27.  `F` 修复 重复CSS样式没有warning提示
28.  `F` 修复 cli使用 --appid参数时错误
29.  `F` 修复 downloadFile接口三端表现不一致
30.  `F` 修复 openSetting中有三个权限一直关不掉 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ec4088804489b5f0bb44fe55c00)
31.  `F` 修复 工具上临时文件能被unlink删除的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00084cff1307b83306476bdc356400)
32.  `F` 修复 MacOS Big Sur 频繁崩溃的问题
33.  `F` 修复 调试器跟随模拟器一起弹出时编辑器部分区域无法触发点击的问题
34.  `F` 修复 删除项目后，重启工具，已删除的项目又重新出现的问题
35.  `F` 修复 休眠后重新打开会出现项目列表窗口的问题

### [#](#_2020-10-27-更新说明) 2020.10.27 [更新说明](https://developers.weixin.qq.com/community/minihome/doc/0002ece1b88c1852a62b4dc0356c01)

1.  `A` 新增 支持通过打开文件的方式打开项目
2.  `A` 新增 云开发支持[环境共享](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/basis/resource-sharing)
3.  `A` 新增 项目详情-本地设置-上传时自动压缩样式
4.  `A` 新增 MediaTrack.slice 接口支持切割视频
5.  `A` 新增 自动化测试支持设置机型
6.  `A` 新增 公众号网页调试支持调试开放标签（支持标签渲染和触发 launch 生命周期）[反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c20f3974d0008c87aba91556000)
7.  `A` 新增 公众号网页调试支持云开发登录 [详情](https://developers.weixin.qq.com/doc/oplatform/openApi/miniprogram-management/domain-management/api_geteffectivejumpdomain)
8.  `A` 新增 小程序支持 wasm 文件上传
9.  `A` 新增 模拟 wx.navigateToMiniProgram 小程序跳转的交互
10.  `A` 新增 wx.getGroupEnterInfo 调试支持
11.  `A` 新增 关闭项目前提示是否保存已修改的文件
12.  `A` 新增 cli 支持清除缓存操作
13.  `A` 新增 预览/真机调试新增代码包信息展示
14.  `A` 新增 worker 内支持网络、文件、音频等 API
15.  `U` 优化 小程序表单快速填写交互
16.  `U` 优化 增加 WXML 代码补全的 catch 事件
17.  `U` 优化 变更自定义编译条件时不会改动到 project.config.json
18.  `U` 优化 云开发相同的数据库索引建议只提示一次 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000022f9a708e0e4d4ca70e2356000)
19.  `U` 优化 内存空间中基础库缓存、工具插件缓存、预览的缓存残余
20.  `U` 优化 预览/上传时 miniprogramRoot 目录下有过大的 node\_modules 目录时的对比文件耗时
21.  `U` 优化 小程序内用 console 打印日志时在控制台显示的日志一级锚点的跳转位置
22.  `F` 修复 使用新文件监听模块 Windows 7 部分系统版本保存文件编译无效的问题
23.  `F` 修复 win 版无法访问网络位置的项目的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a66a8b34b200cefea31b4f5bc00)
24.  `F` 修复 工具栏隐藏后会挡住部分操作区域的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008c6feeec338fb75fa167da5bc00)
25.  `F` 修复 开发小游戏插件无法预览的问题
26.  `F` 修复 快捷键设置，需要点击空白处才能修改的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e8c16668458d1f9ba0d2cd50800)
27.  `F` 修复 1.03.2006090 版本通过 cli 预览小游戏项目时提示 app.json 找不到的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a2c17b2c8600ccf8ad054154400)
28.  `F` 修复 Kbone 项目 Promise 没有 resolve 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ce4de468dd0aa69fa057645b400)
29.  `F` 修复 调试器可能会白屏的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000aaa3644b98ff4bfa12cd35bc00)
30.  `F` 修复 设置了预览时保存文件，使用快捷键预览未能保存文件的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00040e10bfc4682af9faed18056000)
31.  `F` 修复 云开发开通无法自动刷新的问题
32.  `F` 修复 云开发共享环境报错的问题
33.  `F` 修复 云开发配额显示异常的问题
34.  `F` 修复 未开通云开发的账户无法使用环境共享的问题
35.  `F` 修复 云开发部分环境无法加载文件目录的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006c0c88744d06540fa47c1c56000)
36.  `F` 修复 WXML 面板样式编辑时 calc 中带 rpx 出错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e46fdba416043cbeaa004651400)
37.  `F` 修复 WXML 面板空白的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006a25de0cde8e972faaf38753c00)
38.  `F` 修复 Windows 版本打开安全设置白屏问题
39.  `F` 修复 页面中的 video 在 navigateTo 下个页面还播放声音的问题
40.  `F` 修复 WXML 代码注释方式可能错误的问题
41.  `F` 修复 win 版双击应用程序图标无法打开项目列表页的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004e81a874ce8952e2b69bb156800)
42.  `F` 修复 1.03.2009301 RC cli 调用 build-npm 无效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000020ceb58c3013c21bdab505b800)
43.  `F` 修复 控制台中输出非用户定义的字段内容的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c40994085583e981bbb92d51400)
44.  `F` 修复 win 版因 `filesystem.readFile` 接口没有关闭文件句柄导致清除文件缓存失败的问题
45.  `F` 修复 `wx.downloadFile` 返回的 downloadTask 无法 abort 的问题
46.  `F` 修复 WXML 面板中 shadow-root 下 scroll-view 里没有节点的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00002e89774e808961facc94857800)
47.  `F` 修复 WXML 文件中因存在 `<wxs />` 单闭合标签时代码着色、注释和格式化异常的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004a20941ceb8d33c1b1fdd456c00)
48.  `F` 修复 第三方平台小程序因 app.json 过大，且存在大量 page.json 时编译卡顿的问题

### [#](#_2020-09-15-更新说明) 2020.09.15 [更新说明](https://developers.weixin.qq.com/community/minihome/doc/00080625d34018e959fa7221255c01)

1.  `F` 修复 提示 `Converting circular structure to JSON` 的报错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ce603a38e28a7beea1d79550800)
2.  `F` 修复 onLaunch 里无法断点且网络请求无法显示的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002eafd948a601ad7eae0d0a52000)
3.  `F` 修复 模拟器区域不居中的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a0237d9073808d2eac466951000)
4.  `F` 修复 合并编译模式下，修改 js 文件无效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000eaeb2a4cc088fa8eaaf91d59c00)
5.  `F` 修复 推出动画异常导致模拟器显示白屏的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000ced3ce0260c5b0eac543d51800)
6.  `F` 修复 模拟器显示比例 50%，靠边阈值与展开宽度不理想的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000e4feb80b785faceaf823151c00)
7.  `F` 修复 自定义 tabBar 会挡住页面底部的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000aed0fa0f58ceabeac4c365a400)
8.  `F` 修复 切换编译条件后不生效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e6e51364a18f479ea14f1956c00)
9.  `F` 修复 图片不能在网络面板中预览的问题
10.  `F` 修复 命中断点后点击编译无效的问题
11.  `F` 修复 `wx.getExtConfig` 只有 complete 回调的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000682e22e45381f3efa5ddb05b800)
12.  `F` 修复 弹出模拟器后 wxml 面板不可用的问题
13.  `F` 修复 自动化脚本无法使用自动真机调试的问题
14.  `F` 修复 `wx.showTabBar` 无效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000846aa56c2204de5eaa738451c00)

### [#](#_2020-08-31-更新说明) 2020.08.31 [更新说明](https://developers.weixin.qq.com/community/develop/doc/000464f3ce0da01c2bea90f5351801)

1.  `A` 新增 设置调试器显示位置
2.  `A` 新增 双击模拟器空白处可以隐藏模拟器交互
3.  `A` 新增 记录项目窗口的显示大小
4.  `A` 新增 wxml/wxss/js 文件修改热重载
5.  `A` 新增 云控制台权限控制
6.  `A` 新增 云控制台静态网站托管配置
7.  `A` 新增 模拟器显示和隐藏切换时的表现设置
8.  `A` 新增 使用快捷键退出工具时提醒，防止误操作
9.  `A` 新增 登录后触发编译
10.  `A` 新增 插件权限校验
11.  `A` 新增 微信字体大小设置
12.  `A` 新增 支持代码按需注入lazyload
13.  `A` 新增 云开发数据库自动查询分析与索引提示
14.  `A` 新增 自动化支持获取体验评分报告
15.  `A` 新增 提供新的构建 npm 能力
16.  `A` 修复 旧app.json包含有index页面的情况下，删除app.json，重新建一个有index页面的app.json的时候，不会新增index页面
17.  `A` 新增 支持直接在自动预览界面切换推送到手机/桌面端微信
18.  `A` 新增 支持直接在自动真机调试界面切换推送到手机/桌面端微信
19.  `A` 新增 getPerformance 部分性能指标
20.  `U` 优化 MockApi 面板参数支持全匹配配置
21.  `U` 优化 AppData 面板焦点跳动问题
22.  `U` 优化 WXML 调试体验
23.  `U` 优化 真机调试文件准备速度
24.  `U` 优化 小程序模拟器的加载逻辑
25.  `U` 优化 公众号网页调试 URL 收藏后，hover 显示全部信息
26.  `U` 优化 创建代码片段时显示“请输入导入链接”等错误提示
27.  `U` 优化 安装模拟器插件后，需要手动重启才能使用
28.  `U` 优化 添加模拟器插件/调试器插件后，无须重启工具可正常运行
29.  `U` 优化 预览和真机调试的界面交互
30.  `F` 修复 macOS 10.15 无法获取摄像头授权导致 组件无法使用的问题
31.  `F` 修复 无法加载独立分包的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a8ecd0bc558c6dc9a82f7a51800)
32.  `F` 修复 小程序插件中有 app.wxss 文件，其内容会覆盖掉小程序的样式的问题
33.  `F` 修复 新建微信云开发项目，第一次启动会报 sitemap.json 未找到的问题
34.  `F` 修复 无法在 Network 面板看到 wx.uploadFile 的 Response 内容的问题
35.  `F` 修复 调试器面板 mock 右键菜单失效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00008c8e7ac5e0a8b97ab3a885b400)
36.  `F` 修复 使用 wasm 重新编译项目存在内存泄漏
37.  `F` 修复 自动预览tsc 失败一次后，再次预览无响应
38.  `F` 修复 模拟器在 Tabbar 设置为 top 时样式错乱的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a24629bcaf06e1b6a4e9aa56800)
39.  `F` 修复 游戏引擎弹窗分包逻辑失效
40.  `F` 修复 小游戏模拟器白屏，控制台提示\_\_virtualDOM\_\_未定义
41.  `F` 修复 FileSystemManager.stat 工具和真机返回的path格式不一致
42.  `F` 修复 小游戏开放数据域使用增强编译异常的问题
43.  `F` 修复 windows 项目列表界面，底部工具栏丢失的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c4cf38583f8aa1e9aff29f56800)
44.  `F` 修复 自定义 tabbar 文字展示不完整问题
45.  `F` 修复 wx.compressImage 返回 tmpFilePath 多了 undefined [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000eaba5a4db07b5d9a652435c000)
46.  `F` 修复 Windows 下最大化可能遮挡任务栏的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e8c3dde874888579a9bd5f51800)
47.  `F` 修复 wx.compressImage 返回错误 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000eaba5a4db07b5d9a652435c000)
48.  `F` 修复 首次编译 wx.getLaunchOptionsSync 结果可能错误的问题
49.  `F` 修复 WXML/WXSS 压缩错误问题
50.  `F` 修复 从网页点击导入代码片段会导致工具卡死
51.  `F` 修复 windows 关闭新版文件监听模块后，保存project.config.json时会报错
52.  `F` 修复 修改 project.config.json 里的 appid 不生效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e2ed1b20b486cb28a3223851800)
53.  `F` 修复 导入链接项目已被删除时能够打开的问题
54.  `F` 修复 模拟器底部有可能闪现白条的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c229f22cb48632ddac917d56400)
55.  `F` 修复 WXML 面板伪类无法调试的问题
56.  `F` 修复 切换企业微信模拟器插件失败的问题
57.  `F` 修复 Mac版开发者工具在扫码登录页无法设置代理的问题
58.  `F` 修复 切换模拟器网络状态时报错的问题

### [#](#_2020-06-19-更新说明) 2020.06.19 [更新说明](https://developers.weixin.qq.com/community/develop/doc/000cccda3d45606c618a91a7b51001)

1.  `A` 新增 终端面板
2.  `A` 新增 查看并管理开发者工具相关进程
3.  `A` 新增 云开发静态资源托管 [详情](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/guide/staticstorage/introduction)
4.  `A` 新增 小程序设置页面中增加订阅消息开关
5.  `A` 新增 小程序强制更新调试支持 [详情](https://developers.weixin.qq.com/minigame/dev/api/base/update/UpdateManager.applyUpdate.html)
6.  `A` 新增 小程序/小游戏 收藏事件调试 [详情](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/favorite)
7.  `A` 新增 通用设置-项目关闭时，控制项目关闭时是否直接打开项目列表窗口
8.  `A` 新增 通用设置-快速打开文件，控制模拟器区域底部状态栏点击页面路径时打开的文件类型
9.  `A` 新增 搜索回调调试插件
10.  `A` 新增 小游戏脚本录制插件
11.  `A` 新增 模拟器-模拟操作-事件模拟-内存警告
12.  `A` 新增 支持音视频合成调试 [详情](https://developers.weixin.qq.com/miniprogram/dev/api/media/video-processing/wx.createMediaContainer.html)
13.  `A` 新增 代码上传后可以下载对应的 sourcemap 文件
14.  `F` 修复 编辑器 WXML 文件格式化快捷键失效的问题
15.  `F` 修复 调试器位置顺序无法拖动排序的问题
16.  `F` 修复 打开快捷键设置后，编辑器 ctrl/cmd + f 快捷键无法触发文件内搜索的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00046aee570be093376acca3e5bc00)
17.  `F` 修复 cli 命令行当项目路径有中文的情况下无法正常启动的问题
18.  `F` 修复 新建代码片段时生成多个 sitemap.json 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002ac215cc94841b86a4d7ab5d000)
19.  `F` 修复 mac 版无法读取系统设置的 PATH 环境变量的问题
20.  `F` 修复 云函数本地调试没有日志的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004ac7f430a88cf533ab6d5051c00)
21.  `F` 修复 API 代码自动补全时按字母序排序不友好的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e06d80303108aa32aa775251400)
22.  `F` 修复 版本更新通知时，如未选择更新，后续手动检查更新时一直提示正在下载的问题
23.  `F` 修复 win 版通知中心顶部操作按钮被遮挡的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002ea78e4cce809fc5a1deb151000)
24.  `F` 修复 小游戏 video 缺少 onVideoProgress 事件回调的问题
25.  `F` 修复 1.03.2005140 终止模拟器导致工具奔溃的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002e028b20fb879377a0276551c00)
26.  `F` 修复 1.03.2005140 多账号调试窗口编译会导致主项目窗口模拟器崩溃的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004a2e9640d405f886a7c09e5b000)
27.  `F` 修复 1.03.2005140 激励视频广告自动显示并无法关闭的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000244b7748460cc926a91f6e5b400)
28.  `F` 修复 独立分包代码被执行两遍的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ea4e8aeca1040507a4701451000)
29.  `F` 修复 菜单栏新建或导入项目可能没反应的问题
30.  `F` 修复 模拟器在 Tabbar 设置为 top 时样式错乱的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a24629bcaf06e1b6a4e9aa56800)
31.  `F` 修复 Mock 的规则无法删除的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00008c8e7ac5e0a8b97ab3a885b400)
32.  `F` 修复 自定义预览前预处理命令失败后，再次预览无响应的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002ca2bba4628bda749142165bc00)
33.  `F` 修复 新创建的小游戏项目第一次编译可能提示 `__virtualDOM__ is not defined` 的问题
34.  `F` 修复 project.config.json 内容不正确时，无法新建自定义编译条件的问题
35.  `F` 修复 project.config.json 中 watchOptions.ignore 删除部分配置后，重启工具无法生效的问题

### [#](#_2020-05-25-更新说明) 2020.05.25 [更新说明](https://developers.weixin.qq.com/community/develop/doc/000442eec00020707c6ac3dfb59c01)

1.  `A` 新增 云函数灰度功能
2.  `A` 新增 云控制台支持微信支付
3.  `A` 新增 导入代码片段时，若无填写 appid，默认使用测试号
4.  `A` 新增 接入 miniprogram-ci 编译模块
5.  `A` 新增 wxml 面板 支持 delete/backspace 进行节点删除操作
6.  `A` 新增 支持安装在不同路径下并能够同时使用
7.  `A` 新增 小程序插件的版本 version 字段支持 "latest"
8.  `A` 新增 云控制台直接开通按量付费功能
9.  `A` 新增 去掉小程序跳转小程序的限制
10.  `U` 优化 设置页面
11.  `U` 优化 win 版的标题栏视觉、交互
12.  `U` 优化 模拟器胶囊菜单视觉、交互
13.  `U` 优化 项目窗口默认在屏幕居中打开，避免窗口在屏幕外导致无法显示窗口的表现
14.  `U` 优化 小程序页面跳转速度
15.  `U` 优化 可以选择关闭当前网络使用非安全代理的提示
16.  `U` 优化 快速回退功能只保留最近三个版本 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000025e0f471052d60a115e856000)
17.  `F` 修复 wxml 面板 rpx 计算错误的问题
18.  `F` 修复 小窗口时无法显示多账号选择窗口的确定按钮的问题
19.  `F` 修复 模拟器静音对视频无效的问题
20.  `F` 修复 wxml 文件中有 wxs 语法错误无法正常提示的问题
21.  `F` 修复 使用新版编译模块小游戏开放数据域无法使用的问题
22.  `F` 修复 console 面板中快速申请点击无效的问题
23.  `F` 修复 小游戏模拟器弹出时顶部有白条的问题
24.  `F` 修复 无法更改字体设置的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ece128e4030b3f5e783cd851800)
25.  `F` 修复 project.config.json 中有 pluginRoot 字段时，会导致小程序页面样式丢失的问题
26.  `F` 修复 自定义预处理命令的输入体验问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000048230c04082e0c2a467915b400)
27.  `F` 修复 模拟器静音时会有报错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ca65f6a48b83a2a3a1b34d51000)
28.  `F` 修复 wxml 面板 componentData 页卡 boolean 字段无法显示的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006027710012044fe0aa10c15c000)
29.  `F` 修复 wxml 面板无法显示动态传入的图片 src 的问题
30.  `F` 修复 项目多开时，当一个项目打开真机调试的情况下直接关闭项目，另一个项目无法启动真机调试的问题
31.  `F` 修复 项目重命名后，通过菜单无法重新打开该项目的问题
32.  `F` 修复 network 面板云开发请求中文乱码的问题
33.  `F` 修复 PC 端模拟 touchend 缺少 changedTouches 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00048caaebc1e0586e0a6001a51800)
34.  `F` 修复 开发者工具打开项目时突然报错 illegal operation on a directory 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002e63ce94ea02c02f9508b651800)

### [#](#_2020-04-02) 2020.04.02

1.  `F` 修复 32 位系统无法编译小程序、提示重启耗时过久的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006a2c1330fc8d6282ac61685e400)
2.  `F` 修复 某些第三方工具不对中文进行转译导致项目打开失败的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000624457ca70f7fa1a5a67b5f400)
3.  `F` 修复 ts 项目编译前命令无限执行的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000264e80a4e18a9b51a9b1445c000)

### [#](#_2020-03-25-更新说明) 2020.03.25 [更新说明](https://developers.weixin.qq.com/community/develop/doc/0000c4f9440410caa11ab51cd5b801)

1.  `A` 新增 云开发控制台支持开通按量付费
2.  `A` 新增 云开发支持数据库备份与回档（还原）[详情](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/guide/database/backup)
3.  `A` 新增 支持小程序自动化多账号调试
4.  `A` 新增 显示灰度中的基础库以及基础库支持的客户端版本 [详情](project#显示基础库支持的客户端版本)
5.  `A` 新增 下发测试基础库 [详情](project#下发测试基础库)
6.  `A` 新增 支持模拟 API 的返回内容 [详情](api-mock)
7.  `A` 新增 支持同时重命名多个同名的文件
8.  `A` 新增 真机调试出现异常时，可手动操作重试
9.  `A` 新增 增加工具加载 loading 展示
10.  `A` 新增 模拟器支持终止
11.  `A` 新增 支持小游戏代码补全
12.  `U` 优化 模拟器工具栏及状态栏界面
13.  `U` 优化 云开发控制台监控图表展示
14.  `U` 优化 模拟器添加边框 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006428dd9c17853af99e4eb358c00)
15.  `U` 优化 更新命令行和 HTTP v2 版本 [详情](https://developers.weixin.qq.com/miniprogram/dev/devtools/cli)
16.  `F` 修复 修改 cloudFunctionRoot 会出现文件找不到的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000ee531dc868f4daf9cf2a85ac00)
17.  `F` 修复 不能正确打开已被删除文件夹的项目的问题
18.  `F` 修复 点击菜单工具栏管理无反应的问题
19.  `F` 修复 工具外修改项目配置 cli 上传不生效的问题
20.  `F` 修复 工具预览/上传提示文件已经存在的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008e4001d8d80948fe94efc956000)
21.  `F` 修复 调试器放大会导致 inspect 按钮样式异常的问题
22.  `F` 修复 模拟器工具栏样式异常
23.  `F` 修复 `wx.addPhoneContact`时顶部按钮显示错误的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00046ed5c2c8683137d9c28475bc00)
24.  `F` 修复 标题栏文字过长覆盖胶囊按钮的问题
25.  `F` 修复 文件系统读取代码包内文件规则与真机不一致的问题
26.  `F` 修复 关闭多账号调试窗口 tabbar 内的 icon 无法加载的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004e2f06f099810fa99e6c615b800)
27.  `F` 修复 预览上传错误提示无效的 json 文件 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c4ea94a4038bcfbb9edfe251800)
28.  `F` 修复 使用非等宽字体时光标可能错位的问题
29.  `F` 修复 某些项目可能出现 wxml not found 的问题
30.  `F` 修复 真机调试 Appdata 和 WXML 面板可能显示空白的问题
31.  `F` 修复 弹出模拟器时 getMenuButtonBoundingClient 调用结果为空的问题
32.  `A` 新增 支持小程序自动化截图功能
33.  `A` 新增 编辑器面包屑导航条支持自定义快捷导航
34.  `A` 新增 模拟小程序进程销毁重启
35.  `A` 新增 编辑器行内错误和警告提示
36.  `A` 新增 Mac 和 Windows 微信的模拟器类型
37.  `U` 优化 1.02.1912261 的安装包结构
38.  `U` 优化 MacOS 版关闭项目窗口时，显示项目列表窗口
39.  `U` 优化 插件开发模式下 miniprogramRoot 下 app.json 中插件 provider 与项目 appid 一致时，version 必须为 "dev"
40.  `F` 修复 1.02.1912261 引入的多账号调试 tabBar 图标无法加载的问题
41.  `F` 修复 1.02.1912261 引入的 jsserverRoot 目录右键菜单缺失部分选项的问题
42.  `F` 修复 公众号网页调试中，Base64 图片无法通过调试器打开的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000424e3414b38847d89dd6d25b400)
43.  `F` 修复 cli 调用自动预览无法使用自定义编辑条件的问题
44.  `F` 修复 Windows 版无法使用录音功能的问题
45.  `F` 修复 插件开发模式下，插件页面配置不生效的问题
46.  `F` 修复 小游戏开放数据域使用增强编译报错的问题
47.  `F` 修复 Windows 版某些情况下无法显示项目窗口的问题
48.  `F` 修复 切换 cloudfunctionsRoot 无法同步云函数的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000c2598004b019ada9e509456400)
49.  `F` 修复 Wxml 面板丢失 text 标签子节点的问题
50.  `F` 修复 上传时文件体积大小提示错误问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00022eb2918f805079a9c366256c00)
51.  `F` 修复 使用非等宽字体时光标可能错位的问题
52.  `F` 修复 文件系统 api 读取代码包内文件规则与真机不一致的问题
53.  `A` 新增 编辑器全局替换
54.  `A` 新增 编辑器分栏
55.  `A` 新增 编辑器文件多选操作和拖动到文件夹
56.  `A` 新增 编辑器多选操作和拖动到文件夹
57.  `A` 新增 编辑器代码大纲
58.  `A` 新增 编辑器文件对比
59.  `A` 新增 选取 android 设备上的 profile 文件进行分析 [详情](profile)
60.  `A` 新增 WXML 面板支持自定义组件数据查看与实时修改
61.  `A` 新增 WXML 面板支持使用键盘 (上下左右) navigate the DOM tree
62.  `A` 新增 WXML 面板支持右键操作 Hide element/Delete element/Scroll Into View/Collapse children/Expand recursively
63.  `A` 新增 云控制台数据库高级查询支持聚合操作 [详情](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/guide/database/console-dbscript)
64.  `A` 新增 云控制台支持自定义告警 [详情](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/guide/operations/alarm)
65.  `A` 新增 云控制台用户访问 DAU 图表
66.  `A` 新增 云控制台自定义数据库读写权限
67.  `A` 新增 PC 微信小程序调试支持
68.  `A` 新增 `wx.getSystemInfo` 返回 `deviceOrientation` 信息
69.  `A` 新增 page meta 支持 [详情](https://developers.weixin.qq.com/miniprogram/dev/component/page-meta.html)
70.  `A` 新增 支持小程序拓展包 [详情](https://developers.weixin.qq.com/minigame/dev/reference/configuration/app#useextendedlib)
71.  `A` 新增 清除订阅消息授权数据
72.  `U` 优化 编辑器
73.  `U` 优化 大型项目目录结构缓存优化
74.  `U` 优化 `<web-view />` 组件页面的调试入口位置
75.  `F` 修复 小游戏 `wx.getMenuButtonBoundingClientRect` 返回异常的问题
76.  `F` 修复 插件页面配置不生效的问题
77.  `F` 修复 `App.onLaunch` 执行两次的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008662e8a0b404c3f89a145e5b400)
78.  `F` 修复 项目列表丢失的问题
79.  `F` 修复 `onPageNotFound` 没有触发的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000e4e9a4085869977962a2757800)
80.  `F` 修复  云函数请求大量并发时可能会在小程序 network 面板漏展示的问题
81.  `F` 修复 调试器中开启 disableCache 对渲染层无效的问题
82.  `F` 修复 模拟器录音不触发 `onFrameRecorded` 回调的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/)
83.  `F` 修复 小游戏 wx.onKeyboardComplete 回调没有触发的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ae4ab214a081c73389dcb55c000)
84.  `F` 修复 页面跳转后触发 onShow 时场景值为 null 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006eedb688ca8bfb279af15851800)
85.  `F` 修复 app.json 使用 usingComponents 导致工具卡死的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000cc20ee054007ea990070951c00)

### [#](#_2019-12-02-更新说明) 2019.12.02 [更新说明](https://developers.weixin.qq.com/community/develop/doc/000ca485d088388d9379d646c56c01)

1.  `A` 新增 文档搜索
2.  `A` 新增 支持引用小程序开发版插件
3.  `A` 新增 云控制台高级日志功能
4.  `A` 新增 公众号网页调试收藏地址允许删除
5.  `A` 新增 小程序快速启动模板默认使用新的组件样式 [详情](https://developers.weixin.qq.com/minigame/dev/reference/configuration/app#style)
6.  `A` 新增 小游戏支持 `loadFont` 接口
7.  `A` 新增 在控制台中显示当前页面 `scope-data` 校验出错信息
8.  `A` 新增 云函数本地调试支持 Network 面板
9.  `A` 新增 支持主包页面直接跳转到分包内的插件页面
10.  `A` 新增 `project.config.json` 中增加 `watchOptions` 字段支持忽略部分文件的监听 [详情](projectconfig#)
11.  `F` 修复 WXML 代码中没有引号闭合时没有报错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a8eb74c40907b1969eac4351800)
12.  `F` 修复 使用 npm sval 模块时异常的问题
13.  `F` 修复 CLI/HTTP 调用上传操作因超时导致报错 `Error: socket hang up` 的问题
14.  `F` 修复 工具自动更新后使用 CLI 启动工具时路径错误的问题
15.  `F` 修复 云开发控制台中无法删除 \_id 为数字的记录 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000ec70e8cb00a30749fa1e254c00)
16.  `F` 修复 使用 packOptions.ignore 了自定义组件，小程序运行时还是会报对应组件未找到的问题
17.  `F` 修复 某些情况下上传代码会报 `cannot read property true_true_true_false_production of undefined` 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ce8951acb90367959f7b4951c00)
18.  `F` 修复 有大量 js 文件的小程序项目在点击预览后工具无法响应的问题
19.  `F` 修复 设置 storage 后立即关闭工具并重启，之前设置的数据无法生效的问题
20.  `F` 修复 主进程中无法收到 worker 的消息的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000602d65042b0a2bf598014851000)
21.  `F` 修复 增强编译在 ios8 下计算属性名语法错误的问题 [详情](https://github.com/babel/babel/issues/10503#issuecomment-536111179)
22.  `F` 修复 将小游戏项目的 appid 直接修改成小程序的 appid 会导致模拟器消失的问题
23.  `F` 修复 Page 实例上 getOpenerEventChannel 方法丢失的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000aa0c2cb4b58410a5968dee56000)
24.  `F` 修复 小程序插件开发时，修改插件的 json 文件无法生效的问题

### [#](#_2019-10-21-更新说明) 2019.10.21 [更新说明](https://developers.weixin.qq.com/community/develop/doc/000aaef24f4ee0b36e59755895b801)

1.  `A` 新增 云开发新增 19 个付费套餐 [详情](https://developers.weixin.qq.com/miniprogram/dev/server/API/openApi-mgnt/api_clearapiquota)
2.  `A` 新增 导航条中新增小程序返回首页功能
3.  `A` 新增 `wx.chooseLocation` 支持传入指定地点
4.  `A` 新增 云控制台告警设置支持关闭相应告警渠道
5.  `A` 新增 真机调试支持直接触发客户端周期性更新 [查看文档](periodic-data)
6.  `A` 新增 通用设置增加“使用新版文件监听模块”的设置（默认勾选）
7.  `A` 新增 新建项目页面增加测试号文档介绍入口
8.  `A` 新增 记录代码上传的更新类型
9.  `A` 新增 支持导入二维码创建自定义编译条件时
10.  `A` 新增 通用设置调试器最大日志行数
11.  `A` 新增 公众号网页调试增加清除全部缓存按钮
12.  `A` 新增 本地编译时使用合并编译
13.  `A` 新增 WXML 面板 scopeData 校验提示
14.  `A` 新增 PC 微信开发版小程序自动预览
15.  `A` 新增 自动真机调试
16.  `A` 新增 多账号调试默认测试账号
17.  `A` 新增 周期性更新调试支持
18.  `A` 新增 云开发控制台代金券支付
19.  `A` 新增 多线程 worker 支持单步调试
20.  `A` 新增 公众号网页调试中新增 url 收藏夹
21.  `A` 新增 wx.compressImage 调试
22.  `A` 新增 小游戏关系链互动数据开发支持
23.  `A` 新增 支持小游戏 JSServer
24.  `A` 新增 小游戏节点审查插件
25.  `A` 新增 云开发环境中的存储桶被删除时，支持在云控制台中创建存储桶
26.  `A` 新增 新建 Page 失败后会给出失败提示
27.  `A` 新增 JSServer 支持文件 diff
28.  `A` 新增 不再存储 project.config.json 里自定义编译条件的 current 值
29.  `A` 新增 云控制台支持全局开启/关闭云函数消息推送
30.  `A` 新增 项目重命名功能 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002c42c0745a0cf6f090a6be5bc00)
31.  `A` 新增 编译模式记录通过二维码编译的条件
32.  `U` 优化 再次打开项目时的首次编译速度
33.  `U` 优化 GPU 加速默认打开
34.  `U` 优化 增加 navigationBarBackgroundColor 是否为合法颜色值的监测提示
35.  `U` 优化 只有未授权时直接调用 `wx.getUserInfo` 才会出现升级提示
36.  `U` 优化 wx.downloadFile() 指定路径时增加检测文件大小
37.  `U` 优化 下线云真机测试功能
38.  `U` 优化 小程序插件的版本不正确的时候的提示
39.  `U` 提升了真机调试的稳定性
40.  `F` 修复 \` 组件在基础库 2.8.2 报错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000082b98c03200e3a291e70a51000)
41.  `F` 修复 播放临时文件时连续获取播放时间导致工具卡死的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00046085894de8f15c29bfb4e5b400)
42.  `F` 修复 miniprogramRoot 为 "/" 时编译报错的问题
43.  `F` 修复 代码保护异常时没有报错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006088dad03d0a07f39652045b000)
44.  `F` 修复 npm 构建时 `Uncaught TypeError: Cannot redefine property` 错误
45.  `F` 修复 真机调试可能报错模块损坏的问题
46.  `F` 修复 文件修改后编译不生效的问题
47.  `F` 修复 展开文件夹时，目录树焦点不正确的问题
48.  `F` 修复 预览时报文件已经存在的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008e020a80968725b2992c9251000)
49.  `F` 修复 删除用户数据目录后开发者工具启动不了的问题
50.  `F` 修复 未使用体验评分时存在内存泄漏的情况
51.  `F` 修复 切换页面偶现 WXML 面板内容丢失问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e6c06ea4e104e6a399a61751400)
52.  `F` 修复 调试 WXML 面板 rpx 计算错误导致样式错乱的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000862e31c730d33039a0ab455400)
53.  `F` 修复 WXML 面板三目运算符不会更新的问题
54.  `F` 修复 修改页面文本节点 WXML 面板没有同步的问题
55.  `F` 修复 `project.config.json` 中 `packOptions.ignore` 规则命中的文件夹中存在 `__` 开头和结尾的文件夹时无法预览的问题
56.  `F` 修复 状态栏一直在 loading 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006629cb58e80d38539e31915b000)
57.  `F` 修复 `wx.downloadFile` 下载文件后缀名存在不正确的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e0262e7854071af29359005b400)
58.  `F` 修复 云控制台不能删除文件名中含 emoji 的文件
59.  `F` 修复 UDP 不能发送 ArrayBuffer 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e8ea8fec2c070b909ecdb056400)
60.  `F` 修复 `1.02.1909051` 引入的上传时进行代码保护异常的问题
61.  `F` 修复 因基础库中引用的文件网络请求超时导致模拟器加载小程序慢的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006067c9b8468edf209a94595b000)
62.  `F` 修复 PC 意外断电导致代码文件乱码的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002cc6c43c180aa64a8de0aa5bc00)
63.  `F` 修复 `<web-view/>` 返回异常的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000eee9cedce08b348b8521d456c00)
64.  `F` 修复 小游戏出现 `Uncaught TypeError: Illegal invocation` 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004604f278d78d07098ff7ff51800)
65.  `F` 修复 打开任意文件然后删除该文件再重新建立该文件时，不能立即进行编辑的问题
66.  `F` 修复 小程序插件开发时，修改 plugin.json 中 publicComponents 无法立即生效的问题
67.  `F` 修复 小程序内webview页面返回上一级原生页面需要点击两次才能返回的问题[反馈详情](https://developers.weixin.qq.com/community/develop/doc/00046eda624970de3bd8a0eaa56800)
68.  `F` 修复 WXML 面板编辑 style 时失焦的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00008c7eb945502657f89091b5c800)
69.  `F` 修复 wx.setBackgroundColor 不生效的问题
70.  `F` 修复 编辑器删除某文件再创建该文件后不能立即编辑的问题
71.  `F` 修复 多账号时删除 log 文件失败的问题
72.  `F` 修复 减少编辑器保存代码时发生异常情况（如突然断电）后代码变成乱码的概率 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002cc6c43c180aa64a8de0aa5bc00)
73.  `F` 修复 公众号网页调试网址栏在特定情况下无法删除 URL 的 bug
74.  `F` 修复 增强编译下使用类装饰器语法编译报错的问题
75.  `F` 修复 打开项目后立即执行预览/真机调试时报错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ece1c2bc7c8d9baf8c65e356c00)
76.  `F` 修复 Wxml 面板调试 CSS 时注释无效重复样式
77.  `F` 修复 小程序的 WebView 里无法调用 `wx.chooseImage` 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a2452508920822f094092356000)
78.  `F` 修复 云控制台在深色主题下，欢迎页文本颜色变白的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002a6eb69cdf06afdf8e0aa051400)
79.  `F` 修复 小游戏模拟器鼠标移开模拟器区域后有时会报错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000cea2ec0c878865bf8a21a55c800)
80.  `F` 修复 编辑器保存时有概率滚回顶部的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a68189a0bd09d1f096575a56c00)
81.  `F` 修复 覆盖安装时 Wxml 面板调试 CSS 时注释无效重复样式 bug 依然存在的问题
82.  `F` 修复打开多个项目窗口时，云开发控制台可能打不开的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002ae7cf38b605f69093319b56000)
83.  `F` 修复 小程序插件开发修改 plugin.json 不生效的问题
84.  `F` 修复项目多开时，某些机型顶部会出现黑条的问题
85.  `F` 修复 在特定缩放模式下工具栏抖动的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000048556140709cdde8255a154c00)
86.  `F` 修复 增强编译下多线程 worker 提示 loadBabelMod is not define 的问题
87.  `F` 修复 多账号调试窗口无法复制粘贴的问题
88.  `F` 修复 在某些情况下自定义分析页面点不了的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000cc438c8250e799f8036f351c00)
89.  `F` 修复 setData 回调函数中出错没有提示的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004c61a9c0190dcf10957bcf5b800)
90.  `F` 修复 WXML 面板编辑时失去焦点的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000aa6079e89004501e81a29951400)
91.  `F` 修复 编辑器目录展开或关闭时会自动定位到当前 tab 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000844904cc19085adf8658b357000)
92.  `F` 修复 工具项目窗口全屏下点击窗口关闭按钮会出黑屏的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00048e444e0220f284f870f9857800)
93.  `F` 修复 未写在 app.json pages 中的页面文件会被主动注册的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000e8253d0da0fba509670f453400)
94.  `F` 修复 设置快捷键在其他项目窗口失效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00022e8cf58fd87088b8abb0c51c00)
95.  `F` 修复 选择视频时，视频声音自动播放的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000086e45c6b855b5c8d8c1f51000)
96.  `F` 修复 自定义导航栏在页面切换时渲染错误 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00002cf30a4a90c76fe82a7a856c00)

### [#](#_2019-08-13-更新说明) 2019.08.13 [更新说明](https://developers.weixin.qq.com/community/develop/doc/00084263630078100009c962854401)

1.  `A` 新增 小程序支持自动化测试
2.  `A` 新增 预览当前页面
3.  `A` 增加 云控制台中监控图表的数据总和显示
4.  `A` 新增 setTabBarItem 支持临时文件和网络路径 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00040839244618a69376d26715b400)
5.  `A` 新增 公众号调试网址栏下拉菜单点击URL路径后自动跳转
6.  `A` 新增 通用设置——使用GPU加速模式（默认关闭）
7.  `A` 新增 云开发控制台支持黑色主题
8.  `A` 新增 云开发控制台支持购买和变更套餐 [查看文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/billing/adjust-quota)
9.  `A` 新增 版本管理支持直接 checkout 远程分支
10.  `U` 优化 文件监听模块
11.  `U` 优化 体验评分 UI
12.  `U` 优化 非 miniprogramRoot 目录下文件的修改不会触发编译
13.  `F` 修改 Wxml 的 text 标签内容后页面不能同步更新
14.  `F` 修复 调试器点击临时文件地址打不开的问题
15.  `F` 修复 `1.02.1907160` 版本小游戏分包加载异常的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ea83b18cb709e3ee80cc7b51400)
16.  `F` 修复 小游戏 websocket 连接期间切换 offline 无效的问题
17.  `F` 修复 调整模拟器窗口大小操作时鼠标指针在模拟器窗口内释放后会失效的问题
18.  `F` 修复 backgroundColorTop/Bottom 只因在 iOS 模拟时生效
19.  `F` 修复 使用 componentGenerics 导致编译错误的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006609cbc0ed0920ae843e655b400)
20.  `F` 修复 顶部按钮返回首页时首页无法正常渲染加载的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000460346a4c605d9fb80e08051c00)
21.  `F` 修复 wxml 面板多个选择器共用样式时调试不了样式的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00044c30cc44d0ff8987fedb056000)
22.  `F` 修复 `1.02.1907232` 版可能导致 `bindtap` 失效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00026e42d9ccc82363e8eb84f5c000)
23.  `F` 修复 `1.02.1907242` 引入的 npm 自定义组件模块引用不到的问题
24.  `F` 修复 修改语言重启后不生效的问题
25.  `F` 修复 页面返回 wxml 面板伪类信息丢失的问题
26.  `F` 修复 wxml 面板伪类信息匹配错误的问题
27.  `F` 修复 控制台数据库点击数字id的记录没有展示的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00022adcb88ab023fad8a356e51800)
28.  `F` 修复 顶部按钮返回首页时首页无法正常渲染加载的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000460346a4c605d9fb80e08051c00)
29.  `F` 修复 调整模拟器窗口大小操作时鼠标指针在模拟器窗口内释放后会失效的问题

### [#](#_2019-07-16-更新说明) 2019.07.16 [更新说明](https://developers.weixin.qq.com/community/develop/doc/000c8abaa7c6b074f4e87321756401)

1.  `A` 新增 云控制台支持执行数据库脚本/CRUD 高级操作 [详情](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/guide/database/console-dbscript)
2.  `A` 新增 云控制台全局设置
3.  `A` 新增 云控制台支持消息推送配置 [详情](https://developers.weixin.qq.com/miniprogram/dev/server/API/openApi-mgnt/api_clearapiquota#usecase-callback)
4.  `A` 新增 云控制台配额展示
5.  `A` 新增 云控制台监控图表
6.  `A` 新增 云控制台查看云函数详情
7.  `A` 新增 云函数支持单文件更新
8.  `A` 新增 Network 面板显示云调用信息
9.  `A` 新增 内置 ES6+ 语言转义能力增强 [详情](codecompile#增强编译)
10.  `A` 新增 任务通知中心
11.  `A` 新增 上传时版本号推荐
12.  `A` 新增 云开发云调用快速启动模板
13.  `A` 新增 素材管理，不再维护的提示
14.  `A` 新增 工具联动 sitemap，控制台显示当前页面是否索引 [详情](../framework/sitemap.md)
15.  `A` 新增 project.config.json 中新增设置 uploadWithSourceMap [详情](projectconfig#项目配置文件)
16.  `A` 新增 增加设置是否工具启动默认打开项目
17.  `A` 新增 小程序 `cover-view` 支持
18.  `A` 新增 `cover-view` 支持全屏
19.  `A` 新增 小程序插件还原原始 sourcemap
20.  `A` 新增 小程序 network 展示图片
21.  `A` 新增 nightly 的快速更新机制
22.  `A` 新增 版本管理支持删除远程仓库
23.  `A` 新增 版本管理支持删除 Tag
24.  `A` 新增 自定义编译条件增加过滤
25.  `A` 新增 编辑设置——上传前保存所有文件
26.  `A` 新增 增加通用设置
27.  `A` 新增 通用设置——修改默认项目路径
28.  `A` 新增 非第三方小程序存在 `ext.json` 时出 warning 提示
29.  `A` 新增 快速体验开发版菜单项
30.  `A` 新增 新建编译模式时，自动命名模式名称 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c023e7e8398d0d9b88f63752000)
31.  `A` 新增 cli 自动预览支持自定义编译条件 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c049e68c478dbfd88f9cab55c00)
32.  `A` 新增 cli 指定开发者工具启动时监听的服务端口号
33.  `A` 新增 `wx.getSystemInfo` 返回 `safeArea`
34.  `A` 新增 `FileSystemManager.stat` 支持 `recursive` 参数
35.  `A` 新增 iPhone XS Max 尺寸
36.  `A` 新增 体验评分支持小游戏
37.  `A` 新增 体验评分支持 “iPhone X兼容” 检验规则
38.  `A` 新增 小程序插件快速申请
39.  `A` 新增 控制台新增命令 `cleanAppCache`
40.  `U` 更新 Win 版升级 nwjs 到 0.37.5
41.  `U` 更新 Mac 版升级 nwjs 到 0.38.5
42.  `U` 更新 wxml 属性自动补全采用双引号
43.  `U` 优化 项目详情的交互
44.  `U` 优化 云函数代码上传
45.  `U` 优化 上传时的备注详情可以多行输入
46.  `U` 优化 移除菜单栏界面左 / 右移模拟器选项 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008021f8d87d0eb6288ea1275bc00)
47.  `U` 优化 任务进度框和通知中心的文本应可以复制
48.  `U` 优化 视觉调整，弹出模拟器/调试器，界面上不需要有个收回的，关闭窗口即是收回
49.  `U` 优化 模拟器的最小边距改小
50.  `U` 优化 任务状态栏展示优化
51.  `F` 修复 分包中使用自定义组件时出现渲染层错误 `cannot read property "length" of undefined` 的问题
52.  `F` 修复 `app.json` 中应用全局 npm 组件报错 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a40abe1c2b0e19f789c7af51c00)
53.  `F` 修复 小游戏 `wx.shareAppMessage` 不带 `imageUrl` 参数无法调用的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004226a558a305815b8d1ec35ec00)
54.  `F` 修复 cli 调用登录时未使用工具代理设置的问题
55.  `F` 修复 云函数本地调试时环境变量中有中文时云函数发起调用失败的问题
56.  `F` 修复 `1.02.1906141` 引入的真机调试无法查看网络请求的返回包的问题
57.  `F` 修复 上传时使用代码保护导致 workers 报错的问题
58.  `F` 修复 npm 构建后 module.exports 动态设置的变量获取不到的问题
59.  `F` 修复 公众号网页调试接口调用没有回调的问题
60.  `F` 修复 在分包目录下新建 page 时异常的问题
61.  `F` 修复 公众号网页调试 `wx.checkJsApi` 返回格式错误的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000402b59f80188e7d88a630851400)
62.  `F` 修复 `<camera />` 组件无法使用的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00042ae5bdc96812438882cb056800)
63.  `F` 修复 当小游戏断点时，点击编译按钮没有效果的问题
64.  `F` 修复 分包页面如果没有 json 文件时该页面无法使用全局组件的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000068ae9288780a8da8b8f9e56000)
65.  `F` 修复 多开项目时项目之间的断点会互相影响的问题
66.  `F` 修复 mac 版开发者工具无法显示项目窗口的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000006ba678700298ba8ca0fd51000)
67.  `F` 修复 独立分包使用增强编译异常的问题
68.  `F` 修复 Wxml 修改样式时自动失去焦点的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000848d9144040abf488957e256c00)
69.  `F` 修复 Wxml 面板样式无法选择的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004c24352c108fe43a852fdb5b800)
70.  `F` 修复 Wxml 面板样式权重计算错误的问题
71.  `F` 修复 Network 面板耗时显示异常的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c08946b02a8a47298f295951400)
72.  `F` 修复 编辑器提示区域丢失文档说明的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ae071684928526b98bb0d251000)
73.  `F` 修复 安全设置面板端口号无法选中的问题
74.  `F` 修复 getMenuButtonBoundingClientRect 返回错误值的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00042213330dd0946d88e559d5bc00)
75.  `F` 修复 第三方小程序出现企业微信小程序模式的问题
76.  `F` 修复 调试器没有弹出按钮的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008021f8d87d0eb6288ea1275bc00)
77.  `F` 修复 代码只启用压缩混淆时报错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00024c2148c648bb6588261b951c00)
78.  `F` 修复 插件 md 文档点击预览白屏的问题
79.  `F` 修复 页面跳转导致界面无法选择的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000ce7523c4583b6988af84252800)
80.  `F` 修复 进入网页调试后再导入项目报错的问题
81.  `F` 修复 wxml 面板样式文件路径不显示的问题
82.  `F` 修复 切换网络模拟时调试器报错的问题
83.  `F` 修复 增强编译 ignore 功能在预览上传时不生效的问题
84.  `F` 修复 extAppid 不合法时禁止上传代码
85.  `F` 修复 工具自动添加不必要 wxss 文件的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0006288ccd4948db54880924858400)
86.  `F` 修复 packoption.ignore 配置后的异常不应输出堆栈 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000cec905d4e2059206860a7c51c00)
87.  `F` 修复 `fs.appendFile` 不支持传入 ArrayBuffer 的问题
88.  `F` 修复 小程序项目中有 sitemap.json 但是 app.json 中没有指定 sitemapLocation 时 sitemap.json 会被覆盖掉
89.  `F` 修复 偶现 appLaunch with an already exist webviewId 错误
90.  `F` 修复 小游戏模拟器弹出时，`wx.showKeyboard` 会一闪而过的问题
91.  `F` 修复 提交版本的 "项目备注" 历史缓存没了的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ca625be88106cbe78ccd9d51000)
92.  `F` 修复 `wx.downloadFile` 由于代理问题下载不到文件时，会导致逻辑层卡顿的问题
93.  `F` 修复 开发者工具中 backgroundAudioManager 背景音频获取不到 duration 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002c0bcf3c6588fa458d98d951000)
94.  `F` 修复 模拟器第一次弹出，devtools 没有 reload 的问题
95.  `F` 修复 模拟器 TabBar 多次点击后空白的问题
96.  `F` 修复 企业微信小程序模式，compileType 错误的问题
97.  `F` 修复 手动修改 project.config.json 把 appid 变成空字符串会出现项目列表重复的问题
98.  `F` 修复 切换开发模式，状态栏一直显示某个文件编译中的问题
99.  `F` 修复 工程文件多编译很慢时，系统错误不会报的问题
100.  `F` 修复 windows 真机调试，配置了 functionpages 的小程序会报错的问题
101.  `F` 修复 分包调试时，app.js 初始化两次的问题
102.  `F` 修复 开发者工具下 makeDirSync 不支持递归创建目录的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000664eceb8eb88e3068d906651c00)
103.  `F` 修复 windows nightly 小包更新会项目报错的问题
104.  `F` 修复 真机调试未读取 packOptions 中的 ignore 的问题
105.  `F` 修复 大小超过代码包最大限制没有提示代码包大小是多少的问题
106.  `F` 修复 设置中启动打开最后一次修改项目未生效的问题
107.  `F` 修复 预览和上传时没有提示超出大小
108.  `F` 修复 调用 downloadFile 接口没有跳过域名校验
109.  `F` 修复 网页调试模式有 home 和返回按钮的问题
110.  `F` 修复 代理设置输入失败问题
111.  `F` 修复 横竖屏切换，多操作几次会出现无法重排页面问题
112.  `F` 修复 项目详情切换 AppID 后同步云环境列表失败的问题
113.  `F` 修复 路径中包含「'」的项目无法打开的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000aae316acf28467b28c27105b800)
114.  `F` 修复 BackgroundAudioManager.onPlay 运行时机应比 onCanPlay 晚的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00062e92d908b847ae78260c25b000)
115.  `F` 修复 工具旧版本基础库新发布线上插件报找不到 **vd\_version\_info** 错误的问题
116.  `F` 修复 app.json 中的 usingComponents 不应扩散到独立分包内的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e46f8bfc5508099788cad551800)
117.  `F` 修复 app.json 中 plugins 字段删除后，仍保留了插件引用信息的问题
118.  `F` 修复 模拟 offline 断网时没有同时阻止一些请求的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a405b6400d06ca9286e50751000)
119.  `F` 修复 模拟器旋转之后没有自动变大小的问题

### [#](#_2019-04-17) 2019.04.17

### [#](#_1-02-1904090-Windows-64-、-Windows-32-、-macOS) 1.02.1904090 [Windows 64](https://servicewechat.com/wxa-dev-logic/download_redirect?type=x64&from=mpwiki&download_version=1021904090&version_type=1) 、 [Windows 32](https://servicewechat.com/wxa-dev-logic/download_redirect?type=ia32&from=mpwiki&download_version=1021904090&version_type=1) 、 [macOS](https://servicewechat.com/wxa-dev-logic/download_redirect?type=darwin&from=mpwiki&download_version=1021904090&version_type=1)

1.  `A` 新增 云函数本地调试 [文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/guide/functions/local-debug)
2.  `A` 新增 企业微信模拟器插件 [文档](qywx-dev)
3.  `A` 新增 CLI/HTTP 调用关闭项目窗口、关闭开发者工具 [详情](cli#8-关闭当前项目窗口)
4.  `A` 新增 小程序支持 `pageOrientation: "landscape"`
5.  `A` 新增 分包配置中新增的页面配置会自动生成对应的页面结构 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002660705483835d3e7e4c155b800)
6.  `A` 新增 真机调试支持调试 functionalPage
7.  `A` 新增 云控制台支持地理位置索引 [文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/guide/database/geo)
8.  `U` 优化 大型的小程序项目编译卡顿的问题
9.  `U` 优化 TS 版快速开始的代码结构
10.  `U` 优化 背景音频的交互体验
11.  `F` 修复 HTTP 调用无法上传的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ee24bb8c848067158cf5135b800)
12.  `F` 修复 tabBar 字体颜色支持 rgb 格式与客户端不一致的问题
13.  `F` 修复 tabBar 被蒙层遮住的问题
14.  `F` 修复 [wx.getBackgroundAudioManager](https://developers.weixin.qq.com/miniprogram/dev/api/media/background-audio/wx.getBackgroundAudioManager.html) 实现与客户端不一致的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a6ed1300b08a09b385df615b800)
15.  `F` 修复 `navigationStyle: custom` 有 [web-view](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html) 组件的页面没有顶部导航栏的问题
16.  `F` 修复 命令行调用上传时 --upload-desc 会截断空格后内容的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ca6605a898058ea48ae10a5b800)
17.  `F` 修复 代理设置本地代理，失去焦点会自动在文字前加空格的问题
18.  `F` 修复 基础库占比只在第一次预览之后才显示的问题
19.  `F` 修复 [wx.connectSocket](https://developers.weixin.qq.com/minigame/dev/api/network/websocket/wx.connectSocket.html) 超时时最大连接数控制异常的问题
20.  `F` 修复 [wx.connectSocket](https://developers.weixin.qq.com/minigame/dev/api/network/websocket/wx.connectSocket.html) 在无法建立连接的情况下没有错误回调的问题
21.  `F` 修复 [web-view](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html) 横屏时无法显示全部的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e4878d20430b9382890dfa5b800)
22.  `F` 修复 wxss 中使用非数字开头的自定义属性报错的问题
23.  `F` 修复 自定义 tabBar 中调用 [wx.getSystemInfo](https://developers.weixin.qq.com/minigame/dev/api/base/system/wx.getSystemInfo.html) 返回的 windowHeight 不正确的问题
24.  `F` 修复 自定义分析测试功能失效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00002873c90f380b3d282db9251400)
25.  `F` 修复 没有开通云开发的 appid 选择云开发启动模板新建项目后会弹下拉提示的问题
26.  `F` 修复 弹出的模拟器，打开设置授权会出现两个状态栏的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0000a835f049e0f34d08076a85bc00)
27.  `F` 修复 [wx.chooseMessageFile](https://developers.weixin.qq.com/minigame/dev/api/media/image/wx.chooseMessageFile.html) 在 tabBar 切换后失效的问题
28.  `F` 修复 wxss 文件中 keyframe 后有注释会导致 wxml 面板无法解析样式的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000064238d8d880e4128692fc56c00)
29.  `F` 修复 弹出模拟器之后 [wx.getMenuButtonBoundingClient](https://developers.weixin.qq.com/minigame/dev/api/ui/menu/wx.getMenuButtonBoundingClientRect.html) 异常的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000868455f89f894dd18f2e6b56000)
30.  `F` 修复 wxs 无法显示相同日志的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ec677b2468048dae731a7356000)
31.  `F` 修复 wxs 报错信息没有显示的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004aa1e02c8a0c4dfe7ea84051400)
32.  `F` 修复 tabBar 调整会先显示其他 tabBar 页面的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00042c2ab38ca002f3179a9c856800)
33.  `F` 修复 npm 构建 mqtt 包会报错的问题
34.  `F` 修复 项目列表窗口大小异常的问题
35.  `F` 修复 上传时间显示错误的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008a8efc808f8109e48f852f57000)

### [#](#_2019-02-01) 2019.02.01

### [#](#_1-02-1902010-Windows-64-、-Windows-32-、-macOS) 1.02.1902010 [Windows 64](https://servicewechat.com/wxa-dev-logic/download_redirect?type=x64&from=mpwiki&download_version=1021902010&version_type=1) 、 [Windows 32](https://servicewechat.com/wxa-dev-logic/download_redirect?type=ia32&from=mpwiki&download_version=1021902010&version_type=1) 、 [macOS](https://servicewechat.com/wxa-dev-logic/download_redirect?type=darwin&from=mpwiki&download_version=1021902010&version_type=1)

1.  `F` 修复 界面调试样式信息显示不全的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00020cc27d8220196717f18c85ec00)

### [#](#_2019-01-23) 2019.01.23

1.  `F` 修复 1.02.1901221 引入的 app.json usingComponent 没有扩散的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0008ee94f988a00c1108708cc51000)
2.  `F` 修复 长路径的项目无法正常打开的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e8e42df0590870e08c12525b400)
3.  `F` 修复 1.02.1901170 引入的 win 版经常弹项目列表窗口的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e8a26e1846893b4f75955651800)

### [#](#_2019-01-22) 2019.01.22

1.  `F` 修复 1.02.1901170 引入的 [wx.previewImage](https://developers.weixin.qq.com/minigame/dev/api/media/image/wx.previewImage.html) 无效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00082423228af8cee6f70903556c00)
2.  `F` 修复 1.02.1901170 引入的预览时报 pageJSON 错误的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00084ade1b866872f9f77250e56400)
3.  `F` 修复 1.02.1901170 引入的 win 版经常弹项目列表窗口的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e8a26e1846893b4f75955651800)
4.  `F` 修复 1.02.1901170 引入的 tabBar `selectIconPath` 无效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000086efdc459087b3f7c08ef5b400)
5.  `F` 修复 1.02.1901170 引入的小程序全屏模式存现返回按钮的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000222a143cf2896bff7ed5ad5b000)
6.  `F` 修复 `ext.json` 中有效字段被误提示为无效字段的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e686b66080028b4f79c39356800)
7.  `F` 修复 [wx.setStorage](https://developers.weixin.qq.com/minigame/dev/api/storage/wx.setStorage.html) key 允许为空字符的问题
8.  `F` 修复 第三方平台命令行上传代码异常问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000262bb410e280670f7e23cd56c00)

### [#](#_2019-01-17) 2019.01.17

1.  `A` 新增 自定义 tabbar 调试支持 [详情](../framework/ability/custom-tabbar.md)
2.  `A` 新增 微信开发者·代码管理 [详情](wechatvcs)
3.  `A` 新增 安全设置，CLI/HTTP 调用默认关闭，需要手动开启 [详情](cli)
4.  `A` 新增 游客模式可以修改 appid
5.  `U` 优化 新建项目流程
6.  `U` 优化 开发者工具模态弹窗反馈的交互
7.  `U` 优化 `app.json` 和 `page.json` 的字段类型检查及无效字段提示
8.  `F` 修复 修改 appid 后云开发的本地缓存没有清理导致无法正确上传、下载代码的问题
9.  `F` 修复 设置系统代理失败后，界面还是显示为系统代理的问题
10.  `F` 修复 设置系统代理失败，Windows 版会有多次失败提示的问题
11.  `F` 修复 多账号调试窗口丢失 `AppData` 调试面板的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00004c35ccc608d970f726a1e56000)
12.  `F` 修复 macOS 复制失效的问题
13.  `F` 修复 界面调试样式信息显示不全的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00020cc27d8220196717f18c85ec00)
14.  `F` 修复 WXML 面板不显示 media query 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000ae42d28ce1803ead7999a15bc00)
15.  `F` 修复 WXML 面板样式点一下就点不动的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000cae4f948b006c50d7ac9605fc00)
16.  `F` 修复 在硬盘删除项目目录后重建，开发者工具无法监听到文件变更的问题
17.  `F` 修复 登录流程的部分错误情况没有错误提示的问题
18.  `F` 修复 分享时未触发 app.onHide 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c468546c51883ead7195b85b800)
19.  `F` 修复 小游戏调试器无法显示 [wx.downloadFile](https://developers.weixin.qq.com/minigame/dev/api/network/download/wx.downloadFile.html) [wx.uploadFile](https://developers.weixin.qq.com/minigame/dev/api/network/upload/wx.uploadFile.html) 的请求的问题
20.  `F` 修复 2.4.4 基础库开发者工具切后台报错的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000e68e1cb8cf07000f725e2656c00)
21.  `F` 修复 小程序分包中使用插件的页面会丢失样式的问题

### [#](#_2018-12-27) 2018.12.27

[Windows 64](https://servicewechat.com/wxa-dev-logic/download_redirect?type=x64&from=mpwiki&download_version=1021812271&version_type=1) 、 [Windows 32](https://servicewechat.com/wxa-dev-logic/download_redirect?type=ia32&from=mpwiki&download_version=1021812271&version_type=1) 、 [macOS](https://servicewechat.com/wxa-dev-logic/download_redirect?type=darwin&from=mpwiki&download_version=1021812271&version_type=1)

1.  `F` 修复 1.02.1812260 引入的 first\_column 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000c6cdefd897028f4d72592551800)
2.  `F` 修复 getLocation 每次都会有授权弹窗的问题

### [#](#_2018-12-26) 2018.12.26

1.  `A` 新增 `app.json` 支持 `permission` 字段
2.  `A` 新增 `page.json` 支持 `navigationStyle` 字段（仅对 2.4.3 基础库有效）
3.  `F` 修复 部分组件黑色主题样式问题
4.  `F` 修复 公众号网页调试没法打开外观设置的问题

### [#](#_2018-12-18) 2018.12.18

1.  `A` 新增 黑色主题 [详情](settings#外观设置)
2.  `A` 新增 mDns 调试支持
3.  `A` 新增 模拟器在工具右侧展示
4.  `A` 新增 模拟器 Home 和 返回操作 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0004280e26483823ad476931151c00)
5.  `A` 新增 [web-view](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html) 支持 `bindload/binderror`
6.  `A` 新增 `project.config.json` 中 appid 支持修改
7.  `A` 新增 小游戏 `game.json` 配置项 `deviceOrientation` 支持 `landscapeLeft/landscapeRight`
8.  `A` 新增 小程序配置文件支持 pageOrientation [详情](../framework/view/resizable.md)
9.  `A` 新增 CLI/HTTP 支持自动预览 [详情](cli#7-命令行提交自动预览)
10.  `U` 优化 云函数上传时提示是否有未安装的依赖
11.  `U` 优化 当自定义编译条件过多时，点击打开自动定位到已选择的编译模式
12.  `U` 优化 自定义编译条件支持方向键操作
13.  `F` 修复 小程序分包会加载两次 app.wxss 的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/00008ea3b80240e6bdc7302235e400)
14.  `F` 修复 `app.json` 中写入 `extAppid` 导致异常的问题
15.  `F` 修复 macOS 版工具会出现 command + s 无法保存的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000aa88c04cb4032b7c705ead56800)
16.  `F` 修复 分包中的插件引用自身资源加载失败的问题
17.  `F` 修复 分包预加载阶段时 app.js 被执行的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000026a9480c70c8d5a77520b56c00)
18.  `F` 修复 小游戏分包中的 game.js 为空文件上传会报错的问题
19.  `F` 修复 未打开工具时点击代码片段链接无法自动拉起工具的问题
20.  `F` 修复 公众号网页调试的调试器无法弹出的问题
21.  `F` 修复 Windows 版任务栏图标丢失的问题
22.  `F` 修复 `Page.onTabItemTap` 只有第一次触发的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/0002e2bcbfc9d0add4b771aaa5bc00)
23.  `F` 修复 页面没有 json 文件的时，app.json 的 usingComponents 没有在该页面生效的问题 [反馈详情](https://developers.weixin.qq.com/community/develop/doc/000a465d1401e0defea73e62c51c00)
24.  `F` 修复 cli 发生错误时进程退出码为 0 的问题

The translations are provided by WeChat Translation and are for reference only. In case of any inconsistency and discrepancy between the Chinese version and the English version, the Chinese version shall prevail.Incorrect translation. [Tap to report.](javascript:;)

-   [关于腾讯](http://www.tencent.com/zh-cn/index.shtml)
-   [文档中心](https://mp.weixin.qq.com/debug/wxadoc/introduction/index.html?t=1484641676)
-   [辟谣中心](https://kf.qq.com/faq/17030722muuu170307MFBny2.html)
-   [客服中心](http://kf.qq.com/faq/120911VrYVrA1509086vyumm.html)

Copyright © 2012-2026 Tencent. All Rights Reserved.

-   稳定版 Stable Build 更新日志

-   1.05.2108130

-   2021.08.13

-   2021.07.09

-   2021.06.30

-   2021.06.25

-   2021.05.17

-   2021.05.10

-   2021.04.16

-   2021.03.19

-   2021.02.22

-   2021.02.01

-   2021.01.15

-   2021.01.04

-   2020.11.26

-   2020.10.27

-   2020.09.15

-   2020.08.31

-   2020.06.19

-   2020.05.25

-   2020.04.02

-   2020.03.25

-   2019.12.02

-   2019.10.21

-   2019.08.13

-   2019.07.16

-   2019.04.17

-   1.02.1904090

-   2019.02.01

-   1.02.1902010

-   2019.01.23

-   2019.01.22

-   2019.01.17

-   2018.12.27

-   2018.12.26

-   2018.12.18

-   复制
-   问题反馈

点击咨询小助手

[

](javascript:;)