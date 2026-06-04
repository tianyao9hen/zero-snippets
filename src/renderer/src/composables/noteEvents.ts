const CHANNEL_NAME = 'zero-snippets-note-events'
const STORAGE_KEY = 'zero-snippets-note-list-changed'
const MESSAGE = 'note-list-changed'

type NoteListChangedHandler = () => void

/**
 * 创建随手记列表刷新事件通道。
 * @returns 可用的跨窗口通道，不支持时返回 null
 */
function createChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  return new BroadcastChannel(CHANNEL_NAME)
}

/**
 * 发布随手记列表刷新事件。
 */
export function emitNoteListChanged() {
  createChannel()?.postMessage(MESSAGE)
  localStorage.setItem(STORAGE_KEY, String(Date.now()))
}

/**
 * 监听随手记列表刷新事件。
 * @param handler 收到刷新事件后执行的回调
 * @returns 取消监听函数
 */
export function onNoteListChanged(handler: NoteListChangedHandler) {
  const channel = createChannel()
  const handleMessage = (event: MessageEvent) => {
    if (event.data === MESSAGE) handler()
  }
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) handler()
  }

  channel?.addEventListener('message', handleMessage)
  window.addEventListener('storage', handleStorage)

  return () => {
    channel?.removeEventListener('message', handleMessage)
    channel?.close()
    window.removeEventListener('storage', handleStorage)
  }
}
