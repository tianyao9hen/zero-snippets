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

export const getNewOrderNum = () => {
  return execute.findOne(`
    select
      max(order_num) as orderNum
    from snippets_category
  `,{}) as {orderNum: number}
}

export const add = (typeId: number, categoryName: string) => {
  const orderNum = getNewOrderNum()
  return execute.insert(`
    insert into snippets_category(
      type_id,
      title,
      order_num
    ) values($typeId,$title,$orderNum)
  `, {
    typeId: typeId,
    title: categoryName,
    orderNum: orderNum.orderNum + 1
  }) as number
}
