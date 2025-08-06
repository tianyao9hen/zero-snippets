import * as execute from '../sql'

export const findAll = () => {
  return execute.findAll(`
    select
      id,
      type_id as typeId,
      title,
      order_num as orderNum,
      create_time as createTime
    from snippets_category
    order by order_num
  `,{}) as CategoryEntity[]
}
