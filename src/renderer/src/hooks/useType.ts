export default () => {
  const getAllTypeList = async (): Promise<TypeEntity[]> => {
    return await window.api.getAllType()
  }

  const getTypeListByIdList = async (idList: number[]): Promise<TypeEntity[]> => {
    return await window.api.getTypeListByIdList(idList)
  }

  return {
    getAllTypeList,
    getTypeListByIdList
  }
}
