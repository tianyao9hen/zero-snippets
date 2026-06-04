import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_SETTINGS,
  ensureDefaultCommandMigrations,
  ensureDefaultSettings,
  MONGODB_NEW_STOP_COMMAND,
  MONGODB_OLD_STOP_COMMAND
} from '../main/components/db/tables'
import * as settingSql from '../main/components/db/sql/settingSql'
import * as dbSql from '../main/components/db/sql/index'

// 只验证默认设置补齐逻辑，不触碰真实 SQLite。
vi.mock('../main/components/db/sql/settingSql', () => ({
  getSettingByKey: vi.fn(),
  setSetting: vi.fn()
}))

// tables.ts 导入了数据库执行层，测试中需要隔离 Electron/SQLite 环境。
vi.mock('../main/components/db/sql/index', () => ({
  createTable: vi.fn(),
  edit: vi.fn(),
  findOne: vi.fn(),
  insert: vi.fn()
}))

describe('ensureDefaultSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fills missing quick website shortcut for old installed users', () => {
    vi.mocked(settingSql.getSettingByKey).mockImplementation((key: string) => {
      if (key === 'shortcut.showQuickWebsite') return undefined
      return {
        id: 1,
        key,
        value: 'custom',
        remark: 'existing'
      }
    })

    ensureDefaultSettings()

    expect(settingSql.setSetting).toHaveBeenCalledWith(
      'shortcut.showQuickWebsite',
      'F3',
      '唤起快捷键：显示/隐藏 新增网站窗口'
    )
  })

  it('does not overwrite existing user shortcut values', () => {
    vi.mocked(settingSql.getSettingByKey).mockReturnValue({
      id: 1,
      key: 'shortcut.showQuickWebsite',
      value: 'Ctrl+Shift+W',
      remark: 'user value'
    })

    ensureDefaultSettings()

    const quickWebsiteSetting = DEFAULT_SETTINGS.find(
      (setting) => setting.key === 'shortcut.showQuickWebsite'
    )!

    expect(settingSql.setSetting).not.toHaveBeenCalledWith(
      quickWebsiteSetting.key,
      quickWebsiteSetting.value,
      quickWebsiteSetting.remark
    )
  })
})

describe('ensureDefaultCommandMigrations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates old MongoDB default stop command to the new taskkill command', () => {
    ensureDefaultCommandMigrations()

    expect(dbSql.edit).toHaveBeenCalledWith(expect.stringContaining('update snippets_command'), {
      type: 'mongodb',
      oldStopCommand: MONGODB_OLD_STOP_COMMAND,
      newStopCommand: MONGODB_NEW_STOP_COMMAND
    })
  })

  it('only migrates MongoDB commands that still use the old default stop command', () => {
    ensureDefaultCommandMigrations()

    const [sql] = vi.mocked(dbSql.edit).mock.calls[0]

    expect(sql).toContain('type = $type')
    expect(sql).toContain('stop_command = $oldStopCommand')
  })
})
