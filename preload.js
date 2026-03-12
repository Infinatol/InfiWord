const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  newFile: () => ipcRenderer.invoke('file-new'),
  openFile: () => ipcRenderer.invoke('file-open'),
  saveFile: (content, isHtml) => ipcRenderer.invoke('file-save', content, isHtml),
  saveFileAs: (content, isHtml) => ipcRenderer.invoke('file-save-as', content, isHtml),
  exportPdf: () => ipcRenderer.invoke('file-export-pdf'),
  printDocument: () => ipcRenderer.send('file-print')
});
