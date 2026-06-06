# Markdown CSS Lab

一个面向 Markdown 渲染的本地排版实验项目，目标是把同一份 Markdown 稿件稳定渲染到不同场景：

- 微信公众号长文
- PDF 手册
- 研究笔记 / 技术文档

## 快速开始

不要直接用 Chrome 双击打开 `wechat-renderer/index.html`。这个工具会通过浏览器加载 `themes/` 里的 CSS，并使用剪贴板 API；在 `file://` 本地文件协议下，Chrome 会限制这些能力，所以看起来会“没有效果”或主题无法加载。

推荐方式一：双击项目根目录里的：

```text
start-renderer.bat
```

推荐方式二：在项目根目录运行：

```powershell
C:/Users/xueli/anaconda3/python.exe -m http.server 8787 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:8787/wechat-renderer/
```

如果你本机没有 Anaconda Python，也可以试：

```powershell
python -m http.server 8787 --bind 127.0.0.1
```

## 项目结构

```text
themes/                 三套基础 Markdown CSS 主题与两个公众号适配层
wechat-renderer/        本地微信公众号 Markdown 渲染器
docs/                   项目记录、功能清单、CSS 认知
markdown-css-design-notes.md
                        早期 PDF 和 CSS 分析笔记
```

## 当前重点

- 把 Markdown 渲染成可复制到微信公众号后台的富文本。
- 建立三套基础 CSS 主题，并为 PDF 手册 / 技术文档提供公众号适配版。
- 记录 CSS 排版原则，沉淀为后续 GitHub 项目的文档基础。
- 对照 Doocs / MDNice 等成熟项目，持续补齐微信复制兼容策略。
