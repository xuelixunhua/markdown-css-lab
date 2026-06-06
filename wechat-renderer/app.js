const markdownInput = document.getElementById("markdownInput");
const cssInput = document.getElementById("cssInput");
const previewHost = document.getElementById("previewHost");
const docStats = document.getElementById("docStats");
const saveState = document.getElementById("saveState");
const copyState = document.getElementById("copyState");
const themeSelect = document.getElementById("themeSelect");
const syncScroll = document.getElementById("syncScroll");
const previewScroller = document.querySelector(".phone-screen");

const previewShadow = previewHost.attachShadow({ mode: "open" });
previewShadow.innerHTML = `
  <style>
    #nice .external-link-ref {
      margin-left: 2px;
      font-size: 0.72em;
      font-weight: 600;
      line-height: 1;
      vertical-align: super;
    }

    #nice .external-link-footnotes {
      margin: 28px 0 0;
      padding-top: 12px;
      border-top: 1px solid #ece7e2;
    }

    #nice .external-link-footnotes-title {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.45;
      text-align: left;
    }

    #nice .external-link-footnotes ol {
      margin: 0;
      padding-left: 1.2em;
    }

    #nice .external-link-footnotes li {
      margin: 4px 0;
      font-size: 13px;
      line-height: 1.45;
      word-break: break-all;
    }

    #nice .external-link-footnote-label {
      font-weight: 600;
    }
  </style>
  <style id="themeStyle"></style>
  <section id="nice" class="preview-article"></section>
`;
const themeStyle = previewShadow.getElementById("themeStyle");
const preview = previewShadow.getElementById("nice");

const storageKeys = {
  markdown: "wechat_renderer_markdown",
  css: "wechat_renderer_css",
  cssMode: "wechat_renderer_css_mode",
  theme: "wechat_renderer_theme",
  sync: "wechat_renderer_sync_scroll",
};

const themeFiles = {
  wechat: {
    label: "公众号",
    path: "../themes/wechat-editorial.css",
  },
  founderWechat: {
    label: "PDF 手册（公众号）",
    paths: ["../themes/founder-editorial.css", "../themes/founder-editorial-wechat.css"],
  },
  technicalWechat: {
    label: "技术文档（公众号）",
    paths: ["../themes/technical-doc.css", "../themes/technical-doc-wechat.css"],
  },
  founder: {
    label: "PDF 手册",
    path: "../themes/founder-editorial.css",
  },
  technical: {
    label: "技术文档",
    path: "../themes/technical-doc.css",
  },
};

const themeAssetVersion = "20260606-wechat-draft-toc";

let activeTheme = "wechat";
let cssIsCustom = false;
let isSyncingScroll = false;

const sampleMarkdown = `# 这是一篇公众号长文标题

## 目录

[TOC]

## AI 原生创业的真正变化

过去，创业者最稀缺的是工程资源。现在，**真正稀缺的是判断力、审美和持续迭代的节奏**。

当 AI 可以帮你写代码、做调研、整理竞品、起草 PRD，创始人的工作重心就会从“能不能做出来”，转向“该不该做、做到什么程度、什么时候停止”。

> 早期产品最怕的不是粗糙，而是没有一个清晰的判断标准。粗糙可以修，方向漂移会让团队越忙越远。

### 一个更实用的检查清单

- 这个问题是否足够具体？
- 用户是否已经在为它付出时间或金钱？
- 我们是否能在一周内做出可验证的原型？
- 如果数据不好，是否知道下一步该怎么改？

### 复制到公众号前的列表格式

- **装机容量**
：截至2023年11月，全国累计装机容量持续增长。
  - 火电：仍然是主要电源
  - 光伏：增速更快

- **发电占比**
:
  - 风光合计：占比继续提升
  - 核电：利用小时数较高

1. **平抑价格**:
通过“削峰填谷”减少价格波动。

- **核心行为：时间套利**
——在电价低的夜间或中午充电，在电价高的傍晚放电。

### 三种工具的分工

| 工具 | 适合场景 | 不适合场景 |
| --- | --- | --- |
| Chat | 快速问答、草稿、反方观点 | 长期项目上下文 |
| Claude Code | 代码库修改、自动化、测试 | 没有明确目标的探索 |
| 知识库 | 复用研究和判断框架 | 临时闲聊 |

### 外部链接会自动转为脚注

这里有一个 [Doocs Markdown 编辑器](https://github.com/doocs/md) 的参考链接，也可以放一个 [MDNice](https://mdnice.com/) 的产品链接。

课程链接在这里：[林超：给年轻人的跨学科通识课](https://www.bilibili.com/cheese/play/ss298?csource=Hp_searchresult&spm_id_from=333.337.0.0)。

这个 [微信内链](https://mp.weixin.qq.com/s/tJ-QIWRf4xx8O1VeivlX7w) 会保留在正文里，不进入参考链接。

## 结论

一个好的 Markdown 渲染系统，不只是把文字变漂亮，而是让结构、重点和节奏自然浮出来。`;

