# Markdown CSS Lab

一个面向 Markdown 渲染的本地排版实验项目，目标是把同一份 Markdown 稿件稳定渲染到不同场景：

- 微信公众号长文
- PDF 手册
- 研究笔记 / 技术文档

## 快速开始

在项目根目录运行：

```powershell
C:/Users/xueli/anaconda3/python.exe -m http.server 8787 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:8787/wechat-renderer/
```

## 项目结构

```text
themes/                 三套 Markdown CSS 主题
wechat-renderer/        本地微信公众号 Markdown 渲染器
docs/                   项目记录、功能清单、CSS 认知
markdown-css-design-notes.md
                        早期 PDF 和 CSS 分析笔记
```

## 当前重点

- 把 Markdown 渲染成可复制到微信公众号后台的富文本。
- 建立三套可切换、可修改、可持续优化的 CSS 主题。
- 记录 CSS 排版原则，沉淀为后续 GitHub 项目的文档基础。
- 对照 Doocs / MDNice 等成熟项目，持续补齐微信复制兼容策略。
