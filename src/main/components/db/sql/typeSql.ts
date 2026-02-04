import * as execute from '../sql'

export const findAll = () => {
  return execute.findAll(
    `
    select
      id,
      name,
      title,
      order_num as orderNum,
      create_time as createTime
    from snippets_type
    order by order_num
  `,
    {}
  ) as TypeEntity[]
}

export const findListByIdList = (idList: number[]) => {
  if (!idList || idList.length === 0) {
    return Promise.resolve([])
  }

  const placeholders = idList.map(() => '?').join(',')

  return execute.findAll(
    `
    select
      id,
      name,
      title,
      order_num as orderNum,
      create_time as createTime
    from snippets_type
    where id in (${placeholders})
    order by order_num
  `,
    idList
  ) as TypeEntity[]
}