const sampleCss = `/* 当前 CSS 会参与预览，也会在复制时转成 inline style */
#nice .toc {
  line-height: 1.28;
}

#nice .toc li {
  margin: 1px 0;
  line-height: 1.32;
}

#nice p {
  margin: 10px 0;
  line-height: 1.68;
}

#nice strong {
  color: #d94721;
  font-weight: 800;
}`;

const inlineProperties = [
  "display",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-radius",
  "background",
  "background-color",
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-decoration",
  "vertical-align",
  "white-space",
  "word-break",
  "overflow-wrap",
  "list-style-type",
  "list-style-position",
];

function slugify(text, index) {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
  return slug || `heading-${index + 1}`;
}

function isListLine(line) {
  return /^\s*(?:[-*+]|\d+[.)])\s+/.test(line);
}

function isNonContinuationLine(line) {
  const text = line.trim();
  if (!text) return true;
  return /^(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s*|\|)/.test(text);
}

function isDefinitionLikeListBody(listBody) {
  const trimmed = listBody.trim();
  const strongOnly = /^(?:\*\*[^*]+\*\*|__[^_]+__)(?:[:：])?$/.test(trimmed);
  const compactLabel = /^[\p{L}\p{N}\p{Script=Han}\s（）()、/.-]{1,28}[:：]$/u.test(trimmed);
  return strongOnly || compactLabel;
}

function shouldMergeListContinuationLine(previousLine, currentLine) {
  const currentText = currentLine.trim();
  if (isNonContinuationLine(currentLine)) return false;

  const previousText = previousLine.trimEnd();
  const previousIndent = previousLine.match(/^\s*/)[0].length;
  const currentIndent = currentLine.match(/^\s*/)[0].length;
  if (currentIndent < previousIndent) return false;

  const listMatch = previousText.match(/^(\s*(?:[-*+]|\d+[.)])\s+)(.+)$/);
  if (!listMatch) return false;

  const listBody = listMatch[2].trim();
  if (!listBody) return false;
  if (/^[:：]/.test(currentText)) return true;

  return isDefinitionLikeListBody(listBody);
}

function mergeListContinuationLine(previousLine, currentLine) {
  const currentText = currentLine.trim();

  if (/^[:：]/.test(currentText)) {
    const mergedColon = currentText.replace(/^[:：]\s*/, "：");
    return previousLine.trimEnd() + mergedColon;
  }

  const normalizedPrevious = previousLine.trimEnd().replace(/:\s*$/, "：");
  return normalizedPrevious + currentText;
}

function preprocessMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const normalized = [];
  let fenceChar = "";

  lines.forEach((line) => {
    const fenceMatch = line.trim().match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const nextFenceChar = fenceMatch[1][0];
      fenceChar = fenceChar === nextFenceChar ? "" : nextFenceChar;
      normalized.push(line);
      return;
    }

    if (!fenceChar && normalized.length) {
      const previousLine = normalized[normalized.length - 1];
      if (isListLine(previousLine) && shouldMergeListContinuationLine(previousLine, line)) {
        normalized[normalized.length - 1] = mergeListContinuationLine(previousLine, line);
        return;
      }
    }

    normalized.push(line);
  });

  return normalized.join("\n");
}

