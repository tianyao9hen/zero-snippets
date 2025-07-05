import { nativeImage } from 'electron'
import path from 'path'

export const closeIcon = nativeImage
  .createFromPath(path.join(__dirname, '../../../resources/icons/close.png'))
  .resize({ width: 12, height: 12 })
