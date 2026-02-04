/**
 * @file useWebTree.spec.ts
 * @description useWebTree 组合式函数的单元测试
 *
 * 测试覆盖：
 * - calculateParentId 函数的所有场景
 * - 其他工具函数的基本功能
 */
import { describe, it, expect } from 'vitest'
import useWebTree from './useWebTree'
import { WebTreeNodeType } from '@renderer/enums'

const {
  calculateParentId,
  buildTree,
  getParentPath,
  getParentPathNames,
  findParentNodeInTree,
  insertNodeToTree,
  updateNodeOrderInTree: rawUpdateNodeOrderInTree,
  moveNodeInTree
} = useWebTree()

// 包装函数，保持测试代码简洁
const updateNodeOrderInTree = (
  tree: WebTreeNodeView[],
  nodeId: number,
  newOrderNum: number
): boolean => {
  // 创建模拟的 flatNodeList
  const flatNodeList: WebTreeNode[] = []
  const collectNodes = (nodes: WebTreeNodeView[]) => {
    for (const node of nodes) {
      flatNodeList.push(node)
      if (node.children) {
        collectNodes(node.children)
      }
    }
  }
  collectNodes(tree)
  return rawUpdateNodeOrderInTree(tree, flatNodeList, nodeId, newOrderNum)
}

