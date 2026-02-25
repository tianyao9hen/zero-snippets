import { describe, it, expect } from 'vitest'
import { groupNotes, NoteEntity } from '../noteGrouping'
import { NoteGroupingMode } from '../../enums'

const createNote = (id: number, createTime: string): NoteEntity => ({
  id,
  typeId: 4,
  noteType: 0,
  name: `Note ${id}`,
  note: 'content',
  createTime
})

describe('noteGrouping', () => {
  const notes = [
    createNote(1, '2024-02-25T10:00:00'), // Today (Sunday)
    createNote(2, '2024-02-24T10:00:00'), // Yesterday (Saturday)
    createNote(3, '2024-02-18T10:00:00'), // Last Sunday (Previous Week)
    createNote(4, '2024-02-17T10:00:00'), // Last Saturday (Previous Week)
  ]

  it('groups correctly by none', () => {
    const groups = groupNotes(notes, NoteGroupingMode.NONE)
    expect(groups).toHaveLength(1)
    expect(groups[0].notes).toHaveLength(4)
  })

  it('groups correctly by date', () => {
    const groups = groupNotes(notes, NoteGroupingMode.DATE)
    // Should be 4 groups: 25, 24, 18, 17
    expect(groups).toHaveLength(4)
    expect(groups[0].title).toBe('2024-02-25')
    expect(groups[1].title).toBe('2024-02-24')
  })

  it('groups correctly by week', () => {
    const groups = groupNotes(notes, NoteGroupingMode.WEEK)
    // 2024-02-25 is Sun. Week: Feb 19 - Feb 25. Group 1.
    // 2024-02-24 is Sat. Week: Feb 19 - Feb 25. Group 1.
    // 2024-02-18 is Sun. Week: Feb 12 - Feb 18. Group 2.
    // 2024-02-17 is Sat. Week: Feb 12 - Feb 18. Group 2.
    
    expect(groups).toHaveLength(2)
    
    // Check titles (MM月DD日 - MM月DD日)
    // Group 1: Feb 19 - Feb 25 -> 02月19日 - 02月25日
    expect(groups[0].title).toBe('02月19日 - 02月25日')
    expect(groups[0].notes).toHaveLength(2) // Notes 1 and 2
    
    // Group 2: Feb 12 - Feb 18 -> 02月12日 - 02月18日
    expect(groups[1].title).toBe('02月12日 - 02月18日')
    expect(groups[1].notes).toHaveLength(2) // Notes 3 and 4
  })
})
