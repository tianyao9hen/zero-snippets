import { Random } from 'mockjs'
import { createTable, findOne, insert } from './sql'

export function initTable() {
  // 内容类型表
  createTable(`
    create table if not exists snippets_type (
      id integer primary key autoincrement not null,
      name text not null,
      title text not null,
      order_num integer not null,
      create_time text not null default(datetime(CURRENT_TIMESTAMP,'localtime'))
    );
  `)

  // 文章类别表
  createTable(`
    create table if not exists snippets_category (
      id integer primary key autoincrement not null,
      type_id integer not null,
      title text not null,
      order_num integer not null,
      create_time text not null default(datetime(CURRENT_TIMESTAMP,'localtime'))
    );
  `)

  // 文章表
  createTable(`
    create table if not exists snippets_content (
      id integer primary key autoincrement not null,
      type_id integer not null,
      category_id integer not null,
      title text not null,
      content text not null,
      create_time text not null default(datetime(CURRENT_TIMESTAMP,'localtime'))
    );
  `)

  // 初始化表数据
  dbInit()
}

function dbInit() {
  initSnippetsType()
  initSnippetsCategory()
}

function initSnippetsType() {
  const isInit = findOne(`select * from snippets_type`, {})
  if (isInit) return
  const types: typeEntity[] = [
    {
      id: 1,
      name: 'category',
      title: '文本片段',
      orderNum: 1
    },
    {
      id: 2,
      name: 'web',
      title: '网页搜索',
      orderNum: 2
    },
    {
      id: 3,
      name: 'nativeApp',
      title: '电脑软件',
      orderNum: 3
    }
  ]
  types.forEach((type) => {
    insert(`insert into snippets_type(name, title, order_num) values($name, $title, $orderNum)`, {
      name: type.name,
      title: type.title,
      orderNum: type.orderNum
    })
  })
}

function initSnippetsCategory() {
  const isInit = findOne(`select * from snippets_category`, {})
  if (isInit) return
  for (let i = 0; i < 10; i++) {
    insert(
      `insert into snippets_category(type_id, title, order_num) values($typeId, $title, $orderNum)`,
      {
        typeId: 1,
        title: Random.title(2, 10),
        orderNum: i
      }
    )
  }
}