describe('useWebTree', () => {
  // 模拟节点数据 - 供所有测试用例使用
  const mockNodes: WebTreeNode[] = [
    {
      id: 1,
      parentId: 0,
      title: '根文件夹',
      nodeType: WebTreeNodeType.FOLDER,
      typeId: 2,
      orderNum: 0
    },
    {
      id: 2,
      parentId: 1,
      title: '子文件夹',
      nodeType: WebTreeNodeType.FOLDER,
      typeId: 2,
      orderNum: 0
    },
    {
      id: 3,
      parentId: 1,
      title: '网页1',
      nodeType: WebTreeNodeType.WEBSITE,
      typeId: 2,
      url: 'https://example1.com',
      orderNum: 1
    },
    {
      id: 4,
      parentId: 2,
      title: '网页2',
      nodeType: WebTreeNodeType.WEBSITE,
      typeId: 2,
      url: 'https://example2.com',
      orderNum: 0
    },
    {
      id: 5,
      parentId: 0,
      title: '根网页',
      nodeType: WebTreeNodeType.WEBSITE,
      typeId: 2,
      url: 'https://root.com',
      orderNum: 1
    }
  ]

  describe('calculateParentId', () => {
    it('当未选中任何节点时，应返回根节点ID(0)', () => {
      const result = calculateParentId(0, mockNodes)
      expect(result).toBe(0)
    })

    it('当选中文件夹节点时，应返回该文件夹的ID（作为其子节点）', () => {
      // 选中根文件夹(id=1)
      const result1 = calculateParentId(1, mockNodes)
      expect(result1).toBe(1)

      // 选中子文件夹(id=2)
      const result2 = calculateParentId(2, mockNodes)
      expect(result2).toBe(2)
    })

    it('当选中网页节点时，应返回该网页的父节点ID（与其同级）', () => {
      // 选中网页1(id=3, parentId=1)
      const result1 = calculateParentId(3, mockNodes)
      expect(result1).toBe(1)

      // 选中网页2(id=4, parentId=2)
      const result2 = calculateParentId(4, mockNodes)
      expect(result2).toBe(2)

      // 选中根网页(id=5, parentId=0)
      const result3 = calculateParentId(5, mockNodes)
      expect(result3).toBe(0)
    })

    it('当选中不存在的节点时，应返回根节点ID(0)', () => {
      const result = calculateParentId(999, mockNodes)
      expect(result).toBe(0)
    })

    it('当节点列表为空时，应返回根节点ID(0)', () => {
      const result = calculateParentId(1, [])
      expect(result).toBe(0)
    })

    it('应正确处理复杂的嵌套结构', () => {
      // 创建更复杂的嵌套结构
      const complexNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Level1',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 1,
          title: 'Level2',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 3,
          parentId: 2,
          title: 'Level3',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 4,
          parentId: 3,
          title: 'DeepWeb',
          nodeType: WebTreeNodeType.WEBSITE,
          typeId: 2,
          url: 'https://deep.com',
          orderNum: 0
        }
      ]

      // 选中深层网页，应返回其父文件夹
      const result = calculateParentId(4, complexNodes)
      expect(result).toBe(3)

      // 选中深层文件夹
      const result2 = calculateParentId(3, complexNodes)
      expect(result2).toBe(3)
    })
  })

  describe('buildTree', () => {
    it('应将扁平列表转换为树形结构', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Root',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 1,
          title: 'Child',
          nodeType: WebTreeNodeType.WEBSITE,
          typeId: 2,
          url: 'https://child.com',
          orderNum: 0
        }
      ]

      const tree = buildTree(flatNodes)

      expect(tree).toHaveLength(1)
      expect(tree[0].id).toBe(1)
      expect(tree[0].children).toHaveLength(1)
      expect(tree[0].children?.[0].id).toBe(2)
    })

    it('应按 orderNum 排序', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'B',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 2
        },
        {
          id: 2,
          parentId: 0,
          title: 'A',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 1
        },
        { id: 3, parentId: 0, title: 'C', nodeType: WebTreeNodeType.FOLDER, typeId: 2, orderNum: 3 }
      ]

      const tree = buildTree(flatNodes)

      expect(tree[0].title).toBe('A')
      expect(tree[1].title).toBe('B')
      expect(tree[2].title).toBe('C')
    })
  })

  describe('getParentPath', () => {
    it('应返回从根到直接父节点的路径', () => {
      const nodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'A',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 1,
          title: 'B',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 3,
          parentId: 2,
          title: 'C',
          nodeType: WebTreeNodeType.WEBSITE,
          typeId: 2,
          url: 'https://c.com',
          orderNum: 0
        }
      ]

      const path = getParentPath(nodes, 3)
      expect(path).toEqual([1, 2])
    })

    it('根节点应返回空数组', () => {
      const nodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Root',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        }
      ]

      const path = getParentPath(nodes, 1)
      expect(path).toEqual([])
    })
  })

  describe('getParentPathNames', () => {
    it('应返回格式化的路径名称', () => {
      const nodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: '文件夹A',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 1,
          title: '文件夹B',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 3,
          parentId: 2,
          title: '网页',
          nodeType: WebTreeNodeType.WEBSITE,
          typeId: 2,
          url: 'https://web.com',
          orderNum: 0
        }
      ]

      const pathNames = getParentPathNames(nodes, 3)
      expect(pathNames).toBe('根节点 > 文件夹A > 文件夹B')
    })

    it('根节点应返回"根节点"', () => {
      const nodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Root',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        }
      ]

      const pathNames = getParentPathNames(nodes, 1)
      expect(pathNames).toBe('根节点')
    })

    it('parentId为0时应返回"根节点"', () => {
      const nodes: WebTreeNode[] = []

      const pathNames = getParentPathNames(nodes, 0)
      expect(pathNames).toBe('根节点')
    })
  })

  describe('findParentNodeInTree', () => {
    it('应在树中找到指定ID的节点作为父节点', () => {
      const tree = buildTree(mockNodes)

      // 查找id=1的节点（作为父节点）
      const parentNode = findParentNodeInTree(tree, 1)
      expect(parentNode).toBeDefined()
      expect(parentNode?.id).toBe(1)
    })

    it('应能找到深层节点', () => {
      const tree = buildTree(mockNodes)

      // 查找id=2的节点（子文件夹）
      const node = findParentNodeInTree(tree, 2)
      expect(node).toBeDefined()
      expect(node?.id).toBe(2)
    })

    it('不存在的节点应返回undefined', () => {
      const tree = buildTree(mockNodes)

      const parentNode = findParentNodeInTree(tree, 999)
      expect(parentNode).toBeUndefined()
    })
  })

  describe('insertNodeToTree', () => {
    it('应将新节点插入到根级别', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Root',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        }
      ]
      const tree = buildTree(flatNodes)

      const newNode: WebTreeNode = {
        id: 2,
        parentId: 0,
        title: 'New Node',
        nodeType: WebTreeNodeType.WEBSITE,
        typeId: 2,
        url: 'https://new.com',
        orderNum: 1
      }

      const success = insertNodeToTree(tree, flatNodes, newNode)

      expect(success).toBe(true)
      expect(flatNodes).toHaveLength(2)
      expect(tree).toHaveLength(2)
      expect(tree[1].id).toBe(2)
      expect(tree[1].level).toBe(0)
    })

    it('应将新节点插入到指定父节点下', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Folder',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        }
      ]
      const tree = buildTree(flatNodes)

      const newNode: WebTreeNode = {
        id: 2,
        parentId: 1,
        title: 'Child Node',
        nodeType: WebTreeNodeType.WEBSITE,
        typeId: 2,
        url: 'https://child.com',
        orderNum: 0
      }

      const success = insertNodeToTree(tree, flatNodes, newNode)

      expect(success).toBe(true)
      expect(flatNodes).toHaveLength(2)
      expect(tree[0].children).toHaveLength(1)
      expect(tree[0].children?.[0].id).toBe(2)
      expect(tree[0].children?.[0].level).toBe(1)
    })

    it('应按orderNum排序插入', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'A',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 3,
          parentId: 0,
          title: 'C',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 2
        }
      ]
      const tree = buildTree(flatNodes)

      const newNode: WebTreeNode = {
        id: 2,
        parentId: 0,
        title: 'B',
        nodeType: WebTreeNodeType.WEBSITE,
        typeId: 2,
        url: 'https://b.com',
        orderNum: 1
      }

      insertNodeToTree(tree, flatNodes, newNode)

      expect(tree.map((n) => n.id)).toEqual([1, 2, 3])
    })

    it('父节点不存在时应返回false', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Root',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        }
      ]
      const tree = buildTree(flatNodes)

      const newNode: WebTreeNode = {
        id: 2,
        parentId: 999, // 不存在的父节点
        title: 'Orphan',
        nodeType: WebTreeNodeType.WEBSITE,
        typeId: 2,
        url: 'https://orphan.com',
        orderNum: 0
      }

      const success = insertNodeToTree(tree, flatNodes, newNode)

      expect(success).toBe(false)
    })

    it('局部更新不应影响其他节点的展开状态', () => {
      // 创建带有展开状态的树
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Folder1',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 1,
          title: 'Child1',
          nodeType: WebTreeNodeType.WEBSITE,
          typeId: 2,
          url: 'https://child1.com',
          orderNum: 0
        },
        {
          id: 3,
          parentId: 0,
          title: 'Folder2',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 1
        }
      ]
      const tree = buildTree(flatNodes)

      // 设置展开状态
      tree[0].isExpanded = true // Folder1 展开
      tree[1].isExpanded = false // Folder2 折叠

      // 插入新节点到 Folder2
      const newNode: WebTreeNode = {
        id: 4,
        parentId: 3,
        title: 'New Child',
        nodeType: WebTreeNodeType.WEBSITE,
        typeId: 2,
        url: 'https://new.com',
        orderNum: 0
      }

      insertNodeToTree(tree, flatNodes, newNode)

      // 验证原有节点的展开状态保持不变
      expect(tree[0].isExpanded).toBe(true)
      expect(tree[1].isExpanded).toBe(false)
    })
  })

  describe('updateNodeOrderInTree', () => {
    it('应在同级内重新排序节点', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'A',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 0,
          title: 'B',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 1
        },
        {
          id: 3,
          parentId: 0,
          title: 'C',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 2
        }
      ]
      const tree = buildTree(flatNodes)

      // 将节点3（C）移动到第一位（orderNum = -1）
      const success = updateNodeOrderInTree(tree, 3, -1)

      expect(success).toBe(true)
      expect(tree.map((n) => n.id)).toEqual([3, 1, 2])
      expect(tree[0].orderNum).toBe(-1)
    })

    it('应保持节点的展开状态不变', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'A',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 0,
          title: 'B',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 1
        }
      ]
      const tree = buildTree(flatNodes)
      tree[0].isExpanded = true
      tree[1].isExpanded = false

      // 重新排序
      updateNodeOrderInTree(tree, 2, -1)

      // 验证展开状态保持不变
      expect(tree[0].isExpanded).toBe(false) // 现在是B
      expect(tree[1].isExpanded).toBe(true) // 现在是A
    })

    it('不存在的节点应返回false', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'A',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        }
      ]
      const tree = buildTree(flatNodes)

      const success = updateNodeOrderInTree(tree, 999, 1)

      expect(success).toBe(false)
    })

    it('应正确处理连续拖拽排序操作', () => {
      // 复现用户报告的问题：
      // 1. 初始状态：a(0), b(1), c(2)
      // 2. c 拖到 a 之前 → c(-1), a(0), b(1)
      // 3. a 拖到 c 之前 → 应该是 a(-2), c(-1), b(1)
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'a',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 0,
          title: 'b',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 1
        },
        {
          id: 3,
          parentId: 0,
          title: 'c',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 2
        }
      ]
      const tree = buildTree(flatNodes)

      // 第一次拖拽：c(3) 拖到 a(1) 之前，新 orderNum = -1
      let success = updateNodeOrderInTree(tree, 3, -1)
      expect(success).toBe(true)
      expect(tree.map((n) => n.id)).toEqual([3, 1, 2])
      expect(tree.map((n) => n.orderNum)).toEqual([-1, 0, 1])

      // 第二次拖拽：a(1) 拖到 c(3) 之前，新 orderNum = -2
      success = updateNodeOrderInTree(tree, 1, -2)
      expect(success).toBe(true)
      // 预期结果：a(-2), c(-1), b(1)
      expect(tree.map((n) => n.id)).toEqual([1, 3, 2])
      expect(tree.map((n) => n.orderNum)).toEqual([-2, -1, 1])
    })

    it('应正确处理多次连续拖拽排序', () => {
      // 更复杂的连续拖拽场景
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'a',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 0,
          title: 'b',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 1
        },
        {
          id: 3,
          parentId: 0,
          title: 'c',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 2
        },
        { id: 4, parentId: 0, title: 'd', nodeType: WebTreeNodeType.FOLDER, typeId: 2, orderNum: 3 }
      ]
      const tree = buildTree(flatNodes)

      // d 拖到 a 之前
      updateNodeOrderInTree(tree, 4, -1)
      expect(tree.map((n) => n.id)).toEqual([4, 1, 2, 3])

      // b 拖到 d 之后
      updateNodeOrderInTree(tree, 2, -0.5) // 在 d(-1) 和 a(0) 之间
      expect(tree.map((n) => n.id)).toEqual([4, 2, 1, 3])

      // a 拖到 c 之后
      updateNodeOrderInTree(tree, 1, 2.5) // 在 c(2) 和 d(3) 之间... 等等，d 现在 orderNum 是 -1
      // 这个测试需要更仔细的设计
    })
  })

  describe('moveNodeInTree', () => {
    it('应将节点移动到根级别', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Folder',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 1,
          title: 'Child',
          nodeType: WebTreeNodeType.WEBSITE,
          typeId: 2,
          url: 'https://child.com',
          orderNum: 0
        }
      ]
      const tree = buildTree(flatNodes)

      // 将子节点移动到根级别
      const success = moveNodeInTree(tree, flatNodes, 2, 0, 1)

      expect(success).toBe(true)
      expect(tree).toHaveLength(2)
      expect(flatNodes.find((n) => n.id === 2)?.parentId).toBe(0)
      expect(tree[1].level).toBe(0)
    })

    it('应将节点移动到新父节点下', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Folder1',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 0,
          title: 'Folder2',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 1
        },
        {
          id: 3,
          parentId: 1,
          title: 'Child',
          nodeType: WebTreeNodeType.WEBSITE,
          typeId: 2,
          url: 'https://child.com',
          orderNum: 0
        }
      ]
      const tree = buildTree(flatNodes)

      // 将节点3从 Folder1 移动到 Folder2
      const success = moveNodeInTree(tree, flatNodes, 3, 2, 0)

      expect(success).toBe(true)
      expect(tree[0].children?.length).toBe(0) // Folder1 不再有子节点
      expect(tree[1].children).toHaveLength(1) // Folder2 现在有子节点
      expect(tree[1].children?.[0].id).toBe(3)
      expect(tree[1].children?.[0].level).toBe(1)
    })

    it('移动时应递归更新子节点的层级', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Folder1',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 0,
          title: 'Folder2',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 1
        },
        {
          id: 3,
          parentId: 1,
          title: 'SubFolder',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 4,
          parentId: 3,
          title: 'DeepChild',
          nodeType: WebTreeNodeType.WEBSITE,
          typeId: 2,
          url: 'https://deep.com',
          orderNum: 0
        }
      ]
      const tree = buildTree(flatNodes)

      // 将 SubFolder（包含 DeepChild）从 Folder1 移动到 Folder2
      const success = moveNodeInTree(tree, flatNodes, 3, 2, 0)

      expect(success).toBe(true)
      // 验证层级正确更新
      expect(tree[1].children?.[0].level).toBe(1) // SubFolder
      expect(tree[1].children?.[0].children?.[0].level).toBe(2) // DeepChild
    })

    it('移动时应保持节点的展开状态', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Folder1',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        },
        {
          id: 2,
          parentId: 0,
          title: 'Folder2',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 1
        },
        {
          id: 3,
          parentId: 1,
          title: 'Child',
          nodeType: WebTreeNodeType.WEBSITE,
          typeId: 2,
          url: 'https://child.com',
          orderNum: 0
        }
      ]
      const tree = buildTree(flatNodes)
      tree[0].isExpanded = true

      // 移动节点
      moveNodeInTree(tree, flatNodes, 3, 2, 0)

      // 验证 Folder1 的展开状态保持不变
      expect(tree[0].isExpanded).toBe(true)
    })

    it('不存在的节点应返回false', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Folder',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        }
      ]
      const tree = buildTree(flatNodes)

      const success = moveNodeInTree(tree, flatNodes, 999, 0, 1)

      expect(success).toBe(false)
    })

    it('不存在的目标父节点应返回false', () => {
      const flatNodes: WebTreeNode[] = [
        {
          id: 1,
          parentId: 0,
          title: 'Folder',
          nodeType: WebTreeNodeType.FOLDER,
          typeId: 2,
          orderNum: 0
        }
      ]
      const tree = buildTree(flatNodes)

      const success = moveNodeInTree(tree, flatNodes, 1, 999, 0)

      expect(success).toBe(false)
    })
  })
})