function getScrollMax(element) {
  return Math.max(0, element.scrollHeight - element.clientHeight);
}

function syncScrollPosition(source, target) {
  if (!syncScroll.checked || isSyncingScroll || !source || !target) return;

  const sourceMax = getScrollMax(source);
  const targetMax = getScrollMax(target);
  if (sourceMax <= 0 || targetMax <= 0) return;

  isSyncingScroll = true;
  target.scrollTop = (source.scrollTop / sourceMax) * targetMax;
  requestAnimationFrame(() => {
    isSyncingScroll = false;
  });
}

function syncPreviewToEditor() {
  syncScrollPosition(markdownInput, previewScroller);
}

function renderMarkdown() {
  themeStyle.textContent = prepareThemeCss(cssInput.value);

  if (!window.marked || !window.DOMPurify) {
    preview.innerHTML = "<p>Markdown renderer is still loading.</p>";
    return;
  }

  marked.setOptions({
    gfm: true,
    breaks: true,
    mangle: false,
    headerIds: false,
  });

  const preparedMarkdown = preprocessMarkdown(markdownInput.value);
  const rawHtml = marked.parse(preparedMarkdown);
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ["id", "target", "rel"],
  });

  const temp = document.createElement("div");
  temp.innerHTML = cleanHtml;

  const headings = [...temp.querySelectorAll("h1,h2,h3,h4,h5,h6")];
  const usedIds = new Map();

  headings.forEach((heading, index) => {
    const base = slugify(heading.textContent, index);
    const seen = usedIds.get(base) || 0;
    usedIds.set(base, seen + 1);
    heading.id = seen ? `${base}-${seen + 1}` : base;
  });

  const toc = buildToc(headings);
  [...temp.querySelectorAll("p")].forEach((paragraph) => {
    if (/^\[toc\]$/i.test(paragraph.textContent.trim())) {
      paragraph.replaceWith(toc.cloneNode(true));
    }
  });
  appendExternalLinkFootnotes(temp);

  preview.innerHTML = temp.innerHTML;
  updateStats(headings.length);
  persist();
  requestAnimationFrame(syncPreviewToEditor);
}

function prepareThemeCss(css) {
  return css.replace(/:root/g, ":host");
}

function buildToc(headings) {
  const toc = document.createElement("nav");
  toc.className = "toc";
  toc.setAttribute("role", "doc-toc");
  toc.setAttribute("aria-label", "目录");

  const tocHeadings = headings.filter((heading) => {
    const text = heading.textContent.trim().toLowerCase();
    return heading.tagName !== "H1" && text !== "目录" && text !== "contents";
  });
  const items = tocHeadings.length ? tocHeadings : headings;
  const levels = items.map((heading) => Number(heading.tagName.slice(1)));
  const rootLevel = Math.min(...levels);
  let topLevelCount = 0;

  const list = document.createElement("ul");
  list.className = `toc-list toc-level-${rootLevel}`;
  const stack = [{ level: rootLevel, list, lastItem: null }];

  items.forEach((heading) => {
    const level = Number(heading.tagName.slice(1));
    while (stack.length > 1 && level < stack[stack.length - 1].level) {
      stack.pop();
    }

    if (level > stack[stack.length - 1].level) {
      const parent = stack[stack.length - 1];
      const nestedList = document.createElement("ul");
      nestedList.className = `toc-list toc-level-${level}`;
      (parent.lastItem || parent.list).appendChild(nestedList);
      stack.push({ level, list: nestedList, lastItem: null });
    }

    const li = document.createElement("li");
    li.className = `toc-item toc-level-${level}`;
    li.dataset.level = String(level);

    if (level === rootLevel) {
      topLevelCount += 1;
    }

    const link = document.createElement("a");
    link.href = `#${heading.id}`;

    const marker = document.createElement("span");
    marker.className = "toc-marker";
    marker.textContent =
      level === rootLevel ? String(topLevelCount).padStart(2, "0") : "·";

    const text = document.createElement("span");
    text.className = "toc-text";
    text.textContent = heading.textContent.trim();

    link.append(marker, text);
    li.appendChild(link);
    stack[stack.length - 1].list.appendChild(li);
    stack[stack.length - 1].lastItem = li;
  });

  toc.appendChild(list);
  return toc;
}

