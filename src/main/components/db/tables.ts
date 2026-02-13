import { Random } from 'mockjs'
import { createTable, findOne, insert } from './sql'
import { initDefaultSettings } from './sql/settingSql'

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

  // 网页树表 - 用于存储网页地址的层级结构
  createTable(`
    create table if not exists snippets_web_tree (
      id integer primary key autoincrement not null,
      parent_id integer not null default 0,          -- 父节点ID，0表示根节点
      type_id integer not null,                       -- 类型ID，关联snippets_type
      title text not null,                            -- 节点名称
      url text,                                       -- 网页地址（仅叶子节点）
      shortcut text,                                  -- 快捷键（用于搜索）
      description text,                               -- 节点描述
      icon text,                                      -- 网页节点图标地址
      category_id integer not null default 64,        -- 类别ID
      node_type integer not null default 0,           -- 节点类型：0-文件夹，1-网页
      order_num integer not null,                     -- 排序号
      create_time text not null default(datetime(CURRENT_TIMESTAMP,'localtime'))
    );
  `)

  // 设置表 - 用于存储应用配置
  createTable(`
    create table if not exists snippets_setting (
      id integer primary key autoincrement not null,
      key text unique not null,
      value text not null,
      remark text,
      create_time text not null default(datetime(CURRENT_TIMESTAMP,'localtime')),
      update_time text not null default(datetime(CURRENT_TIMESTAMP,'localtime'))
    );
  `)

  // 创建设置表索引
  createTable(`
    create index if not exists idx_setting_key on snippets_setting(key);
  `)

  // 初始化表数据
  dbInit()
}

function dbInit() {
  initSnippetsType()
  initSnippetsCategory()
  initSnippetsArticle()
  initSnippetsWebTree()
  initDefaultSettings()
}

function initSnippetsType() {
  const isInit = findOne(`select * from snippets_type`, {})
  if (isInit) return
  const types: TypeEntity[] = [
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

function initSnippetsArticle() {
  const isInit = findOne(`select * from snippets_content`, {})
  if (isInit) return
  for (let i = 0; i < 50; i++) {
    insert(
      `
      insert into snippets_content(
        type_id,
        category_id,
        title,
        content
      )
      values(
        $tid,
        $cid,
        $title,
        $content
      )
      `,
      {
        tid: 1,
        cid: Math.floor(Math.random() * 3) + 1,
        title: Random.title(2, 10),
        content: Random.csentence(10, 50)
      }
    )
  }
}

/**
 * 初始化网页树数据
 * 创建示例的文件夹和网页节点结构
 */
function initSnippetsWebTree() {
  const isInit = findOne(`select * from snippets_web_tree`, {})
  if (isInit) return

  // 创建根级文件夹
  const devFolderId = insert(
    `insert into snippets_web_tree(parent_id, type_id, title, node_type, order_num) values($parentId, $typeId, $title, $nodeType, $orderNum)`,
    {
      parentId: 0,
      typeId: 2,
      title: '开发工具',
      nodeType: 0,
      orderNum: 1
    }
  ) as number

  const searchFolderId = insert(
    `insert into snippets_web_tree(parent_id, type_id, title, node_type, order_num) values($parentId, $typeId, $title, $nodeType, $orderNum)`,
    {
      parentId: 0,
      typeId: 2,
      title: '搜索引擎',
      nodeType: 0,
      orderNum: 2
    }
  ) as number

  // 在开发工具文件夹下添加网页
  insert(
    `insert into snippets_web_tree(parent_id, type_id, title, url, shortcut, description, node_type, order_num) values($parentId, $typeId, $title, $url, $shortcut, $description, $nodeType, $orderNum)`,
    {
      parentId: devFolderId,
      typeId: 2,
      title: 'GitHub',
      url: 'https://github.com',
      shortcut: 'gh',
      description: '代码托管平台',
      nodeType: 1,
      orderNum: 1
    }
  )

  insert(
    `insert into snippets_web_tree(parent_id, type_id, title, url, shortcut, description, node_type, order_num) values($parentId, $typeId, $title, $url, $shortcut, $description, $nodeType, $orderNum)`,
    {
      parentId: devFolderId,
      typeId: 2,
      title: 'Stack Overflow',
      url: 'https://stackoverflow.com',
      shortcut: 'so',
      description: '开发者问答社区',
      nodeType: 1,
      orderNum: 2
    }
  )

  // 在搜索引擎文件夹下添加网页
  insert(
    `insert into snippets_web_tree(parent_id, type_id, title, url, shortcut, description, node_type, order_num) values($parentId, $typeId, $title, $url, $shortcut, $description, $nodeType, $orderNum)`,
    {
      parentId: searchFolderId,
      typeId: 2,
      title: 'Google',
      url: 'https://google.com',
      shortcut: 'gg',
      description: '谷歌搜索',
      nodeType: 1,
      orderNum: 1
    }
  )

  insert(
    `insert into snippets_web_tree(parent_id, type_id, title, url, shortcut, description, node_type, order_num) values($parentId, $typeId, $title, $url, $shortcut, $description, $nodeType, $orderNum)`,
    {
      parentId: searchFolderId,
      typeId: 2,
      title: 'Bing',
      url: 'https://bing.com',
      shortcut: 'bing',
      description: '必应搜索',
      nodeType: 1,
      orderNum: 2
    }
  )
}
