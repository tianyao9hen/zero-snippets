import { useSnippetsStore } from '@renderer/store/snippetsStore'
import useType from '@renderer/hooks/useType'
import useArticle from '@renderer/hooks/useArticle'
import useWebTree from '@renderer/hooks/useWebTree'
import useCategory from '@renderer/hooks/useCategory'
import { WebTreeNodeType } from '@renderer/enums'
import { useSettingStore } from '@renderer/store/settingStore'

/**
 * @description 搜索
 */
export default function useSearch() {
  const snippetsStore = useSnippetsStore()
  const { getTypeListByIdList } = useType()
  const { getAllCategoryList } = useCategory()
  const { searchArticle } = useArticle()
  const { searchWebTreeNodes, searchWebTreeNodesByShortcut } = useWebTree()
  const settingStore = useSettingStore()

  const handleSearch = async () => {
    const search = snippetsStore.snippets.search.trim()
    if (search) {
      try {
        // 判断是否包含空格
        const hasSpace = search.includes(' ')
        // 解析搜索内容，如果包含空格，取第一个空格前的内容作为关键词
        const searchKeyword = hasSpace ? search.split(' ')[0] : search

        if (hasSpace) {
          const webResults = await searchWebTreeNodesByShortcut(
            searchKeyword,
            2,
            WebTreeNodeType.WEBSITE
          )

          const formattedWebResults: ContentEntity[] = webResults.map((node) => ({
            id: node.id,
            uniqueId: `web-${node.id}`,
            typeId: node.typeId,
            categoryId: node.categoryId || -1,
            title: node.title,
            content: node.url || node.description || '',
            icon: node.icon || undefined,
            url: node.url || undefined,
            shortcut: node.shortcut || undefined,
            paramUrl: node.paramUrl || undefined
          }))

          snippetsStore.setTypeList(await getTypeListByIdList([2]))
          snippetsStore.setResultList(formattedWebResults)
        } else {
          // 读取统一执行快捷键配置
          const unifiedShortcut = settingStore.getSettingWithDefault(
            'command.unifiedShortcut',
            'all'
          )

          // 并行查询文章、网页、分类与命令
          const [articleResults, webResults, categories, commandResults] = await Promise.all([
            searchArticle(searchKeyword),
            searchWebTreeNodes(searchKeyword, 2, WebTreeNodeType.WEBSITE), // typeId=2 是网页类型，只查询网页节点
            getAllCategoryList(),
            window.api.searchCommands(searchKeyword)
          ])

          // 创建 category 映射表
          const categoryMap = new Map(categories.map((c) => [c.id, c.title]))

          // 转换文章结果，添加 uniqueId 和 categoryName
          const formattedArticleResults: ContentEntity[] = articleResults.map((article) => ({
            ...article,
            uniqueId: `article-${article.id}`,
            categoryName: categoryMap.get(article.categoryId) || '未分类'
          }))

          // 转换网页结果为 ContentEntity 格式，添加 uniqueId 并保留更多字段
          const formattedWebResults: ContentEntity[] = webResults.map((node) => ({
            id: node.id,
            uniqueId: `web-${node.id}`,
            typeId: node.typeId,
            categoryId: node.categoryId || -1,
            title: node.title,
            content: node.url || node.description || '',
            icon: node.icon || undefined,
            url: node.url || undefined,
            shortcut: node.shortcut || undefined,
            paramUrl: node.paramUrl || undefined
          }))

          // 转换命令结果为 ContentEntity 格式，添加 uniqueId，并将内容控制为单行展示
          const formattedCommandResults: ContentEntity[] = commandResults.map((cmd) => ({
            id: cmd.id,
            uniqueId: `command-${cmd.id}`,
            typeId: 5,
            categoryId: -1,
            title: cmd.name,
            content: cmd.command,
            shortcut: cmd.shortcut || undefined
          }))

          // 合并结果：命令在前，文章其后，网页最后
          let combinedResults = [
            ...formattedCommandResults,
            ...formattedArticleResults,
            ...formattedWebResults
          ]

          // 如果输入刚好等于统一执行快捷键，则在列表最上方加入“统一执行”虚拟项
          if (searchKeyword === unifiedShortcut) {
            combinedResults.unshift({
              id: -1,
              uniqueId: 'command-unified',
              typeId: 5,
              categoryId: -1,
              title: '统一执行',
              content: '',
              shortcut: unifiedShortcut
            } as ContentEntity)
          }

          // 提取类型列表
          const typeIdList = combinedResults.map((item) => item.typeId)
          snippetsStore.setTypeList(await getTypeListByIdList(typeIdList))

          // 根据选中的类型筛选
          combinedResults = combinedResults.filter((item) => {
            if (snippetsStore.snippets.selectTypeId === 0) {
              return true
            } else {
              return item.typeId === snippetsStore.snippets.selectTypeId
            }
          })

          snippetsStore.setResultList(combinedResults)
        }
      } catch (error) {
        console.error('搜索失败:', error)
        snippetsStore.setResultList([])
        snippetsStore.setTypeList([])
      }
    } else {
      snippetsStore.setTypeId(0)
      snippetsStore.setResultList([])
      snippetsStore.setTypeList([])
    }
  }

  // 根据分类id和类型id获取内容列表
  const getContentListByTypeIdAndCategoryId = async (typeId: number, categoryId: number) => {
    const { listArticleByTidAndCid, listAllArticle, listAllArticleNoCategory } = useArticle()
    if (categoryId === 0) {
      // 所以片段
      return await listAllArticle()
    } else if (categoryId === -1) {
      // 未分类
      return await listAllArticleNoCategory()
    } else {
      // 筛选类别
      return await listArticleByTidAndCid(typeId, categoryId)
    }
  }
  return {
    handleSearch,
    getContentListByTypeIdAndCategoryId
  }
}
