import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (defaultPath: string) => ipcRenderer.invoke('dialog:saveFile', defaultPath)
})

declare global {
  interface Window {
    electronAPI: {
      openFileDialog: () => Promise<any>
      saveFileDialog: (defaultPath: string) => Promise<any>
    }
  }
}
