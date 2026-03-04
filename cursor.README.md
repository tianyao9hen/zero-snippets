## Zero Snippets 项目导航（Cursor 专用）

本文件主要面向后续在本仓库中协作的 AI 助手与开发者，用于快速理解 Zero Snippets 的**定位、架构、代码习惯与扩展方式**。实现新功能或修改现有逻辑时，请优先遵循这里的约定，再结合根目录的 `AGENTS.md`。

---

## 1. 项目概览

- **项目名称**: Zero Snippets
- **项目定位**: 本地优先的个人知识库工具，整合：
  - 代码片段 / 文章知识库
  - Markdown 随手记
  - 网页书签树与快捷搜索
- **运行形态**: Electron 桌面端应用（Windows / macOS / Linux）
- **核心特性**：
  - F1 唤起主搜索窗口，F2 唤起“随手记”窗口
  - 本地 SQLite 数据库存储，一次初始化，数据长期累积
  - Markdown 编辑使用 Bytemd，支持 GFM / emoji / 高亮 / 图表等
  - 网页书签树支持层级结构、快捷码（如 gg / bd）、参数化搜索 URL

---

## 2. 技术栈与基础命令

- **主技术栈**
  - Electron + `electron-vite`
  - Vue 3 + TypeScript
  - 路由：`vue-router`
  - 状态管理：`pinia`
  - UI / 组件：
    - Ant Design Vue（表单、弹窗等）
    - `@imengyu/vue3-context-menu`（右键菜单）
    - Bytemd（Markdown 编辑）
  - 样式：
    - 全局 SCSS：`global.scss` / `components.scss`
    - Tailwind CSS 工具类：`tailwind.css`
  - 数据库：`better-sqlite3` + 自定义 SQL 层

- **常用脚本**（来自 `package.json`，与 `AGENTS.md` 一致）：
  - 开发：`npm run dev`
  - 预览构建：`npm run start`
  - 构建：`npm run build`
  - 类型检查：`npm run typecheck`（含 node + web）
  - Lint & 格式化：`npm run lint`、`npm run format`
  - 测试：`npm run test`、`npm run test:watch`

后续为项目新增脚本或工具链时，请保持与现有命名风格和验证顺序一致。

---

## 3. 目录与进程划分

项目主要代码目录如下（仅列出与开发密切相关的部分）：

- `src/main/` — **Electron 主进程**
  - `index.ts`：应用入口
    - 保证单实例运行
    - `app.whenReady()` 中初始化全局快捷键、托盘、窗口快捷键等
  - `components/`
    - `window.ts` / `createWindow.ts`：窗口创建与显示控制（如 `showWindowExclusive`，以及 `commandLog` 日志窗口）
    - `tray.ts`：系统托盘图标与菜单
    - `shortcut.ts`：全局快捷键注册 / 注销
    - `autoLaunch.ts`：开机自启动配置
    - `menu.ts`：系统菜单
    - `commandRunner.ts`：命令执行与日志采集（统一执行 / 统一中止、单条命令、运行中实例管理）
    - `db/`：数据库相关
      - `connect.ts`：SQLite 连接
      - `tables.ts`：建表 & 默认数据初始化（**核心，详见第 4 节**）
      - `sql/*.ts`：各业务模块的 SQL 抽象（类型 / 分类 / 内容 / 网页树 / 设置 / 随手记 / 命令等）
    - 其它：`icon.ts`、`favicon.ts`、`bookmarkImportService.ts`、`ossService.ts` 等

- `src/preload/` — **预加载脚本 / 安全桥接层**
  - `index.ts`：
    - 使用 `contextBridge.exposeInMainWorld` 暴露：
      - `window.electron`：基础 Electron API（来自 `@electron-toolkit/preload`）
      - `window.api`：应用自定义 API（数据库操作、窗口控制、开机自启、OSS 上传、命令执行等）
    - **注意**：所有希望暴露给渲染进程的主进程能力，应通过此处的 `api` 对象组合导出。
  - `composables/`：
    - `db.ts`：封装具体数据库操作（文章、分类、网页树、设置、随手记、命令配置与执行等）
    - `window.ts`：窗口显示/隐藏的桥接
    - `menu.ts`：主菜单调用
    - `autoLaunch.ts`：开机自启桥接
    - `setIgnoreMouseEvent.ts`：窗口“点击穿透”控制
    - `ossService.ts`：OSS 上传能力

