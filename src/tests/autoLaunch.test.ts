import { describe, it, expect, vi, beforeEach } from 'vitest'
import { app } from 'electron'
import { toggleAutoLaunch, getAutoLaunchStatus } from '../main/components/autoLaunch'

// Mock electron
vi.mock('electron', () => {
  const setLoginItemSettings = vi.fn()
  const getLoginItemSettings = vi.fn(() => ({ openAtLogin: false }))
  
  return {
    app: {
      setLoginItemSettings,
      getLoginItemSettings
    }
  }
})

describe('Auto Launch Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('toggleAutoLaunch should call app.setLoginItemSettings with correct params', () => {
    // Enable
    const result1 = toggleAutoLaunch(true)
    expect(app.setLoginItemSettings).toHaveBeenCalledWith({ openAtLogin: true })
    expect(result1).toEqual({ success: true })
    
    // Disable
    const result2 = toggleAutoLaunch(false)
    expect(app.setLoginItemSettings).toHaveBeenCalledWith({ openAtLogin: false })
    expect(result2).toEqual({ success: true })
  })

  it('toggleAutoLaunch should handle errors', () => {
    // Mock error
    ;(app.setLoginItemSettings as any).mockImplementationOnce(() => {
      throw new Error('Permission denied')
    })
    
    const result = toggleAutoLaunch(true)
    expect(result).toEqual({ success: false, error: 'Permission denied' })
  })
  
  it('getAutoLaunchStatus should return correct status', () => {
    // Mock true
    ;(app.getLoginItemSettings as any).mockReturnValue({ openAtLogin: true })
    expect(getAutoLaunchStatus()).toBe(true)
    
    // Mock false
    ;(app.getLoginItemSettings as any).mockReturnValue({ openAtLogin: false })
    expect(getAutoLaunchStatus()).toBe(false)
  })
})
