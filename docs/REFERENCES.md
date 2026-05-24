# References

## Doocs / md

- 项目主页：[doocs/md](https://github.com/doocs/md)
- 在线编辑器：[md.doocs.org](https://md.doocs.org/)

可借鉴点：

- 复制富文本时写入 `text/html` 和 `text/plain` 两种剪贴板格式。
- Clipboard API 不可用时，回退到 `execCommand("copy")`。
- 复制前会把主题 CSS 合并进 HTML。
- 复制前会调整 HTML 结构，其中包括把 `li > ul` 和 `li > ol` 从 `li` 内部移出，以适配微信公众号编辑器。
- 图片、SVG、Mermaid 等内容都有专门的微信兼容处理。

对应源码：

- [`clipboard.ts`](https://github.com/doocs/md/blob/34de2557f69f3d8f22da9b80ce2e94be4a2884f4/apps/web/src/utils/clipboard.ts)
- [`editor-header/index.vue`](https://github.com/doocs/md/blob/34de2557f69f3d8f22da9b80ce2e94be4a2884f4/apps/web/src/components/editor/editor-header/index.vue)
- [`utils/index.ts`](https://github.com/doocs/md/blob/34de2557f69f3d8f22da9b80ce2e94be4a2884f4/apps/web/src/utils/index.ts)

## MDNice

- 产品主页：[mdnice.com](https://mdnice.com/)

可借鉴点：

- 核心思路也是 Markdown 输入、主题渲染、复制富文本到公众号后台。
- 主题体系成熟，适合继续参考颜色、标题层级和公众号移动端密度。