- `src/renderer/src/` — **Vue 渲染进程应用**
  - `main.ts`：
    - 创建 Vue 应用，挂载 `App.vue`
    - 注册 `vue-router`、`pinia`、`ContextMenu`
    - 引入样式：`global.scss` / `tailwind.css` / `components.scss`
    - 初始化 `useSettingStore().loadSettings()`
  - `App.vue`：
    - 简洁包装，仅渲染 `<router-view>`，由路由决定具体页面
  - `pages/`：
    - 顶层页面，例如：
      - `Snippets.vue`：代码片段搜索主界面
      - `Content.vue`：内容浏览主界面
      - `CommandLog.vue`：命令执行日志窗口（与 `commandLog` 主进程窗口对应）
      - `NoteInput.vue`：随手记窗口
  - `components/`
    - `content/` 子目录：
      - `Article.vue` / `ArticleEntity.vue` / `Blank.vue`：文章内容区
      - `Category.vue` / `category/*`：知识库分类与导航
      - `Web.vue` / `web/*`：网页树、网站分类与导入对话框
      - `Software.vue`：软件列表视图
      - `Command.vue` / `command/*`：命令行配置与执行页面（统一执行 / 单条执行 / 统一中止）
      - `Setting.vue` / `setting/*`：设置总览与各细分页（通用、快捷键、文章、随手记、命令等）
      - `notes/*`：随手记编辑（如 `NoteEditor.vue`）
    - `commandLog/` 子目录：
      - `CommandLogTabs.vue`：命令运行实例标签页与日志视图
    - `snippets/` 子目录：
      - `Search.vue`：顶部搜索输入
      - `TypeList.vue`：左侧类型列表
      - `ResultList.vue` / `Result.vue`：搜索结果列表及单项（已支持命令类型结果）
  - `store/`：
    - `snippetsStore.ts`：搜索框文本、结果列表、当前选中项、类型列表以及键盘导航状态
    - `settingStore.ts`：应用设置（快捷键、随手记配置等）
  - `hooks/`（偏 UI 行为/业务逻辑的组合函数）
    - `useSearch.ts`：搜索主逻辑（文章 + 网页 + 类型过滤）
    - `useSelect.ts`：搜索结果 + 类型 + 输入框的键盘导航和焦点管理
    - 其它：`useArticle.ts`、`useCategory.ts`、`useWebTree.ts`、`useNoteList.ts` 等
  - `composables/`（偏通用工具 & 领域无关逻辑）
    - 如：`dateUtils.ts` / `noteGrouping.ts` / `bookmarkParserUtils.ts` / `faviconUtils.ts` 等
    - 对应 `__tests__` 中使用 Vitest 的单元测试
  - 其它：
    - `route/index.ts`：路由定义
    - `data/index.ts`：静态数据
    - `enums/index.ts`：枚举（如 `WebTreeNodeType`）
    - `assets/styles/*`：全局样式与 Tailwind 配置

- `src/tests/` — 额外的 Vitest 测试（除各处 `__tests__` 外）

---

## 4. 领域模型与数据库设计（简要）

数据库使用 `better-sqlite3`，初始化入口在 `src/main/components/db/tables.ts` 的 `initTable()`：

- **主要表结构**：
  - `snippets_type`：内容类型
    - 预置 4 种：
      - id=1, `name=category`, `title=知识库`
      - id=2, `name=web`, `title=网站库`
      - id=3, `name=software`, `title=电脑软件`
      - id=4, `name=note`, `title=随手记`
  - `snippets_category`：分类（归属到 `type_id`）
    - 预置：
      - type_id=1, `title=欢迎使用`
      - type_id=2, `title=收藏网站`
  - `snippets_content`：具体内容（代码片段/文章）
    - 包含 `type_id` / `category_id` / `title` / `content`
    - 初始化会插入一篇详细的 README 文章（与根目录 `README.md` 内容基本一致）
  - `snippets_web_tree`：网页树（文件夹 + 网页节点）
    - 字段包括：`parent_id`、`type_id`、`title`、`url`、`shortcut`、`description`、`icon`、`param_url`、`category_id`、`node_type` 等
    - 初始化会创建“搜索引擎”根文件夹，并插入 Google / Bing / Baidu / GitHub 等常用搜索引擎节点，每个节点都带有快捷码和参数化搜索 URL
  - `snippets_notes`：随手记
    - 预置两条记录：`工作随手记`、`生活随手记`，支持按 `note_type` 区分
  - `snippets_setting`：键值对配置
    - 使用 `key` + `value` + `remark`，并对 `key` 建索引
    - 初始化默认设置（如 F1/F2 快捷键、随手记分组模式、命令统一执行快捷键等）
  - `snippets_command`：命令行配置
    - 字段示意：`name`、`type`、`base_path`、`command`、`stop_command`、`shortcut`、`allow_unified`、`order_num`、`remark` 等
    - 初始化时会插入若干常见中间件的示例命令（Nacos / Redis / MongoDB / RocketMQ 等），便于用户按自身环境修改

