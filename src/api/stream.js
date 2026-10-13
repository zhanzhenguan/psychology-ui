import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useUserStore } from '@/stores/user'


const userStore = useUserStore()

// ============================================================
// 完整版：暴露所有 SSE 生命周期回调，完全透传
// ============================================================

/**
 * 流式请求（完整版）
 * @param {Object} opts
 * @param {string} opts.url - 接口地址
 * @param {Object} [opts.body] - 请求体
 * @param {string} [opts.method='POST'] - 请求方法
 * @param {Object} [opts.headers] - 额外请求头
 * @param {AbortSignal} [opts.signal] - 外部 signal（传了则由外部控制 abort）
 * @param {boolean} [opts.openWhenHidden=false] - 页面隐藏时是否保持连接
 * @param {boolean} [opts.skipDefaultOpenCheck=false] - 跳过默认 onopen 校验
 * @param {Function} [opts.onopen] - (response: Response) => void | Promise<void>
 * @param {Function} [opts.onmessage] - (ev: {data:string, event?:string, id?:string}) => void
 * @param {Function} [opts.onclose] - () => void
 * @param {Function} [opts.onerror] - (err: Error) => void
 * @returns {AbortController|null} 内部创建的 controller；外部传了 signal 则返回 null
 */
export function chatStream(opts) {
  const {
    url,
    body,
    method = 'POST',
    headers = {},
    signal: externalSignal,
    openWhenHidden = false,
    skipDefaultOpenCheck = false,
    onopen,
    onmessage,
    onclose,
    onerror,
  } = opts

  // 外部没传 signal → 内部创建 controller
  const internalController = externalSignal ? null : new AbortController()
  const signal = externalSignal || internalController.signal

  // 合并 headers
  const finalHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    ...headers,
  }

  // 自动注入 token（防 SSR / localStorage 不可用）
  if (!finalHeaders['Authorization'] && !finalHeaders['authorization']) {
    try {
      if (typeof window !== 'undefined') {
        const token = userStore.token
        if (token) {
          finalHeaders['Authorization'] = `Bearer ${token}`
        }
      }
    } catch (_) {
      // localStorage 被禁用时忽略
    }
  }

  fetchEventSource(url, {
    method,
    headers: finalHeaders,
    body: body !== undefined && method !== 'GET' ? JSON.stringify(body) : undefined,
    signal,
    openWhenHidden,

    // ---------- onopen ----------
    async onopen(response) {
      // 默认校验（除非调用方要求跳过）
      if (!skipDefaultOpenCheck) {
        if (!response.ok) {
          const err = new Error(`HTTP ${response.status} ${response.statusText}`)
          err.response = response
          onerror?.(err)
          throw err
        }
        const ct = response.headers.get('content-type') || ''
        if (!ct.includes('text/event-stream')) {
          const err = new Error('Content-Type is not text/event-stream')
          err.response = response
          onerror?.(err)
          throw err
        }
      }

      // 调用方自定义逻辑
      try {
        await onopen?.(response)
      } catch (err) {
        onerror?.(err)
        throw err
      }
    },

    // ---------- onmessage ----------
    onmessage(ev) {
      try {
        onmessage?.(ev)
      } catch (err) {
        onerror?.(err)
        // 消息级错误不中断流
      }
    },

    // ---------- onclose ----------
    onclose() {
      onclose?.()
    },

    // ---------- onerror ----------
    onerror(err) {
      onerror?.(err)
      // AbortError → 静默停止，不重试
      if (err?.name === 'AbortError') {
        return
      }
      // 其他错误 → 停止重试
      throw err
    },
  })

  return internalController
}

// ============================================================
// 简化版：预设 JSON 解析 + 多格式兼容 + [DONE] 处理
// ============================================================

/**
 * 流式请求（简化版）
 * @param {Object} opts
 * @param {string} opts.url - 接口地址
 * @param {Object} [opts.body] - 请求体
 * @param {Object} [opts.headers] - 额外请求头
 * @param {AbortSignal} [opts.signal] - 外部 signal
 * @param {boolean} [opts.openWhenHidden=false]
 * @param {Function} opts.onChunk - (content: string) => void —— 收到文本片段
 * @param {Function} [opts.onDone] - () => void —— 流结束
 * @param {Function} [opts.onOpen] - (response: Response) => void
 * @param {Function} [opts.onError] - (err: Error) => void
 * @param {Function} [opts.onClose] - () => void
 * @param {string} [opts.doneFlag='[DONE]'] - 自定义结束标记
 * @param {boolean} [opts.rawText=false] - true=不解析 JSON，直接返回原始文本
 * @param {boolean} [opts.skipDefaultOpenCheck=false]
 * @returns {AbortController|null}
 */
export const chatStreamSimple = (opts) => {
  const {
    onChunk,
    onDone,
    onOpen,
    onError,
    onClose,
    doneFlag = 'done',
    rawText = false,
    skipDefaultOpenCheck = false,
    ...rest
  } = opts

  // 校验必传参数
  if (!onChunk || typeof onChunk !== 'function') {
    console.error('[streamChatSimple] onChunk 是必传函数参数')
    return null
  }

  return chatStream({
    ...rest,
    skipDefaultOpenCheck,
    openWhenHidden: rest.openWhenHidden ?? false,

    onopen(response) {
      onOpen?.(response)
    },

    onmessage(ev) {
      // 空数据 / 心跳
      if (!ev.data || ev.data === '' || ev.data.startsWith(':')) {
        return
      }

      // 结束标记
      if (ev.data === doneFlag) {
        onDone?.()
        return
      }

      // 纯文本模式
      if (rawText) {
        onChunk(ev.data)
        return
      }

      // ---------- JSON 解析模式（默认） ----------
      try {
        const parsed = JSON.parse(ev.data)

        // 后端标记 done
        if (parsed.done === true) {
          onDone?.()
          return
        }

        // 兼容多种 AI API 返回格式，按优先级取文本
        const content =
          parsed.content ??
          parsed.text ??
          parsed.delta?.content ??
          parsed.choices?.[0]?.delta?.content ??
          parsed.choices?.[0]?.message?.content ??
          ''

        if (content) {
          onChunk(content)
        }
      } catch {
        // JSON 解析失败 → 当纯文本兜底
        onChunk(ev.data)
      }
    },

    onclose() {
      onClose?.()
    },

    onerror(err) {
      onError?.(err)
      // 简化版：AbortError 静默，其他停止
      if (err?.name === 'AbortError') {
        return
      }
      throw err
    },
  })
}