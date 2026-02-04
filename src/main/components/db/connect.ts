import Database, * as BetterSqlist3 from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

const db = (): BetterSqlist3.Database => {
  // 默认在电脑用户个人目录
  // C:\Users\39886\AppData\Roaming\snippets\zero-snippets.db
  const file = 'zero-snippets.db'
  const appDataPath = app.getPath('appData')
  let dbPath = join(appDataPath, 'snippets')
  dbPath = join(dbPath, file)
  console.log('dbPath', dbPath)
  const db: BetterSqlist3.Database = new Database(dbPath, {})
  db.pragma('journal_mode = WAL')
  return db
}

export { db }