**对新功能的建议**：

- 新增领域实体时，优先考虑是否属于以上几类的扩展（新 `type` / 新 `category` / 新 `setting`）。
- 扩展数据库结构时，应在 `tables.ts` 中集中维护建表与初始化逻辑，并通过 `sql/*` 文件暴露业务级函数。

---

## 5. 渲染侧典型模式与交互风格

### 5.1 搜索与结果选择流

- 搜索主流程在 `src/renderer/src/hooks/useSearch.ts`：
  - 从 `snippetsStore.snippets.search` 读取关键字
  - 判断是否包含空格：
    - 有空格：视为“带参数”的快捷搜索（主要用于网页节点 + `paramUrl`）
      - 调用 `searchWebTreeNodesByShortcut` 按快捷码匹配网页
      - 把结果映射到统一的 `ContentEntity` 结构，并只加载 typeId=2（web）
    - 无空格：并行查询文章 + 网页 + 分类 + 命令（`Promise.all`）
      - 文章结果中追加 `uniqueId=article-<id>`、`categoryName`
      - 网页结果中统一为 `web-<id>`，并保留 `icon` / `url` / `shortcut` / `paramUrl`
      - 命令结果映射为 typeId=5 的 `ContentEntity`，包含 `name` / `command` / `shortcut`
      - 合并顺序：命令 → 文章 → 网页，并基于 `selectTypeId` 做二次过滤
      - 如果搜索词刚好等于“命令统一执行快捷键”（存储在 `snippets_setting` 中），会额外插入一条虚拟的 `command-unified` 结果，用于统一执行/中止
  - 失败时会清空结果与类型列表，并打印错误日志。

- 结果选择 & 键盘交互在 `src/renderer/src/hooks/useSelect.ts`：
  - 维护：
    - `section`：结果列表容器 DOM 引用
    - `items`：`uniqueId → DOM 元素` 映射
  - 对键盘事件进行集中处理：
    - `ArrowUp`/`ArrowDown`：在结果列表中上下移动，并根据位置控制滚动
    - `ArrowLeft`/`ArrowRight`：在类型列表之间切换，触发重新搜索
    - `Enter`：
      - typeId=1（文章）：通过 `window.api.showWindowExclusive('content', path)` 打开内容窗口
      - typeId=2（网页）：
        - 若有 `paramUrl` 且搜索串带参数：将后续参数按空格分割，替换 `paramUrl` 中 `{}` 占位符，然后 `openExternal`
        - 否则直接打开 `url`
      - typeId=5（命令）：
        - 统一执行项（`uniqueId === 'command-unified'`）：如果当前已有允许统一执行的命令在运行，则调用 `stopUnifiedCommands`；否则调用 `runUnifiedCommands` 并聚焦 `commandLog` 窗口
        - 单条命令项：如果该命令正在运行则调用 `stopCommand`，否则调用 `runCommand` 并聚焦 `commandLog` 窗口
  - 通过 `snippetsStore` 里的多个布尔标记（`writeFlag` / `typeFlag` / `resultFlag`）来跟踪当前焦点所在区域。

### 5.2 Markdown 编辑与随手记

- 典型组件：`src/renderer/src/components/content/notes/NoteEditor.vue`
  - 使用 `<script setup lang="ts">` + `defineProps` / `defineEmits`
  - 通过 `@bytemd/vue-next` 的 `Editor` 组件渲染 Markdown 编辑器
  - 插件组合：`breaks`、`frontmatter`、`gemoji`、`gfm`、`highlight`
  - 支持动态高度（`heightOffset` → `editorStyle`），配合窗口大小调整
  - 样式通过 `lang="scss" scoped`，并使用 `:deep()` 有选择地覆盖 Bytemd 内部类名：
    - 隐藏工具栏与状态栏
    - 调整 padding、滚动条样式等

### 5.3 UI / 样式总体风格