function normalizeExternalUrl(href) {
  if (!href || !/^(https?:)?\/\//i.test(href)) return "";

  try {
    return new URL(href, window.location.href).href;
  } catch {
    return "";
  }
}

function shouldConvertToFootnote(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname !== "mp.weixin.qq.com";
  } catch {
    return false;
  }
}

function getFootnoteLabel(link, url) {
  const label = link.textContent.replace(/\s+/g, " ").trim();
  if (label && label !== url) return label;

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "链接";
  }
}

function appendExternalLinkFootnotes(root) {
  const externalLinks = [...root.querySelectorAll("a[href]")].filter((link) => {
    const url = normalizeExternalUrl(link.getAttribute("href"));
    return url && shouldConvertToFootnote(url);
  });
  if (!externalLinks.length) return;

  const linkRefs = new Map();
  const footnotes = [];

  externalLinks.forEach((link) => {
    const url = normalizeExternalUrl(link.getAttribute("href"));
    if (!url) return;

    if (!linkRefs.has(url)) {
      linkRefs.set(url, linkRefs.size + 1);
      footnotes.push({
        label: getFootnoteLabel(link, url),
        url,
      });
    }

    const refIndex = linkRefs.get(url);
    const text = document.createElement("span");
    text.className = "external-link-text";
    text.append(...link.childNodes);

    const marker = document.createElement("sup");
    marker.className = "external-link-ref";
    marker.textContent = `[${refIndex}]`;
    text.appendChild(marker);
    link.replaceWith(text);
  });

  const section = document.createElement("section");
  section.className = "external-link-footnotes";

  const title = document.createElement("p");
  title.className = "external-link-footnotes-title";
  title.textContent = "参考链接";
  section.appendChild(title);

  const list = document.createElement("ol");
  footnotes.forEach((footnote) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.className = "external-link-footnote-label";
    label.textContent = `${footnote.label}：`;

    const value = document.createElement("span");
    value.className = "external-link-footnote-url";
    value.textContent = footnote.url;

    item.append(label, value);
    list.appendChild(item);
  });

  section.appendChild(list);
  root.appendChild(section);
}

