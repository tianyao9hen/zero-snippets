export default () => {
  const getAllTypeList = async (): Promise<typeEntity[]> => {
    return await window.api.getAllType()
  }

  const getTypeListByIdList = async (idList: number[]): Promise<typeEntity[]> => {
    return await window.api.getTypeListByIdList(idList)
  }

  return {
    getAllTypeList,
    getTypeListByIdList
  }
}
