export default () => {

  /**
   * 根据文章id获取文章
   * @param aid 文章id
   * @returns
   */
  const getArticleById = async (aid: number): Promise<ContentEntity> => {
    return await window.api.getArticleById(aid)
  }

  const listArticleByTidAndCid = async(tid: number, cid: number): Promise<ContentEntity[]> => {
    return await window.api.listArticleByTidAndCid(tid, cid)
  }

  const listAllArticle = async (): Promise<ContentEntity[]> => {
    return await window.api.listAllArticle()
  }

  const listAllArticleNoCategory = async (): Promise<ContentEntity[]> => {
    return await window.api.listAllArticleNoCategory()
  }

  const editArticle = async (article: ContentEntity): Promise<number> => {
    return await window.api.editArticle({...article})
  }

  return {
    getArticleById,
    listArticleByTidAndCid,
    listAllArticle,
    listAllArticleNoCategory,
    editArticle
  }
}
