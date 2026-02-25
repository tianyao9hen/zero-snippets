import * as execute from '../sql'
import { db } from '../connect'

/**
 * 网页树节点实体接口
 * 对应数据库表 snippets_web_tree 的结构
 */
interface WebTreeNodeEntity {
  id: number
  parentId: number
  typeId: number
  title: string | null
  url?: string | null
  shortcut?: string | null
  description?: string | null
  icon?: string | null
  paramUrl?: string | null
  categoryId?: number | null
  nodeType: number // 0-文件夹, 1-网页
  orderNum: number
  createTime?: string
}

/**
 * 获取指定类型的所有节点（扁平列表）
 * @param typeId 类型ID
 * @returns WebTreeNodeEntity[] 节点列表
 */
export const findAllByTypeId = (typeId: number): WebTreeNodeEntity[] => {
  return execute.findAll(
    `
    select
      id,
      parent_id as parentId,
      type_id as typeId,
      title,
      url,
      shortcut,
      description,
      icon,
      param_url as paramUrl,
      category_id as categoryId,
      node_type as nodeType,
      order_num as orderNum,
      create_time as createTime
    from snippets_web_tree
    where type_id = $typeId
    order by order_num
  `,
    { typeId }
  ) as WebTreeNodeEntity[]
}

/**
 * 将文件夹设置为目录（事务操作）
 * 1. 创建新目录
 * 2. 更新子节点 category_id
 * 3. 将直接子节点 parent_id 设为 0
 * 4. 删除原文件夹节点
 * @param folderId 文件夹节点ID
 * @param folderName 文件夹名称
 * @param typeId 类型ID
 * @returns number 新创建的目录ID
 */
export const setFolderAsCategory = (
  folderId: number,
  folderName: string,
  typeId: number
): number => {
  const database = db()
  let newCategoryId = 0

  const transaction = database.transaction(() => {
    // 1. 创建新目录
    // 获取当前最大 order_num
    const maxOrderRes = database
      .prepare('select max(order_num) as maxOrderNum from snippets_category')
      .get() as { maxOrderNum: number }
    const newOrderNum = (maxOrderRes?.maxOrderNum || 0) + 1

    // 插入新目录
    const insertRes = database
      .prepare(
        `
      insert into snippets_category(
        type_id,
        title,
        order_num
      ) values(
        @typeId,
        @title,
        @orderNum
      )
    `
      )
      .run({
        typeId,
        title: folderName,
        orderNum: newOrderNum
      })

    newCategoryId = Number(insertRes.lastInsertRowid)

    // 2. 获取该文件夹节点的完整子树并更新 category_id
    // 使用 CTE 递归查询获取所有后代节点ID
    // 注意：SQLite 支持递归 CTE
    database
      .prepare(
        `
      WITH RECURSIVE subtree AS (
        SELECT id FROM snippets_web_tree WHERE id = @folderId
        UNION ALL
        SELECT t.id FROM snippets_web_tree t JOIN subtree s ON t.parent_id = s.id
      )
      UPDATE snippets_web_tree 
      SET category_id = @newCategoryId 
      WHERE id IN (SELECT id FROM subtree WHERE id != @folderId)
    `
      )
      .run({
        folderId,
        newCategoryId
      })

    // 3. 将直接子节点的 parent_id 设置为 0（移到根级别）
    database
      .prepare(
        `
      UPDATE snippets_web_tree
      SET parent_id = 0
      WHERE parent_id = @folderId
    `
      )
      .run({
        folderId
      })

    // 4. 删除原文件夹节点
    database
      .prepare(
        `
      DELETE FROM snippets_web_tree
      WHERE id = @folderId
    `
      )
      .run({
        folderId
      })
  })

  // 执行事务
  transaction()

  return newCategoryId
}

/**
 * 根据父节点ID获取子节点列表
 * @param parentId 父节点ID
 * @param typeId 类型ID
 * @returns WebTreeNodeEntity[] 子节点列表
 */
