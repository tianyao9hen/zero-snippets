import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useQuickWebsiteInput } from '../renderer/src/hooks/useQuickWebsiteInput'
import { WebTreeNodeType } from '../renderer/src/enums'

// 页面消息只作为交互反馈，业务测试中用 mock 隔离。
vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    warning: vi.fn()
  }
}))

// 一条目录节点和一条网页节点，用于验证目录列表只暴露文件夹。
const nodes: WebTreeNode[] = [
  {
    id: 1,
    parentId: 0,
    typeId: 2,
    title: '开发',
    nodeType: WebTreeNodeType.FOLDER,
    orderNum: 100,
    categoryId: 9
  },
  {
    id: 2,
    parentId: 1,
    typeId: 2,
    title: 'Vue',
    nodeType: WebTreeNodeType.WEBSITE,
    url: 'https://vuejs.org',
    orderNum: 100,
    categoryId: 9
  }
]

describe('useQuickWebsiteInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('window', {
      api: {
        getWebTreeByTypeId: vi.fn().mockResolvedValue(nodes),
        addWebTreeNode: vi.fn().mockResolvedValue(3),
        hideWindow: vi.fn()
      }
    })
  })

  it('loads root and folder options only', async () => {
    const input = useQuickWebsiteInput()
    await input.loadTree()

    expect(input.folderOptions.value).toEqual([
      { id: 0, title: '根节点', path: '根节点', level: 0, categoryId: -1 },
      { id: 1, title: '开发', path: '根节点 > 开发', level: 1, categoryId: 9 }
    ])
  })

  it('adds website under selected folder and inherits category', async () => {
    const input = useQuickWebsiteInput()
    await input.loadTree()

    input.selectedParentId.value = 1
    input.form.value = {
      title: 'Example',
      url: 'example.com',
      shortcut: 'ex',
      description: 'demo',
      icon: '',
      paramUrl: ''
    }

    await input.submit()

    expect(window.api.addWebTreeNode).toHaveBeenCalledWith({
      parentId: 1,
      typeId: 2,
      title: 'Example',
      url: 'https://example.com',
      shortcut: 'ex',
      description: 'demo',
      icon: undefined,
      paramUrl: undefined,
      categoryId: 9,
      nodeType: WebTreeNodeType.WEBSITE,
      orderNum: 1000
    })
  })
})
