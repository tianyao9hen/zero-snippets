import { describe, it, expect } from 'vitest'
import { getWeekRange, formatDate } from '../dateUtils'

describe('dateUtils', () => {
  it('getWeekRange returns correct range for Monday', () => {
    // 2024-02-19 is a Monday
    const date = new Date('2024-02-19T12:00:00')
    const { start, end } = getWeekRange(date)
    expect(start.getDay()).toBe(1) // Monday
    expect(start.getDate()).toBe(19)
    expect(end.getDay()).toBe(0) // Sunday
    expect(end.getDate()).toBe(25)
    expect(start.getHours()).toBe(0)
    expect(end.getHours()).toBe(23)
  })

  it('getWeekRange returns correct range for Sunday', () => {
    // 2024-02-25 is a Sunday
    const date = new Date('2024-02-25T12:00:00')
    const { start, end } = getWeekRange(date)
    expect(start.getDate()).toBe(19) // Previous Monday
    expect(end.getDate()).toBe(25) // Current Sunday
  })
  
  it('getWeekRange handles month/year boundary', () => {
    // 2023-12-31 is Sunday. Week should start 2023-12-25.
    const date = new Date('2023-12-31T12:00:00')
    const { start, end } = getWeekRange(date)
    expect(start.getFullYear()).toBe(2023)
    expect(start.getMonth()).toBe(11) // Dec
    expect(start.getDate()).toBe(25)
    expect(end.getFullYear()).toBe(2023)
    expect(end.getDate()).toBe(31)
  })

  it('formatDate formats correctly', () => {
    const date = new Date('2024-02-19T13:45:30')
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-02-19')
    expect(formatDate(date, 'MM月DD日')).toBe('02月19日')
  })
})