export const findByParentId = (parentId: number, typeId: number): WebTreeNodeEntity[] => {
  return execute.findAll(
    `
    select
      id,
      parent_id as parentId,
      type_id as typeId,
      title,
      url,
      shortcut,
      description,
      icon,
      param_url as paramUrl,
      category_id as categoryId,
      node_type as nodeType,
      order_num as orderNum,
      create_time as createTime
    from snippets_web_tree
    where parent_id = $parentId and type_id = $typeId
    order by order_num
  `,
    { parentId, typeId }
  ) as WebTreeNodeEntity[]
}

/**
 * 根据ID获取单个节点
 * @param id 节点ID
 * @returns WebTreeNodeEntity | undefined 节点实体
 */
export const findById = (id: number): WebTreeNodeEntity | undefined => {
  return execute.findOne(
    `
    select
      id,
      parent_id as parentId,
      type_id as typeId,
      title,
      url,
      shortcut,
      description,
      icon,
      param_url as paramUrl,
      category_id as categoryId,
      node_type as nodeType,
      order_num as orderNum,
      create_time as createTime
    from snippets_web_tree
    where id = $id
  `,
    { id }
  ) as WebTreeNodeEntity | undefined
}

/**
 * 获取指定父节点下的最大排序号
 * @param parentId 父节点ID
 * @returns number 最大排序号
 */
export const getMaxOrderNum = (parentId: number): number => {
  const result = execute.findOne(
    `
    select max(order_num) as maxOrderNum
    from snippets_web_tree
    where parent_id = $parentId
  `,
    { parentId }
  ) as { maxOrderNum: number } | undefined
  return result?.maxOrderNum || 0
}

/**
 * 添加新节点
 * @param node 节点数据（不包含id和createTime）
 * @returns number 新节点的ID
 */
export const add = (node: Omit<WebTreeNodeEntity, 'id' | 'createTime'>): number => {
  const maxOrderNum = getMaxOrderNum(node.parentId)
  return execute.insert(
    `
    insert into snippets_web_tree(
      parent_id,
      type_id,
      title,
      url,
      shortcut,
      description,
      icon,
      category_id,
      node_type,
      order_num
    ) values(
      $parentId,
      $typeId,
      $title,
      $url,
      $shortcut,
      $description,
      $icon,
      $categoryId,
      $nodeType,
      $orderNum
    )
  `,
    {
      parentId: node.parentId,
      typeId: node.typeId,
      title: node.title ?? '',
      url: node.url ?? null,
      shortcut: node.shortcut ?? null,
      description: node.description ?? null,
      icon: node.icon ?? null,
      categoryId: node.categoryId ?? -1,
      nodeType: node.nodeType,
      orderNum: maxOrderNum + 1
    }
  ) as number
}

/**
 * 更新节点信息
 * @param id 节点ID
 * @param updates 需要更新的字段
 * @returns number 受影响的行数
 */
export const update = (
  id: number,
  updates: Partial<Omit<WebTreeNodeEntity, 'id' | 'createTime'>>
): number => {
  // 构建动态更新SQL
  const fields: string[] = []
  const params: Record<string, string | number | null> = { id }

  if (updates.parentId !== undefined) {
    fields.push('parent_id = $parentId')
    params.parentId = updates.parentId
  }
  if (updates.title !== undefined) {
    fields.push('title = $title')
    params.title = updates.title ?? ''
  }
  if (updates.url !== undefined) {
    fields.push('url = $url')
    params.url = updates.url ?? null
  }
  if (updates.shortcut !== undefined) {
    fields.push('shortcut = $shortcut')
    params.shortcut = updates.shortcut ?? null
  }
  if (updates.description !== undefined) {
    fields.push('description = $description')
    params.description = updates.description ?? null
  }
  if (updates.icon !== undefined) {
    fields.push('icon = $icon')
    params.icon = updates.icon ?? null
  }
  if (updates.paramUrl !== undefined) {
    fields.push('param_url = $paramUrl')
    params.paramUrl = updates.paramUrl ?? null
  }
  if (updates.categoryId !== undefined) {
    fields.push('category_id = $categoryId')
    params.categoryId = updates.categoryId
  }
  if (updates.nodeType !== undefined) {
    fields.push('node_type = $nodeType')
    params.nodeType = updates.nodeType
  }
  if (updates.orderNum !== undefined) {
    fields.push('order_num = $orderNum')
    params.orderNum = updates.orderNum
  }

  if (fields.length === 0) return 0

  return execute.edit(
    `
    update snippets_web_tree
    set ${fields.join(', ')}
    where id = $id
  `,
    params
  ) as number
}

