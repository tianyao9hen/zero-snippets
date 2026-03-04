import * as execute from '../sql'

/**
 * @description 获取所有命令列表，按排序号和创建时间倒序
 */
export const findAllCommands = (): CommandEntity[] => {
  return execute.findAll(
    `
    select
      id,
      name,
      type,
      base_path as basePath,
      command,
      stop_command as stopCommand,
      shortcut,
      allow_unified as allowUnified,
      order_num as orderNum,
      remark,
      create_time as createTime
    from snippets_command
    order by
      order_num desc,
      create_time desc
    `,
    {}
  ) as CommandEntity[]
}

/**
 * @description 根据关键词搜索命令（命令名称、快捷键、命令内容模糊匹配）
 * @param keyword 搜索关键词
 */
export const searchCommands = (keyword: string): CommandEntity[] => {
  const pattern = `%${keyword}%`
  return execute.findAll(
    `
    select
      id,
      name,
      type,
      base_path as basePath,
      command,
      stop_command as stopCommand,
      shortcut,
      allow_unified as allowUnified,
      order_num as orderNum,
      remark,
      create_time as createTime
    from snippets_command
    where
      name like $pattern
      or shortcut like $pattern
    order by
      order_num desc,
      create_time desc
    `,
    { pattern }
  ) as CommandEntity[]
}

/**
 * @description 新增命令
 * @param command 命令实体
 */
export const addCommand = (command: Omit<CommandEntity, 'id' | 'createTime'>) => {
  return execute.insert(
    `
    insert into snippets_command(
      name,
      type,
      base_path,
      command,
      stop_command,
      shortcut,
      allow_unified,
      order_num,
      remark
    ) values (
      $name,
      $type,
      $basePath,
      $command,
      $stopCommand,
      $shortcut,
      $allowUnified,
      $orderNum,
      $remark
    )
    `,
    {
      name: command.name,
      type: command.type,
      basePath: command.basePath ?? null,
      command: command.command,
      stopCommand: command.stopCommand ?? null,
      shortcut: command.shortcut ?? null,
      allowUnified: command.allowUnified ? 1 : 0,
      orderNum: command.orderNum ?? 0,
      remark: command.remark ?? null
    }
  )
}

/**
 * @description 更新命令
 * @param id 命令ID
 * @param updates 需要更新的字段
 */
export const updateCommand = (
  id: number,
  updates: Partial<Omit<CommandEntity, 'id' | 'createTime'>>
) => {
  const fields: string[] = []
  const params: Record<string, string | number | null> = { id }

  if (updates.name !== undefined) {
    fields.push('name = $name')
    params.name = updates.name
  }
  if (updates.type !== undefined) {
    fields.push('type = $type')
    params.type = updates.type
  }
  if (updates.basePath !== undefined) {
    fields.push('base_path = $basePath')
    params.basePath = updates.basePath ?? null
  }
  if (updates.command !== undefined) {
    fields.push('command = $command')
    params.command = updates.command
  }
  if (updates.stopCommand !== undefined) {
    fields.push('stop_command = $stopCommand')
    params.stopCommand = updates.stopCommand ?? null
  }
  if (updates.shortcut !== undefined) {
    fields.push('shortcut = $shortcut')
    params.shortcut = updates.shortcut ?? null
  }
  if (updates.allowUnified !== undefined) {
    fields.push('allow_unified = $allowUnified')
    params.allowUnified = updates.allowUnified ? 1 : 0
  }
  if (updates.orderNum !== undefined) {
    fields.push('order_num = $orderNum')
    params.orderNum = updates.orderNum
  }
  if (updates.remark !== undefined) {
    fields.push('remark = $remark')
    params.remark = updates.remark ?? null
  }

  if (fields.length === 0) {
    return 0
  }

  const sql = `
    update snippets_command
    set ${fields.join(', ')}
    where id = $id
  `

  return execute.edit(sql, params)
}

/**
 * @description 删除命令
 * @param id 命令ID
 */
export const removeCommand = (id: number) => {
  return execute.remove(
    `
    delete from snippets_command
    where id = $id
    `,
    { id }
  )
}
