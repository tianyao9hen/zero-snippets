/**
 * 网页树相关操作 Hook
 */
export default () => {
  /**
   * 搜索网页树节点
   * @param keyword 搜索关键词
   * @param typeId 类型ID
   * @param nodeType 节点类型
   * @returns Promise<WebTreeNode[]> 匹配的节点列表
   */
  const searchWebTreeNodes = async (
    keyword: string,
    typeId: number,
    nodeType: number
  ): Promise<WebTreeNode[]> => {
    return await window.api.searchWebTree(keyword, typeId, nodeType)
  }

  return {
    searchWebTreeNodes
  }
}