/**
 * 删除节点及其所有子节点（级联删除）
 * @param id 节点ID
 * @returns number 删除的节点总数
 */
export const remove = (id: number): number => {
  // 先递归删除所有子节点
  const children = execute.findAll(`select id from snippets_web_tree where parent_id = $id`, {
    id
  }) as { id: number }[]

  let deletedCount = 0
  for (const child of children) {
    deletedCount += remove(child.id)
  }

  // 删除当前节点
  deletedCount += execute.remove(`delete from snippets_web_tree where id = $id`, { id }) as number

  return deletedCount
}

/**
 * 更新节点排序
 * @param id 节点ID
 * @param orderNum 新的排序号
 * @returns number 受影响的行数
 */
export const updateOrder = (id: number, orderNum: number): number => {
  return execute.edit(
    `
    update snippets_web_tree
    set order_num = $orderNum
    where id = $id
  `,
    { id, orderNum }
  ) as number
}

/**
 * 更新节点的 category_id
 * @param id 节点ID
 * @param categoryId 新的类别ID
 * @returns number 受影响的行数
 */
export const updateCategoryId = (id: number, categoryId: number): number => {
  return execute.edit(
    `
    update snippets_web_tree
    set category_id = $categoryId
    where id = $id
  `,
    { id, categoryId }
  ) as number
}

/**
 * 递归更新节点及其所有子节点的 category_id
 * @param id 节点ID
 * @param categoryId 新的类别ID
 * @param typeId 类型ID（用于查询子节点）
 * @returns number 受影响的行数总数
 */
export const updateCategoryIdRecursive = (
  id: number,
  categoryId: number,
  typeId: number
): number => {
  let affectedRows = 0

  // 更新当前节点的 category_id
  affectedRows += updateCategoryId(id, categoryId)

  // 递归获取并更新所有子节点
  const children = findChildrenByParentId(id, typeId)
  for (const child of children) {
    affectedRows += updateCategoryIdRecursive(child.id, categoryId, typeId)
  }

  return affectedRows
}

/**
 * 批量更新节点的 category_id
 * @param ids 节点ID数组
 * @param categoryId 新的类别ID
 * @returns number 受影响的行数
 */
export const updateCategoryIdBatch = (ids: number[], categoryId: number): number => {
  if (ids.length === 0) return 0

  const placeholders = ids.map((_, index) => `$id${index}`).join(', ')
  const params: Record<string, number> = { categoryId }
  ids.forEach((id, index) => {
    params[`id${index}`] = id
  })

  return execute.edit(
    `
    update snippets_web_tree
    set category_id = $categoryId
    where id in (${placeholders})
  `,
    params
  ) as number
}

/**
 * 移动节点到新的父节点
 * @param id 节点ID
 * @param newParentId 新的父节点ID
 * @returns number 受影响的行数
 */
export const moveNode = (id: number, newParentId: number): number => {
  const maxOrderNum = getMaxOrderNum(newParentId)
  return execute.edit(
    `
    update snippets_web_tree
    set parent_id = $newParentId, order_num = $orderNum
    where id = $id
  `,
    { id, newParentId, orderNum: maxOrderNum + 1 }
  ) as number
}

/**
 * 批量更新节点排序
 * @param orders 节点ID和排序号的映射数组
 * @returns number 受影响的行数
 */
export const updateOrders = (orders: { id: number; orderNum: number }[]): number => {
  let affectedRows = 0
  for (const { id, orderNum } of orders) {
    affectedRows += updateOrder(id, orderNum)
  }
  return affectedRows
}

