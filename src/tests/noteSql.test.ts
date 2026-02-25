import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as noteSql from '../main/components/db/sql/noteSql'
import * as execute from '../main/components/db/sql/index'

// Mock the module
vi.mock('../main/components/db/sql/index', () => ({
  insert: vi.fn(),
  edit: vi.fn(),
  remove: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn()
}))

describe('noteSql', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('add should call insert with correct params', () => {
    const note = { name: 'Test', note: 'Content' }
    noteSql.add(note)
    expect(execute.insert).toHaveBeenCalledWith(
      expect.stringContaining('insert into snippets_notes'),
      expect.objectContaining({
        typeId: 4,
        noteType: 0,
        name: 'Test',
        note: 'Content'
      })
    )
  })

  it('edit should call edit with correct params', () => {
    const note = { id: 1, name: 'Updated', note: 'New Content', noteType: 1 }
    noteSql.edit(note)
    expect(execute.edit).toHaveBeenCalledWith(
      expect.stringContaining('update snippets_notes'),
      expect.objectContaining({
        id: 1,
        noteType: 1,
        name: 'Updated',
        note: 'New Content'
      })
    )
  })

  it('remove should call remove with correct id', () => {
    noteSql.remove(123)
    expect(execute.remove).toHaveBeenCalledWith(
      expect.stringContaining('delete from snippets_notes'),
      expect.objectContaining({ id: 123 })
    )
  })

  it('listAll should call findAll', () => {
    noteSql.listAll()
    expect(execute.findAll).toHaveBeenCalledWith(expect.stringContaining('select'), {})
  })
})
