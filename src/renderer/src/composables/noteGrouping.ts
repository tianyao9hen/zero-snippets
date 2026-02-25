import { getWeekRange, formatDate } from './dateUtils'
import { NoteGroupingMode } from '../enums'

export interface NoteEntity {
  id: number
  typeId: number
  noteType: number
  name: string
  note: string
  createTime: string
}

export interface GroupedNotes {
  title: string
  notes: NoteEntity[]
}

/**
 * 将笔记按指定模式分组
 * @param notes 笔记列表（假设已按时间倒序排列）
 * @param mode 分组模式
 * @returns 分组后的笔记列表
 */
export function groupNotes(notes: NoteEntity[], mode: NoteGroupingMode): GroupedNotes[] {
  if (!notes || notes.length === 0) {
    return []
  }

  // 确保 mode 是数字，如果是字符串尝试转换
  // 这里是为了兼容可能传入的旧值，虽然 TypeScript 会报错，但在运行时可能发生
  let groupingMode = mode
  if (typeof mode === 'string') {
    groupingMode = Number(mode)
  }

  if (groupingMode === NoteGroupingMode.NONE) {
    return [{ title: '', notes }]
  }

  // 使用 Map 保持插入顺序 (假设输入已排序)
  // Key: Group Identifier, Value: GroupedNotes object
  const groups = new Map<string, GroupedNotes>()

  for (const note of notes) {
    let key = ''
    let title = ''
    const date = new Date(note.createTime)

    if (groupingMode === NoteGroupingMode.DATE) {
      key = formatDate(date, 'YYYY-MM-DD')
      title = key
    } else if (groupingMode === NoteGroupingMode.WEEK) {
      const { start, end } = getWeekRange(date)
      // 使用时间戳作为唯一键，确保跨年周也能正确排序
      key = start.getTime().toString()
      title = `${formatDate(start, 'MM月DD日')} - ${formatDate(end, 'MM月DD日')}`
    } else {
      // Fallback for unknown mode, treat as NONE
      // 但因为上面已经处理了 NONE，这里应该是意外情况
      // 如果为了健壮性，可以放到 default 分支
      return [{ title: '', notes }]
    }

    if (!groups.has(key)) {
      groups.set(key, { title, notes: [] })
    }
    groups.get(key)!.notes.push(note)
  }

  const result = Array.from(groups.values())
  return result
}