- 布局与常用组件：
  - 主布局通常使用 Tailwind 类（如 `w-full h-full`）快速搭建
  - 复杂交互区域（设置页、对话框等）搭配 Ant Design Vue 组件与自定义 SCSS
  - 右键菜单由 `@imengyu/vue3-context-menu` 提供
- 样式组织：
  - 全局样式：`global.scss` + `components.scss` + `tailwind.css`
  - 组件局部样式：优先使用 `lang="scss" scoped`，必要时用 `:deep()` 覆盖第三方组件
  - 代码高亮采用 Light 风格（如 `a11y-light`），整体偏浅色主题

---

## 6. 编码约定与扩展建议

（与 `AGENTS.md` 保持一致，这里仅聚焦在本项目语境下的落地方式）

- **TypeScript & Vue**
  - 所有新逻辑使用 TypeScript 编写
  - Vue 组件优先使用 `<script setup lang="ts">`
  - `defineProps` / `defineEmits` 明确类型定义，避免 `any`

- **目录与职责**
  - 主进程：
    - 新增系统集成功能（托盘、快捷键、自动更新、数据库等），放在 `src/main/components/` 下模块化拆分
    - 涉及到数据库结构变更时，统一修改 `db/tables.ts` 和相关 `sql/*.ts`
  - 预加载层：
    - 任何要暴露给渲染进程的新能力，**必须**先在 `src/preload/composables/*` 中封装，再在 `index.ts` 的 `api` 中显式导出
  - 渲染进程：
    - 页面级视图放在 `pages/`
    - 领域组件放在 `components/content/*`
    - 与 UI 行为强相关的逻辑放在 `hooks/`（如搜索、选择、窗口内交互）
    - 纯工具函数 / 可测试逻辑放在 `composables/`，并尽量为其编写 Vitest 单测
    - 全局/跨页面状态使用 Pinia Store 管理

- **导入与别名**
  - 优先使用已有别名：
    - `@renderer/*` → `src/renderer/src/*`
    - `@enum/*` → `src/enum/*`
  - 导入顺序：Node 内置 → 第三方包 → 应用内 alias → 相对路径；及时清理未使用的导入。

- **错误处理 / 用户体验**
  - 涉及 IO / IPC / 数据库的操作使用 `try/catch` 包裹，记录错误日志但避免向 UI 暴露内部实现细节
  - 业务失败时：
    - 清空/重置相关 Store 状态
    - 在合适位置给出用户友好的错误提示（如 AntD 的 `message` / `notification`）

- **测试与验证**
  - 新增可分离逻辑时，优先将其放入 `composables` 并编写 Vitest 单测
  - 重要改动建议至少跑：
    - `npm run test` 或针对性 `npx vitest run -t "<case>"` / 单文件
    - `npm run typecheck`

---

## 7. 给后续 AI 助手的操作建议

当你（AI 助手）在本项目中继续工作时，可按以下思路定位与修改代码：

- **找入口 / 定位问题**
  - Electron 生命周期与窗口相关：从 `src/main/index.ts` 与 `components/window.ts` 入手
  - 渲染层逻辑：先看 `src/renderer/src/pages/*` 与 `components/content/*`，再跟到对应的 `hooks/` 与 `store/`
  - 涉及数据库的改动：先看 `src/main/components/db/tables.ts`（结构与初始化），再查对应的 `sql/*.ts` 与 `preload/composables/db.ts`

- **新增功能时的推荐路径**
  1. 明确功能属于哪个“领域”：知识库 / 网站库 / 软件 / 随手记 / 设置 / 其它
  2. 如需持久化数据：
     - 设计/扩展表结构 → 修改 `tables.ts` 与对应 `sql/*.ts`
     - 在 `preload/composables/db.ts` 中暴露新的查询/写入函数
     - 在 `preload/index.ts` 的 `api` 对象中导出给渲染进程
  3. 在渲染层：
     - 在合适的 `store` 中增加状态
     - 使用 `hooks` / `composables` 承载复杂逻辑
     - 在 `components` / `pages` 中只做视图与简单交互绑定
  4. 补充或更新测试（如 `src/renderer/src/composables/__tests__`）

- **保持风格一致**
  - 对齐现有命名（英文小写+驼峰）、代码注释风格（重点解释“为什么”而不是“做什么”）、错误处理模式与 UI 风格（浅色主题 + Tailwind + SCSS）。

本文件会在后续协作中作为“权威简版导航”，如实际代码与本说明不符，请以最新代码为准并同步更新本文件。

