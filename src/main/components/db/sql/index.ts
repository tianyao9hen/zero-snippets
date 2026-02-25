import { db } from '../connect'

export const createTable = (sql: string) => {
  db().exec(sql)
}

export const findAll = <T>(
  sql: string,
  params: Record<string, string | number | null> | number[]
): T[] => {
  return db().prepare(sql).all(params) as T[]
}

export const findOne = <T>(sql: string, params: Record<string, string | number | null>): T => {
  return db().prepare(sql).get(params) as T
}

export const insert = (sql: string, params: Record<string, string | number | null>) => {
  // lastInsertRowid 返回插入的id
  return db().prepare(sql).run(params).lastInsertRowid
}

export const edit = (sql: string, params: Record<string, string | number | null>) => {
  return db().prepare(sql).run(params).changes
}

export const del = (sql: string, params: Record<string, string | number | null>) => {
  // changes 返回受影响的行数
  return db().prepare(sql).run(params).changes
}

export const remove = (sql: string, parmas: Record<string, string | number | null>) => {
  return db().prepare(sql).run(parmas).changes
}
