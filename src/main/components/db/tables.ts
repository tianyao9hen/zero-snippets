import { createTable, findOne, insert } from './sql'
import { getSettingByKey, setSetting } from './sql/settingSql'

/**
 * 初始化数据库表结构
 *
 * 该方法会按照顺序创建应用所需的所有数据表。
 * 包括：内容类型表、文章类别表、文章内容表、网页树表、设置表和随手记表。
 * 所有建表语句都包含 `IF NOT EXISTS` 检查，确保不会重复创建。
 * 建表完成后，会调用 `dbInit` 进行数据的初始化。
 */
export function initTable() {
  // 内容类型表：存储基础的内容类型，如文本片段、网页搜索等
  createTable(`
    create table if not exists snippets_type (
      id integer primary key autoincrement not null,
      name text not null,
      title text not null,
      order_num integer not null,
      create_time text not null default(datetime(CURRENT_TIMESTAMP,'localtime'))
    );
  `)

  // 文章类别表：存储代码片段或文章的分类信息
  createTable(`
    create table if not exists snippets_category (
      id integer primary key autoincrement not null,
      type_id integer not null,
      title text not null,
      order_num integer not null,
      create_time text not null default(datetime(CURRENT_TIMESTAMP,'localtime'))
    );
  `)

  // 文章表：存储具体的代码片段或文章内容
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

  // 网页树表 - 用于存储网页地址的层级结构（文件夹和书签）
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
      param_url text,                                 -- 参数URL
      category_id integer not null default 64,        -- 类别ID
      node_type integer not null default 0,           -- 节点类型：0-文件夹，1-网页
      order_num integer not null,                     -- 排序号
      create_time text not null default(datetime(CURRENT_TIMESTAMP,'localtime'))
    );
  `)

  // 设置表 - 用于存储应用配置，键值对形式
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

  // 随手记表：存储临时的笔记或备忘录
  createTable(`
    create table if not exists snippets_notes (
      id integer primary key autoincrement not null,
      type_id integer default 4,
      note_type integer default 0,
      name text,
      note text,
      create_time text not null default(datetime(CURRENT_TIMESTAMP,'localtime'))
    );
  `)

  // 命令表：存储用户配置的 Windows 命令及相关元数据
  createTable(`
    create table if not exists snippets_command (
      id integer primary key autoincrement not null,           -- 主键ID
      name text not null,                                      -- 命令名称
      type text not null,                                      -- 命令类型：如 nacos/redis/mongodb/rocketmq/custom 等
      base_path text,                                          -- 基础路径（预设类型使用），自定义命令可为空
      command text not null,                                   -- 实际执行的完整命令
      stop_command text,                                       -- 关闭命令（优雅停止服务）
      shortcut text,                                           -- 执行快捷键（仅在应用内生效）
      allow_unified integer not null default 0,                -- 是否允许统一执行：0-否，1-是
      order_num integer not null default 0,                    -- 排序号
      remark text,                                             -- 命令说明，用于提示和示范
      create_time text not null default(datetime(CURRENT_TIMESTAMP,'localtime'))
    );
  `)

  // 兼容已有数据库：为 snippets_command 补加 stop_command 列
  try {
    createTable(`ALTER TABLE snippets_command ADD COLUMN stop_command text;`)
  } catch {
    // 列已存在则忽略
  }

  // 创建设置表索引，提高查询效率
  createTable(`
    create index if not exists idx_setting_key on snippets_setting(key);
  `)

  // 初始化表数据：在表结构创建完成后，填充默认的基础数据
  dbInit()
}

/**
 * 数据库数据初始化入口
 *
 * 依次调用各个模块的初始化函数，填充默认数据。
 * 包括：类型、分类、文章、网页树、随手记和设置。
 */
function dbInit() {
  initSnippetsType()
  initSnippetsCategory()
  initSnippetsArticle()
  initSnippetsWebTree()
  initSnippetsNotes()
  initDefaultSettings()
  initSnippetsCommand()
}

/**
 * 初始化内容类型数据
 *
 * 检查 `snippets_type` 表是否为空，如果为空则插入默认的 4 种基础类型：
 * 1. category: 文本片段
 * 2. web: 网页搜索
 * 3. nativeApp: 电脑软件
 * 4. note: 随手记
 */
function initSnippetsType() {
  // 检查是否已经初始化过，避免重复插入
  const isInit = findOne(`select * from snippets_type`, {})
  if (isInit) return

  const types: TypeEntity[] = [
    {
      id: 1,
      name: 'category',
      title: '知识库',
      orderNum: 1
    },
    {
      id: 2,
      name: 'web',
      title: '网站库',
      orderNum: 2
    },
    {
      id: 3,
      name: 'software',
      title: '电脑软件',
      orderNum: 3
    },
    {
      id: 4,
      name: 'note',
      title: '随手记',
      orderNum: 4
    }
  ]

  // 遍历并插入默认类型数据
  types.forEach((type) => {
    insert(`insert into snippets_type(name, title, order_num) values($name, $title, $orderNum)`, {
      name: type.name,
      title: type.title,
      orderNum: type.orderNum
    })
  })
}

/**
 * 初始化文章分类数据
 *
 * 检查 `snippets_category` 表是否为空。
 * 如果为空，则创建默认的分类，如“欢迎使用”和“收藏网站”。
 * 这些分类用于组织初始化的内容。
 */
function initSnippetsCategory() {
  // 检查是否已经初始化过
  const isInit = findOne(`select * from snippets_category`, {})
  if (isInit) return

  // 插入“欢迎使用”分类 (type_id=1, 对应文本片段)
  insert(
    `insert into snippets_category(type_id, title, order_num) values($typeId, $title, $orderNum)`,
    {
      typeId: 1,
      title: '欢迎使用',
      orderNum: 1
    }
  )

  // 插入“收藏网站”分类 (type_id=2, 对应网页搜索)
  insert(
    `insert into snippets_category(type_id, title, order_num) values($typeId, $title, $orderNum)`,
    {
      typeId: 2,
      title: '收藏网站',
      orderNum: 2
    }
  )
}

/**
 * 初始化文章内容数据
 *
 * 检查 `snippets_content` 表是否为空。
 * 如果为空，则创建一篇默认的 README 文章，帮助用户了解软件使用方法。
 * 该文章会被归类到“欢迎使用”分类下。
 */
function initSnippetsArticle() {
  // 检查是否已经初始化过
  const isInit = findOne(`select * from snippets_content`, {})
  if (isInit) return

  // 查找“欢迎使用”分类ID，确保文章关联到正确的分类
  const category = findOne<{ id: number }>(
    `select id from snippets_category where title = $title and type_id = 1`,
    { title: '欢迎使用' }
  )
  const categoryId = category ? category.id : 1 // 默认1如果找不到

  // 准备 README 的 Markdown 内容
  const readmeContent = `# Zero Snippets - 您的本地化个人知识库

