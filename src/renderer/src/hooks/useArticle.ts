export default () => {
  /**
   * 根据文章id获取文章
   * @param aid 文章id
   * @returns
   */
  const getArticleById = async (aid: number): Promise<ContentEntity> => {
    return await window.api.getArticleById(aid)
  }

  const listArticleByTidAndCid = async (tid: number, cid: number): Promise<ContentEntity[]> => {
    return await window.api.listArticleByTidAndCid(tid, cid)
  }

  const listAllArticle = async (): Promise<ContentEntity[]> => {
    return await window.api.listAllArticle()
  }

  const listAllArticleNoCategory = async (): Promise<ContentEntity[]> => {
    return await window.api.listAllArticleNoCategory()
  }

  const editArticle = async (article: ContentEntity): Promise<number> => {
    return await window.api.editArticle({ ...article })
  }

  const removeArticle = async (aid: number): Promise<number> => {
    return await window.api.removeArticle(aid)
  }

  const addArticle = async (Article: ContentEntity): Promise<number> => {
    return await window.api.addArticle({ ...Article })
  }

  /**
   * 搜索文章
   * @param keyword 搜索关键词
   * @returns Promise<ContentEntity[]> 匹配的文章列表
   */
  const searchArticle = async (keyword: string): Promise<ContentEntity[]> => {
    return await window.api.searchArticle(keyword)
  }

  return {
    getArticleById,
    listArticleByTidAndCid,
    listAllArticle,
    listAllArticleNoCategory,
    editArticle,
    removeArticle,
    addArticle,
    searchArticle
  }
}
