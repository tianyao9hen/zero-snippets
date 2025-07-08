import { types } from '@renderer/data'

export default () => {
  const getAllTypeList = ():ContentTypeType[] => {
    return types
  }

  const getTypeListByIdList = (idList: number[]):ContentTypeType[] => {
    return types.filter((item) => idList.includes(item.id))
  }

  return {
    getAllTypeList,
    getTypeListByIdList
  }
}
