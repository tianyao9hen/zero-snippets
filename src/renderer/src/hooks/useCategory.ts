import {categoryList} from '@renderer/data'

export default () => {
  const getAllCategoryList = async (): Promise<CategoryEntity[]> => {
    return await window.api.getAllCategory()
  }

  return {
    getAllCategoryList
  }
}
