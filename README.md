# MyBilibiliScripts

这个仓库包含用于优化Bilibili浏览体验的油猴脚本。

## 脚本列表

### 1. Bilibili Enhanced Blocker (All-in-One)

- **描述**: 一个多合一的Bilibili增强脚本，主要功能包括：
    - 移除 Adblock 提示。
    - 拦截部分Bilibili的数据上报请求 (fetch, WebSocket, XMLHttpRequest)。
    - 尝试修复评论加载异常和未捕获的Promise错误。
    - 支持通过 `DEBUG_MODE` 常量开启或关闭控制台日志输出。
- **文件名**: `Bilibili Enhanced Blocker (All-in-One)test-1.0.4.beta_user .js`

## 如何安装

1.  **安装油猴扩展**: 
    首先，您需要在您的浏览器中安装一个用户脚本管理器。推荐使用 [Tampermonkey](https://www.tampermonkey.net/) (适用于 Chrome, Firefox, Safari, Edge, Opera 等主流浏览器) 或 [Violentmonkey](https://violentmonkey.github.io/)。

2.  **安装脚本**:
    -   访问仓库中脚本文件的原始链接：[Bilibili Enhanced Blocker (All-in-One)test-1.0.4.beta_user .js](https://raw.githubusercontent.com/fangzny1/MyBilibiliScripts/main/Bilibili%20Enhanced%20Blocker%20(All-in-One)test-1.0.4.beta_user%20.js)
    -   您的用户脚本管理器应该会自动检测到这是一个用户脚本，并提示您安装。
    -   点击“安装”按钮即可。

## 如何使用

安装完成后，脚本会在您访问 `https://www.bilibili.com/` 及其子域名下的页面时自动运行。

## 注意事项

-   此脚本主要用于个人学习和测试目的。
-   Bilibili网站的结构和接口可能会发生变化，这可能导致脚本部分或全部功能失效。我会尽力维护，但也欢迎您提出问题或贡献代码。
-   如果您在脚本中开启了 `DEBUG_MODE`，请记得在日常使用时关闭它，以避免不必要的控制台输出。

## 贡献

如果您有任何改进建议或发现了bug，欢迎通过以下方式贡献：

1.  Fork 本仓库
2.  创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  提交一个 Pull Request

## 许可证

本项目采用 [MIT 许可证](LICENSE) (如果未来添加LICENSE文件)。
