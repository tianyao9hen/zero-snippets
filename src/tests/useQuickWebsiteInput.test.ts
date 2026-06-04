import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useQuickWebsiteInput } from '../renderer/src/hooks/useQuickWebsiteInput'
import { WebTreeNodeType } from '../renderer/src/enums'

vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    warning: vi.fn()
  }
}))

const nodes: WebTreeNode[] = [
  {
    id: 1,
    parentId: 0,
    typeId: 2,
    title: 'Dev',
    nodeType: WebTreeNodeType.FOLDER,
    orderNum: 100,
    categoryId: 9
  },
  {
    id: 2,
    parentId: 1,
    typeId: 2,
    title: 'Vue Website',
    nodeType: WebTreeNodeType.WEBSITE,
    url: 'https://vuejs.org',
    orderNum: 100,
    categoryId: 9
  },
  {
    id: 3,
    parentId: 1,
    typeId: 2,
    title: 'Vue',
    nodeType: WebTreeNodeType.FOLDER,
    orderNum: 110,
    categoryId: 9
  },
  {
    id: 4,
    parentId: 3,
    typeId: 2,
    title: 'Router',
    nodeType: WebTreeNodeType.FOLDER,
    orderNum: 120,
    categoryId: 9
  }
]

describe('useQuickWebsiteInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('window', {
      api: {
        getWebTreeByTypeId: vi.fn().mockResolvedValue(nodes),
        addWebTreeNode: vi.fn().mockResolvedValue(5),
        hideWindow: vi.fn()
      }
    })
  })

  it('loads folder tree and excludes website nodes from folder choices', async () => {
    const input = useQuickWebsiteInput()
    await input.loadTree()

    expect(input.folderOptions.value.map((folder) => folder.title)).toEqual([
      '根节点',
      'Dev',
      'Vue',
      'Router'
    ])
    expect(input.folderOptions.value.map((folder) => folder.id)).not.toContain(2)
    expect(input.folderTree.value[0]).toMatchObject({
      id: 0,
      title: '根节点',
      level: 0,
      hasChildren: true,
      children: [
        {
          id: 1,
          title: 'Dev',
          level: 1,
          hasChildren: true,
          children: [
            {
              id: 3,
              title: 'Vue',
              level: 2,
              hasChildren: true,
              children: [{ id: 4, title: 'Router', level: 3, hasChildren: false }]
            }
          ]
        }
      ]
    })
  })

  it('toggles folder expansion without changing selected folder', async () => {
    const input = useQuickWebsiteInput()
    await input.loadTree()

    input.selectedParentId.value = 3

    expect(input.expandedFolderIds.value.has(1)).toBe(true)
    input.toggleFolderExpanded(1)
    expect(input.expandedFolderIds.value.has(1)).toBe(false)
    expect(input.selectedParentId.value).toBe(3)

    input.toggleFolderExpanded(1)
    expect(input.expandedFolderIds.value.has(1)).toBe(true)
    expect(input.selectedParentId.value).toBe(3)
  })

  it('adds website under selected nested folder and inherits category', async () => {
    const input = useQuickWebsiteInput()
    await input.loadTree()

    input.selectedParentId.value = 3
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
      parentId: 3,
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
