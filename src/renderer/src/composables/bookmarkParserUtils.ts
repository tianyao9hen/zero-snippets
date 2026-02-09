/**
 * @file bookmarkParser.ts
 * @description Chrome书签HTML文件解析工具
 *
 * 功能说明：
 * - 解析Chrome导出的Bookmark HTML文件
 * - 提取文件夹节点(H3标签)和网页书签节点(A标签)
 * - 保持原始层级结构
 * - 处理特殊字符和异常格式
 */

/**
 * 书签节点接口
 */
export interface BookmarkNode {
  /** 节点标题 */
  title: string
  /** 网页URL（仅网页节点有） */
  url?: string
  /** 图标数据（base64或URL） */
  icon?: string
  /** 子节点列表（仅文件夹节点有） */
  children?: BookmarkNode[]
}

/**
 * 解析书签HTML文件内容
 * @param htmlContent HTML文件内容
 * @returns 书签节点树
 */
export function parseBookmarkHtml(htmlContent: string): BookmarkNode[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')

  // 查找根级别的DL元素
  const rootDl = doc.querySelector('body > dl')
  if (!rootDl) {
    throw new Error('无效的Bookmark HTML文件格式：未找到根DL元素')
  }

  return parseDlElement(rootDl as HTMLDListElement)
}

/**
 * 解析DL元素，提取其中的书签节点
 * @param dlElement DL元素
 * @returns 书签节点数组
 */
function parseDlElement(dlElement: HTMLDListElement): BookmarkNode[] {
  const nodes: BookmarkNode[] = []
  const children = Array.from(dlElement.children)

  for (let i = 0; i < children.length; i++) {
    const child = children[i]

    if (child.tagName === 'DT') {
      const node = parseDtElement(child as HTMLElement)
      if (node) {
        nodes.push(node)
      }
    }
  }

  return nodes
}

/**
 * 解析DT元素，提取书签节点
 * @param dtElement DT元素
 * @returns 书签节点或null
 */
function parseDtElement(dtElement: HTMLElement): BookmarkNode | null {
  const h3 = dtElement.querySelector(':scope > h3')
  const a = dtElement.querySelector(':scope > a')

  if (h3) {
    // 文件夹节点
    const node: BookmarkNode = {
      title: decodeHtmlEntities(h3.textContent || '未命名文件夹')
    }

    // 查找子DL元素
    const dl = dtElement.querySelector(':scope > dl') as HTMLDListElement | null
    if (dl) {
      const children = parseDlElement(dl)
      if (children.length > 0) {
        node.children = children
      }
    }

    return node
  } else if (a) {
    // 网页书签节点
    const node: BookmarkNode = {
      title: decodeHtmlEntities(a.textContent || '未命名书签'),
      url: a.getAttribute('href') || ''
    }

    // 提取图标
    const icon = a.getAttribute('icon')
    if (icon) {
      node.icon = icon
    }

    return node
  }

  return null
}

/**
 * 解码HTML实体
 * @param text 包含HTML实体的文本
 * @returns 解码后的文本
 */
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

/**
 * 验证文件是否为有效的Bookmark HTML文件
 * @param htmlContent HTML文件内容
 * @returns 是否有效
 */
export function isValidBookmarkHtml(htmlContent: string): boolean {
  // 检查DOCTYPE
  const hasDoctype =
    htmlContent.includes('<!DOCTYPE NETSCAPE-Bookmark-file-1>') ||
    htmlContent.includes('<!DOCTYPE html>')

  // 检查基本结构
  const hasBookmarksStructure = htmlContent.includes('<DL>') && htmlContent.includes('</DL>')

  return hasDoctype && hasBookmarksStructure
}

/**
 * 统计书签节点数量
 * @param nodes 书签节点数组
 * @returns 统计信息
 */
export function countBookmarks(nodes: BookmarkNode[]): { folders: number; bookmarks: number } {
  let folders = 0
  let bookmarks = 0

  function countRecursive(nodeList: BookmarkNode[]) {
    for (const node of nodeList) {
      if (node.children) {
        folders++
        countRecursive(node.children)
      } else {
        bookmarks++
      }
    }
  }

  countRecursive(nodes)
  return { folders, bookmarks }
}