function updateStats(headingCount) {
  const text = markdownInput.value.replace(/[#>*_`~\-[\]()|]/g, "");
  const words = text.replace(/\s+/g, "").length;
  docStats.textContent = `${words} 字 · ${headingCount} 标题`;
  saveState.textContent = "已保存";
}

function persist() {
  localStorage.setItem(storageKeys.markdown, markdownInput.value);
  localStorage.setItem(storageKeys.theme, activeTheme);
  localStorage.setItem(storageKeys.sync, syncScroll.checked ? "true" : "false");

  if (cssIsCustom) {
    localStorage.setItem(storageKeys.css, cssInput.value);
    localStorage.setItem(storageKeys.cssMode, "custom");
  } else {
    localStorage.removeItem(storageKeys.css);
    localStorage.removeItem(storageKeys.cssMode);
  }
}

function materializeCopyDecorations(clone) {
  if (activeTheme !== "wechat") return;

  clone.querySelectorAll("h2").forEach((heading) => {
    const rule = document.createElement("span");
    rule.setAttribute(
      "style",
      "display:block;width:36px;height:3px;margin:0 auto 14px;background:#d87556;"
    );
    heading.insertBefore(rule, heading.firstChild);
  });
}

function getFirstMeaningfulChild(node) {
  return [...node.childNodes].find((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) return true;
    return child.nodeType === Node.TEXT_NODE && child.textContent.trim();
  });
}

function removeLeadingBreakAfterLabel(labelNode) {
  let cursor = labelNode.nextSibling;

  while (cursor && cursor.nodeType === Node.TEXT_NODE && !cursor.textContent.trim()) {
    const emptyNode = cursor;
    cursor = cursor.nextSibling;
    emptyNode.remove();
  }

  if (cursor?.nodeName !== "BR") return;

  const breakNode = cursor;
  cursor = cursor.nextSibling;
  breakNode.remove();

  if (cursor?.nodeType === Node.TEXT_NODE) {
    cursor.textContent = cursor.textContent.replace(/^\s+/, "");
  }
}

function bindLeadingListColon(cloneRoot) {
  cloneRoot.querySelectorAll("li, li p").forEach((node) => {
    const firstChild = getFirstMeaningfulChild(node);
    if (!firstChild || firstChild.nodeType !== Node.ELEMENT_NODE) return;
    if (!["STRONG", "B", "SPAN"].includes(firstChild.tagName)) return;

    const nextNode = firstChild.nextSibling;
    if (!nextNode || nextNode.nodeType !== Node.TEXT_NODE) return;

    const colonMatch = nextNode.textContent.match(/^[:：]\s*/);
    if (!colonMatch) {
      if (/[:：]$/.test(firstChild.textContent.trim())) {
        removeLeadingBreakAfterLabel(firstChild);
      }
      return;
    }

    firstChild.appendChild(document.createTextNode("："));
    nextNode.textContent = nextNode.textContent.slice(colonMatch[0].length);
    if (!nextNode.textContent) nextNode.remove();
    removeLeadingBreakAfterLabel(firstChild);
  });
}

function replaceElementTag(node, tagName) {
  const replacement = document.createElement(tagName);
  [...node.attributes].forEach((attribute) => {
    replacement.setAttribute(attribute.name, attribute.value);
  });
  replacement.innerHTML = node.innerHTML;
  node.replaceWith(replacement);
  return replacement;
}

function normalizeSemanticInlineTagsForWeChat(cloneRoot) {
  cloneRoot.querySelectorAll("strong, b").forEach((node) => {
    const span = replaceElementTag(node, "span");
    span.style.display = "inline";
    if (!span.style.fontWeight) span.style.fontWeight = "800";
  });

  cloneRoot.querySelectorAll("em, i").forEach((node) => {
    const span = replaceElementTag(node, "span");
    span.style.display = "inline";
    if (!span.style.fontStyle) span.style.fontStyle = "italic";
  });
}

function createListPrefix(listNode, index, level) {
  const prefix = document.createElement("span");
  const isOrdered = listNode.tagName === "OL";
  const bullets = ["•", "▪", "◦"];
  prefix.textContent = isOrdered ? `${index + 1}. ` : `${bullets[level % bullets.length]} `;
  prefix.style.display = "inline";
  prefix.style.color = "inherit";
  prefix.style.fontWeight = "400";
  return prefix;
}

function moveInlineContent(target, source) {
  [...source.childNodes].forEach((child) => {
    if (
      child.nodeType === Node.ELEMENT_NODE &&
      child.tagName === "P" &&
      source.childNodes.length === 1
    ) {
      target.append(...child.childNodes);
      return;
    }

    target.appendChild(child);
  });
}

function flattenListForWeChat(listNode, level = 0) {
  const fragment = document.createDocumentFragment();
  const items = [...listNode.children].filter((child) => child.tagName === "LI");
  const isTocList = Boolean(listNode.closest(".toc"));

  items.forEach((item, index) => {
    const nestedLists = [...item.children].filter((child) => ["UL", "OL"].includes(child.tagName));
    nestedLists.forEach((nestedList) => nestedList.remove());

    const row = document.createElement("section");
    row.setAttribute("style", item.getAttribute("style") || "");
    row.style.display = "block";
    row.style.margin = item.style.margin || (isTocList ? "3px 0" : "6px 0");
    row.style.padding = "0";
    row.style.paddingLeft = level ? `${level * (isTocList ? 1 : 1.25)}em` : "0";
    row.style.listStyleType = "none";

    if (!isTocList) row.appendChild(createListPrefix(listNode, index, level));
    moveInlineContent(row, item);
    fragment.appendChild(row);

    nestedLists.forEach((nestedList) => {
      fragment.appendChild(flattenListForWeChat(nestedList, level + 1));
    });
  });

  return fragment;
}

function flattenListsForWeChat(cloneRoot) {
  [...cloneRoot.querySelectorAll("ul, ol")].forEach((list) => {
    if (list.closest("ul ul, ul ol, ol ul, ol ol")) return;
    list.replaceWith(flattenListForWeChat(list));
  });
}

function normalizeTocForWeChat(cloneRoot) {
  cloneRoot.querySelectorAll(".toc a").forEach((anchor) => {
    const span = replaceElementTag(anchor, "span");
    span.removeAttribute("href");
    span.style.display = "inline";
    span.style.borderBottom = "0";
    span.style.textDecoration = "none";
  });

  cloneRoot.querySelectorAll(".toc-marker").forEach((marker) => {
    const markerText = marker.textContent.trim();
    marker.textContent = markerText ? `${markerText}\u00a0` : "";
    marker.style.display = "inline";
    marker.style.width = "auto";
    marker.style.minWidth = "0";
    marker.style.marginRight = "6px";
    marker.style.float = "none";
    marker.style.textAlign = "left";
  });

  cloneRoot.querySelectorAll(".toc-text").forEach((text) => {
    text.style.display = "inline";
  });
}

function normalizeInlineForWeChat(cloneRoot) {
  cloneRoot.querySelectorAll("*").forEach((node) => {
    node.style.removeProperty("width");
    node.style.removeProperty("max-width");
    node.style.removeProperty("min-width");
    node.style.removeProperty("height");
    node.style.removeProperty("min-height");
  });

  cloneRoot.querySelectorAll("img,svg").forEach((node) => {
    node.style.maxWidth = "100%";
    node.style.height = "auto";
  });

  cloneRoot.querySelectorAll("table").forEach((node) => {
    node.style.width = "100%";
    node.style.maxWidth = "100%";
    node.style.borderCollapse = "collapse";
  });
}

function inlineStyles(sourceRoot, cloneRoot) {
  const sourceNodes = [sourceRoot, ...sourceRoot.querySelectorAll("*")];
  const cloneNodes = [cloneRoot, ...cloneRoot.querySelectorAll("*")];

  sourceNodes.forEach((sourceNode, index) => {
    const cloneNode = cloneNodes[index];
    if (!cloneNode || cloneNode.nodeType !== Node.ELEMENT_NODE) return;

    const computed = window.getComputedStyle(sourceNode);
    const styleText = inlineProperties
      .map((property) => {
        const value = computed.getPropertyValue(property);
        return value ? `${property}:${value}` : "";
      })
      .filter(Boolean)
      .join(";");

    cloneNode.setAttribute("style", styleText);
  });

  materializeCopyDecorations(cloneRoot);
  bindLeadingListColon(cloneRoot);
  normalizeSemanticInlineTagsForWeChat(cloneRoot);
  normalizeInlineForWeChat(cloneRoot);
  flattenListsForWeChat(cloneRoot);
  normalizeTocForWeChat(cloneRoot);
  cloneRoot.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  cloneRoot.querySelectorAll("a[href^='#']").forEach((node) => node.removeAttribute("href"));
}

function getInlineArticle() {
  const clone = preview.cloneNode(true);
  inlineStyles(preview, clone);
  return clone.outerHTML;
}

window.wechatRendererDebug = {
  appendExternalLinkFootnotes,
  getInlineArticle,
  normalizeTocForWeChat,
  preprocessMarkdown,
};

async function copyRich() {
  const html = getInlineArticle();
  const text = preview.innerText;

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
    } else {
      fallbackCopy(html);
    }
    flashCopyState("已复制富文本");
  } catch {
    fallbackCopy(html);
    flashCopyState("已复制 HTML");
  }
}

