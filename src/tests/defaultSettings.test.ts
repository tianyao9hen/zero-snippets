import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS, ensureDefaultSettings } from '../main/components/db/tables'
import * as settingSql from '../main/components/db/sql/settingSql'

// 只验证默认设置补齐逻辑，不触碰真实 SQLite。
vi.mock('../main/components/db/sql/settingSql', () => ({
  getSettingByKey: vi.fn(),
  setSetting: vi.fn()
}))

// tables.ts 导入了数据库执行层，测试中需要隔离 Electron/SQLite 环境。
vi.mock('../main/components/db/sql/index', () => ({
  createTable: vi.fn(),
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
