export default () => {

  /**
   * 获取全部分类列表
   * @returns Promise<CategoryEntity[]> 分类列表
   */
  const getAllCategoryList = async (): Promise<CategoryEntity[]> => {
    return await window.api.getAllCategory()
  }

  /**
   * 新增类别
   * @param typeId 大类id
   * @param categoryName 类别名称
   * @returns Promise<number> 新增类别的id
   */
  const addCategoryItem = async (typeId: number, categoryName: string): Promise<number> => {
    return await window.api.addCategory(typeId, categoryName)
  }

  return {
    getAllCategoryList,
    addCategoryItem
  }
}
