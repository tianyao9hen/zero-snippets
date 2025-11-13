import * as execute from '../sql'

export const getById = (aid: number) => {
  return execute.findOne(
    `
    select
      id,
      type_id as typeId,
      category_id as categoryId,
      title,
      content,
      create_time as createTime
    from snippets_content
    where
      id = $id
    `,
    {
      id: aid
    }
  ) as ContentEntity
}

export const listByTidAndCid = (tid: number, cid: number) => {
  return execute.findAll(
    `
    select
      id,
      type_id as typeId,
      category_id as categoryId,
      title,
      content,
      create_time as createTime
    from snippets_content
    where
      type_id = $tid
      and category_id = $cid
    order by create_time desc
    `,
    {
      tid,
      cid
    }
  ) as ContentEntity[]
}

export const listAll = () => {
  return execute.findAll(
    `
    select
      id,
      type_id as typeId,
      category_id as categoryId,
      title,
      content,
      create_time as createTime
    from snippets_content
    order by create_time desc
    `,
    {}
  ) as ContentEntity[]
}

export const listAllNoCategory = () => {
  return execute.findAll(
    `
    select
      id,
      type_id as typeId,
      category_id as categoryId,
      title,
      content,
      create_time as createTime
    from snippets_content
    where category_id is null
    order by create_time desc
    `,
    {}
  ) as ContentEntity[]
}
