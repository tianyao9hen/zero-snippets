import {categoryList} from '@renderer/data'

export default () => {
  const getAllCategoryList = (): CategoryType[] => {
    return categoryList
  }

  return {
    getAllCategoryList
  }
}
