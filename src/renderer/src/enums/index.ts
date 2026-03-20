/**
 * 网页树节点类型枚举
 * 用于区分文件夹和网页节点
 */
export enum WebTreeNodeType {
  /** 文件夹节点 */
  FOLDER = 0,
  /** 网页节点 */
  WEBSITE = 1
}

/**
 * 随手记类型枚举
 */
export enum NoteType {
  /** 工作随手记 */
  WORK = 0,
  /** 日常随手记 */
  LIVE = 1,
  /** TODO 待办 */
  TODO = 2
}

/**
 * 随手记分组模式枚举
 */
export enum NoteGroupingMode {
  /** 不分组 */
  NONE = 0,
  /** 按日期分组 */
  DATE = 1,
  /** 按周分组 */
  WEEK = 2
}

export enum SettingKey {
  /** 随手记分组模式 */
  NOTE_GROUPING_MODE_KEY = 'note.groupingMode',
  /** 搜索框展示快捷键 */
  SHORTCUT_KEY = 'shortcut.showSnippets',
  /** 随手记展示快捷键 */
  SHORTCUT_NOTE_KEY = 'shortcut.showNote',
  /** 阿里云OSS accessKeyId */
  OSS_ACCESS_KEY_ID = 'oss.accessKeyId',
  /** 阿里云OSS accessKeySecret */
  OSS_ACCESS_KEY_SECRET = 'oss.accessKeySecret',
  /** 阿里云OSS bucket */
  OSS_BUCKET = 'oss.bucket',
  /** 阿里云OSS region */
  OSS_REGION = 'oss.region',
  /** 阿里云OSS 存储目录前缀，如 zero-snippets/images */
  OSS_PATH_PREFIX = 'oss.pathPrefix'
}
