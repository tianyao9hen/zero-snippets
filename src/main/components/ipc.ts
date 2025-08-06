import { ipcMain, IpcMainEvent } from "electron";
import { ipcEnum } from "../../enum/ipcEnum";
import { getWindowByEvent } from "./window";
import './db/ipc'

ipcMain.on(ipcEnum.setIgnoreMouseEvent, (event: IpcMainEvent, ignore: boolean, options: {forward: boolean}) => {
  getWindowByEvent(event)?.setIgnoreMouseEvents(ignore, options)
})