## 1. 软件简介

Zero Snippets 是一款专为开发者和知识工作者打造的桌面端知识管理工具。在日常工作中，我们经常会遇到代码片段散落在各地、网页书签难以整理、灵感笔记无处安放的困扰。Zero Snippets 正是为了解决这些问题而生。

它集成了**代码片段管理**、**Markdown 笔记编辑**以及**网页书签整理**三大核心功能，旨在帮助您构建一个私有、高效、且完全掌控在自己手中的知识体系。我们坚持“本地优先”的设计理念，所有数据均存储在您的本地设备上，既保证了极速的访问体验，也最大程度地保护了您的隐私安全。无论您是需要快速复用代码的程序员，还是喜欢沉浸式写作的记录者，Zero Snippets 都能成为您得力的助手。

## 2. 技术架构与依赖

Zero Snippets 基于现代化的 Web 技术栈构建，为您提供流畅、稳定且美观的使用体验。作为用户，您无需深入了解底层技术，但可以确信它是基于成熟且活跃的开源生态打造的。

| 组件类型 | 核心技术 | 说明 |
| :--- | :--- | :--- |
| **应用框架** | Electron 28, Node.js 18+ | 确保跨平台（Windows, macOS, Linux）运行的稳定性 |
| **前端界面** | Vue 3, Ant Design Vue | 响应迅速、交互现代化的用户界面 |
| **开发语言** | TypeScript | 代码健壮，减少运行时错误 |
| **数据存储** | SQLite (better-sqlite3) | 高性能本地数据库，无需联网，数据完全归您所有 |
| **编辑器** | Bytemd | 强大的 Markdown 编辑器，支持数学公式、图表等 |

## 3. 功能一览