async function copyHtml() {
  const html = getInlineArticle();
  await navigator.clipboard.writeText(html);
  flashCopyState("HTML 已复制");
}

function fallbackCopy(html) {
  const container = document.createElement("div");
  container.contentEditable = "true";
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.innerHTML = html;
  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNodeContents(container);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand("copy");
  selection.removeAllRanges();
  container.remove();
}

function flashCopyState(message) {
  copyState.textContent = message;
  setTimeout(() => {
    copyState.textContent = "就绪";
  }, 1600);
}

function downloadHtml() {
  const article = getInlineArticle();
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>wechat-article</title>
</head>
<body>
${article}
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "wechat-article.html";
  link.click();
  URL.revokeObjectURL(url);
}

function switchTab(tabName) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });
  markdownInput.classList.toggle("active", tabName === "markdown");
  cssInput.classList.toggle("active", tabName === "css");
}

async function loadTheme(themeName, options = {}) {
  const nextTheme = themeFiles[themeName] ? themeName : "wechat";
  activeTheme = nextTheme;
  themeSelect.value = nextTheme;
  cssIsCustom = false;

  try {
    const paths = themeFiles[nextTheme].paths || [themeFiles[nextTheme].path];
    const cssParts = await Promise.all(
      paths.map(async (path) => {
        const themeUrl = `${path}?v=${themeAssetVersion}`;
        const response = await fetch(themeUrl, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        return response.text();
      })
    );
    cssInput.value = cssParts.join("\n\n");
  } catch {
    cssInput.value = sampleCss;
  }

  if (!options.silent) renderMarkdown();
}

async function restore() {
  markdownInput.value = localStorage.getItem(storageKeys.markdown) || sampleMarkdown;
  activeTheme = localStorage.getItem(storageKeys.theme) || "wechat";
  themeSelect.value = activeTheme;
  syncScroll.checked = localStorage.getItem(storageKeys.sync) !== "false";

  const savedCss = localStorage.getItem(storageKeys.css);
  const savedCssMode = localStorage.getItem(storageKeys.cssMode);
  if (savedCssMode === "custom" && savedCss && !savedCss.includes("当前 CSS 会参与预览")) {
    cssInput.value = savedCss;
    cssIsCustom = true;
  } else {
    cssIsCustom = false;
    await loadTheme(activeTheme, { silent: true });
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

markdownInput.addEventListener("input", () => {
  saveState.textContent = "保存中...";
  renderMarkdown();
});

cssInput.addEventListener("input", () => {
  saveState.textContent = "保存中...";
  cssIsCustom = true;
  renderMarkdown();
});

markdownInput.addEventListener(
  "scroll",
  () => syncScrollPosition(markdownInput, previewScroller),
  { passive: true }
);

previewScroller.addEventListener(
  "scroll",
  () => syncScrollPosition(previewScroller, markdownInput),
  { passive: true }
);

document.getElementById("copyRichBtn").addEventListener("click", copyRich);
document.getElementById("copyHtmlBtn").addEventListener("click", copyHtml);
document.getElementById("downloadBtn").addEventListener("click", downloadHtml);
themeSelect.addEventListener("change", async () => {
  await loadTheme(themeSelect.value);
});
syncScroll.addEventListener("change", () => {
  persist();
  syncPreviewToEditor();
});
document.getElementById("sampleBtn").addEventListener("click", () => {
  markdownInput.value = sampleMarkdown;
  renderMarkdown();
});
document.getElementById("clearBtn").addEventListener("click", () => {
  markdownInput.value = "";
  renderMarkdown();
});

restore().then(renderMarkdown);