/**
 * 获取指定父节点下的所有子节点（按排序号）
 * @param parentId 父节点ID
 * @param typeId 类型ID
 * @returns WebTreeNodeEntity[] 子节点列表
 */
export const findChildrenByParentId = (parentId: number, typeId: number): WebTreeNodeEntity[] => {
  return execute.findAll(
    `
    select
      id,
      parent_id as parentId,
      type_id as typeId,
      title,
      url,
      shortcut,
      description,
      icon,
      param_url as paramUrl,
      category_id as categoryId,
      node_type as nodeType,
      order_num as orderNum,
      create_time as createTime
    from snippets_web_tree
    where parent_id = $parentId and type_id = $typeId
    order by order_num
  `,
    { parentId, typeId }
  ) as WebTreeNodeEntity[]
}

/**
 * 根据类型ID和类别ID获取节点列表
 * @param typeId 类型ID
 * @param categoryId 类别ID
 * @returns WebTreeNodeEntity[] 节点列表
 */
export const findAllByTypeIdAndCategoryId = (
  typeId: number,
  categoryId: number
): WebTreeNodeEntity[] => {
  return execute.findAll(
    `
    select
      id,
      parent_id as parentId,
      type_id as typeId,
      title,
      url,
      shortcut,
      description,
      icon,
      param_url as paramUrl,
      category_id as categoryId,
      node_type as nodeType,
      order_num as orderNum,
      create_time as createTime
    from snippets_web_tree
    where type_id = $typeId
      and category_id = $categoryId
    order by order_num
  `,
    { typeId, categoryId }
  ) as WebTreeNodeEntity[]
}

/**
 * 根据类型ID获取未分类节点（category_id 为 -1）
 * @param typeId 类型ID
 * @returns WebTreeNodeEntity[] 节点列表
 */
export const findAllByTypeIdAndNullCategory = (typeId: number): WebTreeNodeEntity[] => {
  return execute.findAll(
    `
    select
      id,
      parent_id as parentId,
      type_id as typeId,
      title,
      url,
      shortcut,
      description,
      icon,
      param_url as paramUrl,
      category_id as categoryId,
      node_type as nodeType,
      order_num as orderNum,
      create_time as createTime
    from snippets_web_tree
    where type_id = $typeId
      and category_id = -1
    order by order_num
  `,
    { typeId }
  ) as WebTreeNodeEntity[]
}

/**
 * 搜索节点（根据标题、URL、快捷键或描述）
 * @param keyword 搜索关键词
 * @param typeId 类型ID
 * @returns WebTreeNodeEntity[] 匹配的节点列表
 */
export const search = (keyword: string, typeId: number, nodeType: number): WebTreeNodeEntity[] => {
  const searchPattern = `%${keyword}%`
  return execute.findAll(
    `
    select
      id,
      parent_id as parentId,
      type_id as typeId,
      title,
      url,
      shortcut,
      description,
      icon,
      param_url as paramUrl,
      category_id as categoryId,
      node_type as nodeType,
      order_num as orderNum,
      create_time as createTime
    from snippets_web_tree
    where type_id = $typeId
      and (
        title like $searchPattern
        or url like $searchPattern
        or shortcut like $searchPattern
        or description like $searchPattern
      )
      and node_type = $nodeType
    order by order_num
  `,
    { typeId, searchPattern, nodeType }
  ) as WebTreeNodeEntity[]
}

export const searchByShortcut = (
  keyword: string,
  typeId: number,
  nodeType: number
): WebTreeNodeEntity[] => {
  return execute.findAll(
    `
    select
      id,
      parent_id as parentId,
      type_id as typeId,
      title,
      url,
      shortcut,
      description,
      icon,
      param_url as paramUrl,
      category_id as categoryId,
      node_type as nodeType,
      order_num as orderNum,
      create_time as createTime
    from snippets_web_tree
    where type_id = $typeId
      and shortcut = $keyword
      and node_type = $nodeType
    order by order_num
  `,
    { typeId, keyword, nodeType }
  ) as WebTreeNodeEntity[]
}
