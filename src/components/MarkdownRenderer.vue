<template>
    <div class="markdown-content" :class="{ 'ai-markdown': isAiMessage }">
        <div v-html="markdownContent"></div>
    </div>

</template>
<script setup>
import { ref, defineProps, computed } from 'vue'

const props = defineProps({
    content: {
        type: String,
        default: ''
    },
    isAiMessage: {
        type: Boolean,
        default: false
    }
})

// 处理Markdown内容
const markdownContent = computed(() => {
    let html = props.content

    // 转义HTML标签（防止XSS）
    html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // 处理代码块（```）
    html = html.replace(/```(\w*)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="code-block"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`
    })

    // 处理行内代码（`）
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

    // 处理加粗（**）
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // 处理斜体（*）
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // 处理标题
    html = html.replace(/### (.*)$/gm, '<h3>$1</h3>')
    html = html.replace(/## (.*)$/gm, '<h2>$1</h2>')
    html = html.replace(/# (.*)$/gm, '<h1>$1</h1>')

    // 处理链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')


    // 处理无序列表
    html = html.replace(/^- (.*)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

    // 处理有序列表
    html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>')

    // 处理引用
    html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')

    // 处理分割线
    html = html.replace(/^---$/gm, '<hr>')

    // 处理换行
    html = html.replace(/\n/g, '<br>')

    // 清理多余的br标签
    html = html.replace(/<br><br>/g, '<br>')

    return html
})

</script>
<style scoped lang="scss">
// Markdown 渲染样式 — 柔和、丰富、适中，适配聊天消息气泡

.markdown-content {
  font-size: 14px;
  line-height: 1.75;
  color: #3d4654;
  word-break: break-word;

  // ========== 标题 ==========
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    font-weight: 600;
    color: #3d4654;
    margin: 14px 0 8px;
    line-height: 1.4;

    &:first-child {
      margin-top: 0;
    }
  }

  :deep(h1) {
    font-size: 18px;
    padding-bottom: 6px;
    border-bottom: 1px solid #eef1f6;
  }

  :deep(h2) {
    font-size: 16px;
    padding-left: 8px;
    border-left: 3px solid #a8c5e8;
  }

  :deep(h3) {
    font-size: 15px;
    color: #5b6c7d;
  }

  :deep(h4) {
    font-size: 14px;
    color: #5b6c7d;
  }

  :deep(h5) {
    font-size: 13px;
    color: #6b7d8f;
  }

  :deep(h6) {
    font-size: 12px;
    color: #8b949e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  // ========== 段落与文本 ==========
  :deep(p) {
    margin: 6px 0;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(strong) {
    font-weight: 600;
    color: #2c3540;
  }

  :deep(em) {
    color: #6b7d8f;
    font-style: italic;
  }

  // 删除线（预留，解析器后续可扩展 ~~text~~）
  :deep(del),
  :deep(s) {
    color: #a0a7b3;
    text-decoration: line-through;
  }

  // 行内标记（==text== 高亮，预留）
  :deep(mark) {
    background: #fff3cd;
    color: #856404;
    padding: 1px 4px;
    border-radius: 3px;
  }

  // ========== 链接 ==========
  :deep(a) {
    color: #5b82b8;
    text-decoration: none;
    border-bottom: 1px dashed #c5d4eb;
    transition: color 0.2s, border-color 0.2s;

    &:hover {
      color: #3d6fb8;
      border-bottom-color: #5b82b8;
    }
  }

  // ========== 无序列表 ==========
  :deep(ul) {
    margin: 6px 0;
    padding-left: 18px;
    list-style: none;

    li {
      position: relative;
      padding-left: 14px;
      margin: 4px 0;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 9px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #a8c5e8;
      }

      // 嵌套子列表缩进 + 圆点颜色递减
      ul {
        margin: 4px 0 0;

        li::before {
          background: #c5d4eb;
        }

        ul li::before {
          background: #d8e4f0;
        }
      }
    }
  }

  // ========== 有序列表 ==========
  :deep(ol) {
    margin: 6px 0;
    padding-left: 22px;
    list-style: none;
    counter-reset: ol-counter;

    li {
      position: relative;
      margin: 4px 0;

      &::before {
        content: counter(ol-counter) '.';
        counter-increment: ol-counter;
        position: absolute;
        left: -22px;
        top: 0;
        width: 18px;
        text-align: right;
        font-size: 13px;
        font-weight: 600;
        color: #a8c5e8;
      }

      // 嵌套有序列表
      ol {
        margin: 4px 0 0;

        li::before {
          color: #c5d4eb;
        }
      }
    }
  }

  // li 内嵌段间距消除
  :deep(li) {
    p {
      margin: 2px 0;
    }

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  // ========== 引用块 ==========
  :deep(blockquote) {
    margin: 8px 0;
    padding: 8px 14px;
    border-left: 3px solid #c5d4eb;
    background: #f6f8fb;
    border-radius: 0 8px 8px 0;
    color: #6b7d8f;
    font-size: 13px;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }

    // 嵌套引用
    blockquote {
      margin: 6px 0 0;
      border-left-color: #d8e4f0;
      background: #f0f4f8;
    }

    p {
      margin: 2px 0;
    }
  }

  // ========== 分割线 ==========
  :deep(hr) {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, #dcdfe6, transparent);
    margin: 12px 0;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  // ========== 行内代码 ==========
  :deep(.inline-code) {
    background: #f0f2f6;
    color: #c0576b;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'Courier New', monospace;
  }

  // ========== 代码块 ==========
  :deep(.code-block) {
    background: #f6f8fa;
    border: 1px solid #e8ebf1;
    border-radius: 8px;
    padding: 12px 14px;
    margin: 8px 0;
    overflow-x: auto;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }

    // 滚动条
    &::-webkit-scrollbar {
      height: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #c0c4cc;
    }

    code {
      font-size: 13px;
      font-family: 'Courier New', monospace;
      color: #4a5568;
      line-height: 1.6;
    }
  }

  // ========== 表格（预留，解析器后续可扩展） ==========
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 13px;

    th {
      background: #f6f8fb;
      color: #3d4654;
      font-weight: 600;
      padding: 8px 12px;
      border: 1px solid #e8ebf1;
      text-align: left;
    }

    td {
      padding: 6px 12px;
      border: 1px solid #e8ebf1;
      color: #3d4654;
    }

    tr {
      &:nth-child(even) td {
        background: #fafbfc;
      }

      &:hover td {
        background: #f6f8fb;
      }
    }
  }

  // ========== 图片（预留） ==========
  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 6px 0;
  }

  // ========== 换行 ==========
  :deep(br) {
    display: block;
    content: '';
    margin-top: 2px;
  }

  // ========== 选中文字 ==========
  :deep(::selection) {
    background: rgba(168, 197, 232, 0.25);
    color: #2c3540;
  }
}

// ========== AI 消息下的 Markdown 样式微调（暖橙系） ==========
.ai-markdown {
  :deep(h2) {
    border-left-color: #f0c894;
  }

  :deep(h4),
  :deep(h5) {
    color: #c47f3e;
  }

  :deep(em) {
    color: #b08550;
  }

  :deep(a) {
    color: #d4955a;
    border-bottom-color: #f0dcc0;

    &:hover {
      color: #c47f3e;
      border-bottom-color: #d4955a;
    }
  }

  :deep(ul) {
    li {
      &::before {
        background: #f0c894;
      }

      ul li::before {
        background: #f5dab5;
      }
    }
  }

  :deep(ol) li::before {
    color: #f0c894;
  }

  :deep(blockquote) {
    border-left-color: #f0c894;
    background: #fdf8f1;

    blockquote {
      border-left-color: #f5dab5;
      background: #fdf3ea;
    }
  }

  :deep(hr) {
    background: linear-gradient(90deg, transparent, #f0dcc0, transparent);
  }

  :deep(.inline-code) {
    background: #fdf3ea;
    color: #c47f3e;
  }

  :deep(.code-block) {
    background: #fdf6ec;
    border-color: #f0dcc0;

    &::-webkit-scrollbar-thumb {
      background: #f0dcc0;
    }

    code {
      color: #6b5840;
    }
  }

  :deep(table) {
    th {
      background: #fdf8f1;
      border-color: #f0dcc0;
    }

    td {
      border-color: #f0dcc0;
    }

    tr {
      &:nth-child(even) td {
        background: #fdf6ec;
      }

      &:hover td {
        background: #fdf8f1;
      }
    }
  }

  :deep(::selection) {
    background: rgba(240, 200, 148, 0.25);
    color: #6b5840;
  }
}
</style>