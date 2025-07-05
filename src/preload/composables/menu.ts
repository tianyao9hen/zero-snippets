import { ipcRenderer } from "electron";
import { ipcEnum } from "../../enum/ipcEnum";

export function showMainMenu() {
  ipcRenderer.send(ipcEnum.showMainMenu)
}
