import { nativeImage, app } from 'electron'
import path from 'path'

const getResourcesPath = (filename: string) => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'resources', filename)
  }
  return path.join(app.getAppPath(), 'resources', filename)
}

export const closeIcon = nativeImage
  .createFromPath(getResourcesPath('close.png'))
  .resize({ width: 12, height: 12 })

export const settingIcon = nativeImage
  .createFromPath(getResourcesPath('setting.png'))
  .resize({ width: 16, height: 16 })
