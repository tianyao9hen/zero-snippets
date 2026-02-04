import { db } from '../connect'

export const createTable = (sql: string) => {
  db().exec(sql)
}

export const findAll = (sql: string, params: Record<string, string | number | null> | number[]) => {
  return db().prepare(sql).all(params)
}

export const findOne = (sql: string, params: Record<string, string | number | null>) => {
  return db().prepare(sql).get(params)
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
