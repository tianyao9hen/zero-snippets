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

export const edit = (categoryId: number, categoryTitle: string) => {
  return execute.edit(`
    update snippets_category
    set
      title = $title
    where
      id = $id
    `, {
      id: categoryId,
      title: categoryTitle
    }) as number
}

export const remove = (categoryId: number) => {
  return execute.remove(`
    delete from snippets_category
    where
      id = $id
    `, {
      id: categoryId
    }) as number
}
