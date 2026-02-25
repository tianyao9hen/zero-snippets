import { app } from 'electron'

/**
 * 切换开机自启动状态
 * @param enable 是否开启自启动，true为开启，false为关闭
 * @returns 返回操作结果对象，包含success字段表示是否成功，如果失败则包含error字段
 */
export const toggleAutoLaunch = (enable: boolean) => {
  try {
    // 调用Electron API设置开机启动项
    app.setLoginItemSettings({
      openAtLogin: enable
    })
    return { success: true }
  } catch (error) {
    // 捕获异常并返回错误信息
    return { success: false, error: (error as Error).message }
  }
}

/**
 * 获取当前开机自启动状态
 * @returns 返回布尔值，true表示已开启自启动，false表示未开启
 */
export const getAutoLaunchStatus = () => {
  // 调用Electron API获取登录项设置
  const { openAtLogin } = app.getLoginItemSettings()
  return openAtLogin
}
