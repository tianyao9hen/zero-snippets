import { BrowserWindow } from 'electron'
import { spawn, spawnSync, ChildProcessWithoutNullStreams } from 'child_process'
import path from 'path'
import { getExistingWindowByName } from './window'
import { findAllCommands } from './db/sql/commandSql'

/**
 * @description 单条命令执行实例的日志行
 */
type CommandLogLine = {
  time: number
  source: 'stdout' | 'stderr'
  line: string
}

/**
 * @description 运行中的命令实例
 */
type RunningCommandInstance = {
  instanceId: string
  commandId: number
  title: string
  shortcut?: string | null
  allowUnified: boolean
  hidden: boolean
  basePath?: string | null
  command: string
  stopCommand?: string | null
  type: string
  process: ChildProcessWithoutNullStreams
  logs: CommandLogLine[]
  exited: boolean
  exitCode: number | null
}

// 最多保留的日志行数
const MAX_LOG_LINES = 100

// 正在运行的命令实例列表（按 instanceId 存储）
const runningInstances = new Map<string, RunningCommandInstance>()

/**
 * @description 生成实例ID（同一命令不可重复执行，因此可以直接用命令ID作为实例ID）
 */
const getInstanceId = (commandId: number): string => {
  return `cmd-${commandId}`
}

/**
 * @description 向指定实例追加日志，并裁剪到指定行数
 */
const appendLog = (instance: RunningCommandInstance, source: 'stdout' | 'stderr', chunk: Buffer) => {
  const text = chunk.toString('utf8')
  const lines = text.split(/\r?\n/)
  const now = Date.now()

  for (const line of lines) {
    if (!line) continue
    instance.logs.push({
      time: now,
      source,
      line
    })
  }

  if (instance.logs.length > MAX_LOG_LINES) {
    instance.logs.splice(0, instance.logs.length - MAX_LOG_LINES)
  }
}

/**
 * @description 获取所有正在运行的命令实例基本信息
 */
export const getRunningCommandSummaries = () => {
  return Array.from(runningInstances.values())
    .filter((item) => !item.hidden)
    .map((item) => ({
      instanceId: item.instanceId,
      commandId: item.commandId,
      title: item.title,
      shortcut: item.shortcut,
      allowUnified: item.allowUnified,
      exited: item.exited,
      exitCode: item.exitCode
    }))
}

/**
 * @description 获取指定实例的日志
 * @param instanceId 实例ID
 */
export const getCommandLogs = (instanceId: string): CommandLogLine[] => {
  const instance = runningInstances.get(instanceId)
  if (!instance) return []
  return instance.logs
}

/**
 * @description 根据命令ID启动命令执行
 * @param commandId 命令ID
 */
export const runCommandById = async (commandId: number): Promise<string> => {
  const instanceId = getInstanceId(commandId)
  if (runningInstances.has(instanceId)) {
    // 已经在运行中，直接返回实例ID
    return instanceId
  }

  const commands = findAllCommands()
  const target = commands.find((c) => c.id === commandId)
  if (!target) {
    throw new Error(`命令不存在，ID=${commandId}`)
  }

  const workingDir = target.basePath || process.cwd()

  // 使用 cmd.exe 在指定工作目录下执行命令
  const child = spawn('cmd.exe', ['/c', `call ${target.command}`], {
    cwd: path.resolve(workingDir),
    windowsHide: true
  })

  const instance: RunningCommandInstance = {
    instanceId,
    commandId: target.id,
    title: target.name,
    shortcut: target.shortcut,
    allowUnified: !!target.allowUnified,
    hidden: false,
    basePath: target.basePath,
    command: target.command,
    stopCommand: target.stopCommand,
    type: target.type,
    process: child,
    logs: [],
    exited: false,
    exitCode: null
  }

  runningInstances.set(instanceId, instance)

  child.stdout.on('data', (chunk: Buffer) => {
    appendLog(instance, 'stdout', chunk)
    notifyLogWindow()
  })

  child.stderr.on('data', (chunk: Buffer) => {
    appendLog(instance, 'stderr', chunk)
    notifyLogWindow()
  })

  child.on('close', (code) => {
    instance.exited = true
    instance.exitCode = code
    appendLog(instance, 'stderr', Buffer.from(`[进程已退出，退出码: ${code ?? 'unknown'}]`))
    notifyLogWindow()
  })

  child.on('error', (err) => {
    instance.exited = true
    appendLog(instance, 'stderr', Buffer.from(String(err)))
    notifyLogWindow()
  })

  return instanceId
}

/**
 * @description 统一执行所有允许统一执行的命令
 */
export const runUnifiedCommands = async (): Promise<string[]> => {
  const all = findAllCommands()
  const unifiedList = all.filter((c) => c.allowUnified)
  const instanceIds: string[] = []

  for (const cmd of unifiedList) {
    const instanceId = await runCommandById(cmd.id)
    instanceIds.push(instanceId)
  }

  return instanceIds
}

/**
 * @description 结束进程树（Windows 下用 taskkill /T 杀子进程，否则只杀当前进程）
 * @param pid 进程 ID
 */
const killProcessTree = (pid: number): void => {
  if (typeof pid !== 'number' || pid <= 0) return
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true })
    } else {
      process.kill(pid, 'SIGTERM')
    }
  } catch {
    // 进程可能已退出，忽略
  }
}

/**
 * @description 移除已退出的命令实例（用户关闭标签页时调用）
 */
export const dismissCommandInstance = (instanceId: string): void => {
  const instance = runningInstances.get(instanceId)
  if (!instance) return
  // 仅标记为隐藏，不再出现在前端标签列表中，但不主动终止进程
  instance.hidden = true
  notifyLogWindow()
}

/**
 * @description 优雅关闭单个实例：有 stopCommand 则在 basePath 下执行关闭命令，否则直接移除
 */
const gracefulStop = (instance: RunningCommandInstance): void => {
  if (!instance.exited && instance.stopCommand) {
    const cwd = instance.basePath ? path.resolve(instance.basePath) : process.cwd()
    try {
      spawn('cmd.exe', ['/c', `call ${instance.stopCommand}`], { cwd, windowsHide: true })
    } catch {
      // 关闭命令执行失败时回退到强制杀进程
      const pid = instance.process.pid
      if (pid) killProcessTree(pid)
      else instance.process.kill()
    }
  }
  runningInstances.delete(instance.instanceId)
}

/**
 * @description 停止指定命令
 * @param commandId 命令ID
 */
export const stopCommandById = (commandId: number): void => {
  const instanceId = getInstanceId(commandId)
  const instance = runningInstances.get(instanceId)
  if (!instance) return
  gracefulStop(instance)
  notifyLogWindow()
}

/**
 * @description 统一中止所有允许统一执行的命令
 */
export const stopUnifiedCommands = (): void => {
  const list = Array.from(runningInstances.values()).filter((item) => item.allowUnified)
  for (const item of list) {
    gracefulStop(item)
  }
  notifyLogWindow()
}

/**
 * @description 通知 commandLog 窗口有新的日志或状态变化
 *          这里通过向窗口发送一个简单事件，由前端自行拉取最新日志
 */
const notifyLogWindow = () => {
  let win: BrowserWindow | null = null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    win = getExistingWindowByName('commandLog' as any)
  } catch {
    win = null
  }
  if (win && !win.isDestroyed()) {
    win.webContents.send('command-log-updated')
  }
}

