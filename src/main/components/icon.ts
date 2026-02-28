import { nativeImage, app } from 'electron'
import path from 'path'

const getIconPath = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'resources', 'close.png')
  } else {
    return path.join(app.getAppPath(), 'resources', 'close.png')
  }
}

export const closeIcon = nativeImage.createFromPath(getIconPath()).resize({ width: 12, height: 12 })
