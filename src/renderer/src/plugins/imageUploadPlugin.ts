/**
 * 自定义图片上传插件：使用 Electron 原生 dialog 而非 input[type=file]
 * 解决 packaged 应用下 input 触发文件选择时导致的白屏问题
 * 支持：点击按钮选择图片、拖拽图片上传
 */
import type { BytemdPlugin } from 'bytemd'

const IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml'
]

// 图片/照片图标 SVG (16x16) - 相框 + 山峦剪影
const IMAGE_ICON =
  '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 10l4-3 3 2 5-4"/><circle cx="5.5" cy="5.5" r="1.5"/></svg>'

export interface ImageUploadPluginOptions {
  getOssConfig: () => Promise<OssConfig | null>
  onConfigMissing?: () => void
  /** 上传开始时调用，可返回一个在结束时调用的清理函数（如关闭 loading） */
  onUploadStart?: () => (() => void) | void
}

export function createImageUploadPlugin(options: ImageUploadPluginOptions): BytemdPlugin {
  const { getOssConfig, onConfigMissing, onUploadStart } = options

  return {
    actions: [
      {
        title: 'image',
        icon: IMAGE_ICON,
        handler: {
          type: 'action',
          click: async (ctx) => {
            const config = await getOssConfig()
            if (!config) {
              onConfigMissing?.()
              return
            }

            const endUpload = onUploadStart?.()
            try {
              const result = await window.api.pickAndUploadImages({ config })
              if (!result.success || !result.images?.length) return

              const doc = ctx.editor.getDoc()
              const cursor = doc.getCursor()
              const parts = result.images.map((img) => `![${img.title || 'image'}](${img.url})`)
              const insertText = parts.join('\n') + (parts.length > 1 ? '\n' : '')
              doc.replaceRange(insertText, cursor)
            } catch (err) {
              console.error('Image upload failed:', err)
            } finally {
              endUpload?.()
            }
          }
        }
      }
    ],
    editorEffect(ctx) {
      const root = ctx.root
      if (!root) return

      const handleDragOver = (e: DragEvent) => {
        if (e.dataTransfer?.types?.includes('Files')) {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
        }
      }

      const handleDrop = async (e: DragEvent) => {
        const files = e.dataTransfer?.files
        if (!files?.length) return

        const imageFiles = Array.from(files).filter((f) =>
          IMAGE_TYPES.some((t) => f.type === t || f.type.startsWith('image/'))
        )
        if (!imageFiles.length) return

        e.preventDefault()
        e.stopPropagation()

        const config = await getOssConfig()
        if (!config) {
          onConfigMissing?.()
          return
        }

        const endUpload = onUploadStart?.()
        const doc = ctx.editor.getDoc()
        const pos = ctx.editor.coordsChar({ left: e.clientX, top: e.clientY }) ?? doc.getCursor()
        const imgs: { title: string; url: string }[] = []

        try {
          for (const file of imageFiles) {
            const arrayBuffer = await file.arrayBuffer()
            const result = await window.api.uploadToOss({
              config,
              fileInfo: {
                name: `images/${Date.now()}_${file.name}`,
                buffer: arrayBuffer
              }
            })
            if (result.success && result.url) {
              imgs.push({ title: file.name, url: result.url })
            }
          }
          if (imgs.length) {
            const parts = imgs.map((img) => `![${img.title || 'image'}](${img.url})`)
            const insertText = parts.join('\n') + (parts.length > 1 ? '\n' : '')
            doc.replaceRange(insertText, pos)
          }
        } catch (err) {
          console.error('Image drop upload failed:', err)
        } finally {
          endUpload?.()
        }
      }

      root.addEventListener('dragover', handleDragOver)
      root.addEventListener('drop', handleDrop)
      return () => {
        root.removeEventListener('dragover', handleDragOver)
        root.removeEventListener('drop', handleDrop)
      }
    }
  }
}
