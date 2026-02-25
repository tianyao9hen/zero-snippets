import { findAll, findOne, insert, edit } from './index'

/**
 * 获取所有设置
 * @returns 设置列表
 */
export function getAllSettings(): SettingEntity[] {
  const sql = `
    SELECT
      id,
      key,
      value,
      remark,
      create_time as createTime,
      update_time as updateTime
    FROM snippets_setting
    ORDER BY key
  `
  return findAll(sql, {}) as SettingEntity[]
}

/**
 * 根据 key 获取设置
 * @param key 设置键
 * @returns 设置实体或 undefined
 */
export function getSettingByKey(key: string): SettingEntity | undefined {
  const sql = `
    SELECT
      id,
      key,
      value,
      remark,
      create_time as createTime,
      update_time as updateTime
    FROM snippets_setting
    WHERE key = $key
  `
  return findOne(sql, { key }) as SettingEntity | undefined
}

/**
 * 设置值（插入或更新）
 * @param key 设置键
 * @param value 设置值
 * @param remark 设置描述
 * @returns 受影响的行数
 */
export function setSetting(key: string, value: string, remark?: string): number {
  const existing = getSettingByKey(key)

  if (existing) {
    const sql = `
      UPDATE snippets_setting
      SET value = $value,
          remark = COALESCE($remark, remark),
          update_time = datetime(CURRENT_TIMESTAMP, 'localtime')
      WHERE key = $key
    `
    return edit(sql, { key, value, remark: remark || null })
  } else {
    const sql = `
      INSERT INTO snippets_setting(key, value, remark)
      VALUES($key, $value, $remark)
    `
    return insert(sql, { key, value, remark: remark || null }) as number
  }
}

/**
 * 删除设置
 * @param key 设置键
 * @returns 受影响的行数
 */
export function deleteSetting(key: string): number {
  const sql = `DELETE FROM snippets_setting WHERE key = $key`
  return edit(sql, { key })
}