*   **代码片段秒搜**：支持模糊搜索与分类管理，瞬间找到您收藏的代码块，提升编码效率。
![1.jpg](https://sdtw-oss-park-v2.oss-cn-qingdao.aliyuncs.com/images/1772088445237_1.jpg "1.jpg")
*   **沉浸式笔记**：基于 Bytemd 的 Markdown 编辑器，支持数学公式与代码高亮，写作体验行云流水。
![2.jpg](https://sdtw-oss-park-v2.oss-cn-qingdao.aliyuncs.com/images/1772088478717_2.jpg "2.jpg")
![6.jpg](https://sdtw-oss-park-v2.oss-cn-qingdao.aliyuncs.com/images/1772088545483_6.jpg "6.jpg")
*   **书签树管理**：支持层级化的书签管理与浏览器书签导入，让杂乱的网页收藏井井有条。
![3.jpg](https://sdtw-oss-park-v2.oss-cn-qingdao.aliyuncs.com/images/1772088489396_3.jpg "3.jpg")
*   **全局快捷键**：默认 F1 唤起搜索，F2 唤起随手记，无需切换窗口，灵感即刻捕捉。

*   **本地数据库**：使用 SQLite 本地存储所有数据，无需担心服务停运或数据泄露，安全可靠。

## 4. 安装与首次运行

我们致力于让安装过程简单直观，即使是初次接触此类软件的用户也能轻松上手。

**第一步：获取安装包**
*   **官方渠道**: 请前往 GitHub Releases 页面下载最新版本的安装包（推荐）。
*   **国内镜像**: （此处可预留国内加速下载链接，如有）

**第二步：安装软件**
*   **Windows**: 双击.exe 安装包或解压压缩包，按照提示点击“下一步”即可完成安装。

**第三步：初始化向导**
首次启动软件时，Zero Snippets 会自动为您初始化本地数据库。您将看到简洁的主界面。
*   **默认配置**: 系统已为您预设了常用的分类标签。
*   **个性化设置**: 您可以进入“设置”页面，根据习惯调整界面主题或修改默认的全局快捷键。

## 5. 使用教程

### 快速上手
只需简单几步，即可完成一次典型的“知识收集”流程：

1.  **唤起**: 按下全局快捷键 F1 打开搜索窗口。
![4.jpg](https://sdtw-oss-park-v2.oss-cn-qingdao.aliyuncs.com/images/1772088562410_4.jpg "4.jpg")
3.  **搜索/新建**: 输入关键词查找现有片段，或点击右上角“+”号新建一个代码片段。
![5.jpg](https://sdtw-oss-park-v2.oss-cn-qingdao.aliyuncs.com/images/1772088574348_5.jpg "5.jpg")
![7.jpg](https://sdtw-oss-park-v2.oss-cn-qingdao.aliyuncs.com/images/1772088612852_7.jpg "7.jpg")
5.  **编辑**: 在编辑器中粘贴您的代码，选择语言（如 JavaScript），并添加描述标签。
6.  **保存**: 点击保存按钮，您的智慧结晶即被安全存入本地数据库。

### 常见问题速查 (Q&A)
1.  **Q: 快捷键 F1/F2 没反应或与其他软件冲突怎么办？**
    *   A: 请进入“设置 -> 快捷键设置”修改为您习惯的组合键（如 Alt+Space）。
2.  **Q: 数据存储在哪里？我可以备份吗？**
    *   A: 数据存储在用户目录下的 SQLite 数据库文件中，您可以直接备份该文件。
3.  **Q: 支持 Markdown 的高级语法吗？**
    *   A: 支持，内置了 GFM、数学公式 (KaTeX) 等插件。
4.  **Q: 只有 Windows 版本吗？**
    *   A: 不止，我们基于 Electron 开发，同时支持 Windows、macOS 和 Linux。
5.  **Q: 软件需要联网注册吗？**
    *   A: 不需要，Zero Snippets 是完全离线的本地软件，无需注册登录。

### 快捷键速查表

| 功能 | 默认快捷键 | 说明 |
| :--- | :--- | :--- |
| **唤起搜索/主窗口** | F1 | 快速打开代码片段搜索界面 |
| **唤起随手记** | F2 | 快速打开小窗记录灵感 |
| **保存** | Ctrl + S / Cmd + S | 在编辑界面保存内容 |
| **关闭窗口** | Esc | 隐藏当前窗口（程序仍在后台运行） |

### 相关链接
*   **项目仓库**:
    * [https://github.com/tianyao9hen/zero-snippets](https://github.com/tianyao9hen/zero-snippets)
    * [https://gitee.com/zeropxf/zero-snippets](https://gitee.com/zeropxf/zero-snippets)
*   **反馈与建议**: 欢迎在 GitHub Issues 中提交问题或建议，我们会尽快回复。
`

  // 插入文章内容
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
      cid: categoryId,
      title: 'Zero Snippets - 您的本地化个人知识库',
      content: readmeContent
    }
  )
}

/**
 * 初始化网页树数据
 *
 * 检查 `snippets_web_tree` 表是否为空。
 * 如果为空，则创建默认的“搜索引擎”文件夹，并在其下添加常用的搜索引擎书签（Google, Bing, Baidu, GitHub）。
 * 这些书签会被归类到“收藏网站”分类下。
 */
function initSnippetsWebTree() {
  // 检查是否已经初始化过
  const isInit = findOne(`select * from snippets_web_tree`, {})
  if (isInit) return

  // 查找“收藏网站”分类ID
  const category = findOne<{ id: number }>(
    `select id from snippets_category where title = $title and type_id = 2`,
    { title: '收藏网站' }
  )
  const categoryId = category ? category.id : 64 // 默认64

  // 创建根级文件夹 - 搜索引擎
  const searchFolderId = insert(
    `insert into snippets_web_tree(parent_id, type_id, title, node_type, order_num, category_id) values($parentId, $typeId, $title, $nodeType, $orderNum, $categoryId)`,
    {
      parentId: 0,
      typeId: 2,
      title: '搜索引擎',
      nodeType: 0,
      orderNum: 1,
      categoryId: categoryId
    }
  ) as number

  // 预设的搜索引擎列表
  const engines = [
    {
      title: 'Google',
      url: 'https://google.com',
      shortcut: 'gg',
      desc: '谷歌搜索',
      icon: 'https://google.com/favicon.ico',
      paramUrl: 'https://www.google.com/search?q={}'
    },
    {
      title: 'Bing',
      url: 'https://bing.com',
      shortcut: 'bing',
      desc: '必应搜索',
      icon: 'https://bing.com/sa/simg/favicon-trans-bg-blue-mg-png.png',
      paramUrl: 'https://www.bing.com/search?q={}'
    },
    {
      title: 'Baidu',
      url: 'https://baidu.com',
      shortcut: 'bd',
      desc: '百度搜索',
      icon: 'https://psstatic.cdn.bcebos.com/video/wiseindex/aa6eef91f8b5b1a33b454c401_1660835115000.png',
      paramUrl: 'https://www.baidu.com/s?wd={}'
    },
    {
      title: 'GitHub',
      url: 'https://github.com',
      shortcut: 'gh',
      desc: '代码托管平台',
      icon: 'https://github.githubassets.com/favicons/favicon.svg',
      paramUrl: 'https://github.com/search?q={}'
    }
  ]

  // 遍历并插入搜索引擎子节点
  engines.forEach((engine, index) => {
    insert(
      `insert into snippets_web_tree(parent_id, type_id, title, url, shortcut, description, icon, param_url, node_type, order_num, category_id) values($parentId, $typeId, $title, $url, $shortcut, $description, $icon, $paramUrl, $nodeType, $orderNum, $categoryId)`,
      {
        parentId: searchFolderId,
        typeId: 2,
        title: engine.title,
        url: engine.url,
        shortcut: engine.shortcut,
        description: engine.desc,
        icon: engine.icon,
        paramUrl: engine.paramUrl,
        nodeType: 1,
        orderNum: index + 1,
        categoryId: categoryId
      }
    )
  })
}

/**
 * 初始化随手记数据
 *
 * 检查 `snippets_notes` 表是否为空。
 * 如果为空，则创建两条默认的随手记：
 * 1. 工作随手记：用于记录工作相关内容。
 * 2. 生活随手记：用于记录日常生活内容。
 */
function initSnippetsNotes() {
  // 检查是否已经初始化过
  const isInit = findOne(`select * from snippets_notes`, {})
  if (isInit) return

  // 插入工作随手记 (note_type = 0)
  insert(
    `insert into snippets_notes(type_id, note_type, name, note) values($typeId, $noteType, $name, $note)`,
    {
      typeId: 4,
      noteType: 0, // WORK
      name: '工作随手记',
      note: '欢迎使用 Zero Snippets 随手记功能！\n在这里您可以快速记录工作中的灵感、任务或者临时代码。\n按下 F2 即可快速唤起本窗口。'
    }
  )

  // 插入生活随手记 (note_type = 1)
  insert(
    `insert into snippets_notes(type_id, note_type, name, note) values($typeId, $noteType, $name, $note)`,
    {
      typeId: 4,
      noteType: 1, // LIVE
      name: '生活随手记',
      note: '这里是您的生活随手记。\n记录生活点滴、购物清单或者旅行计划。\n工作与生活，轻松切换。'
    }
  )
}

/**
 * 初始化命令行示例数据
 *
 * 仅在 snippets_command 表为空时插入预置命令，方便用户参考和快速上手。
 * 用户可在命令行页面中根据自身环境修改 base_path 与命令内容。
 */
function initSnippetsCommand() {
  const isInit = findOne(`select * from snippets_command`, {})
  if (isInit) return

  const commands = [
    {
      name: 'Nacos启动',
      type: 'nacos',
      basePath: 'D:/Nacos/Nacos-server-2.3.0/bin',
      command: 'startup.cmd',
      stopCommand: 'shutdown.cmd',
      shortcut: 'nacos',
      allowUnified: 0,
      orderNum: 100,
      remark: '请将 basePath 改为本机 Nacos bin 目录后保存。'
    },
    {
      name: 'Redis启动',
      type: 'redis',
      basePath: 'D:/Redis',
      command: 'redis-server.exe redis.windows.conf',
      stopCommand: 'redis-cli.exe shutdown',
      shortcut: 'redis',
      allowUnified: 0,
      orderNum: 90,
      remark: '请将 basePath 改为本机 Redis 目录。'
    },
    {
      name: 'MongoDB启动',
      type: 'mongodb',
      basePath: 'D:/mongodb/mongodb-win32-x86_64-windows-8.0.4/bin',
      command: 'mongod --config ../conf/mongodb.conf',
      stopCommand: 'mongod --shutdown --config ../conf/mongodb.conf',
      shortcut: 'mongo',
      allowUnified: 0,
      orderNum: 80,
      remark: '请将 basePath 改为本机 MongoDB bin 目录，并确认 conf 下配置文件存在。'
    },
    {
      name: 'RocketMQ Namesrv',
      type: 'mqnamesrv',
      basePath: 'D:/rocketmq/rocketmq-all-5.3.1-bin-release/bin',
      command: 'mqnamesrv.cmd',
      stopCommand: 'mqshutdown.cmd namesrv',
      shortcut: 'mqns',
      allowUnified: 1,
      orderNum: 70,
      remark: '请将 basePath 改为本机 RocketMQ bin 目录。'
    },
    {
      name: 'RocketMQ Broker',
      type: 'mqbroker',
      basePath: 'D:/rocketmq/rocketmq-all-5.3.1-bin-release/bin',
      command: 'mqbroker.cmd -n 127.0.0.1:9876 autoCreateTopicEnable=true',
      stopCommand: 'mqshutdown.cmd broker',
      shortcut: 'mqbroker',
      allowUnified: 1,
      orderNum: 60,
      remark: '请将 basePath 改为本机 RocketMQ bin 目录，并确保 NameSrv 已启动。'
    },
    {
      name: '自定义命令',
      type: 'custom',
      basePath: '',
      command: 'cmd /c echo Hello Zero Snippets',
      stopCommand: '',
      shortcut: 'demo',
      allowUnified: 0,
      orderNum: 50,
      remark: '自定义命令可直接填写完整 Windows 命令行，例如简单的 echo 测试命令。'
    }
  ]

  commands.forEach((cmd) => {
    insert(
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
        name: cmd.name,
        type: cmd.type,
        basePath: cmd.basePath,
        command: cmd.command,
        stopCommand: cmd.stopCommand || null,
        shortcut: cmd.shortcut,
        allowUnified: cmd.allowUnified,
        orderNum: cmd.orderNum,
        remark: cmd.remark
      }
    )
  })
}

/**
 * 初始化默认设置
 * 在应用启动时调用，确保必要的默认设置存在
 */
function initDefaultSettings(): void {
  const defaultSettings = [
    {
      key: 'shortcut.showSnippets',
      value: 'F1',
      remark: '唤起快捷键：显示/隐藏 snippet 搜索窗口'
    },
    {
      key: 'shortcut.showNote',
      value: 'F2',
      remark: '唤起快捷键：显示/隐藏 随手记窗口'
    },
    {
      key: 'note.groupingMode',
      value: '1',
      remark: '随手记分组模式'
    }
  ]

  for (const setting of defaultSettings) {
    const existing = getSettingByKey(setting.key)
    if (!existing) {
      setSetting(setting.key, setting.value, setting.remark)
    }
  }
}
