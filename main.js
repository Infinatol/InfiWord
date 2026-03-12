const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let currentFilePath = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    // icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // Suppression du menu par défaut pour une interface personnalisée
  mainWindow.setMenu(null);
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// -- GESTION DES FICHIERS --

ipcMain.handle('file-new', async () => {
  currentFilePath = null;
  return { success: true };
});

ipcMain.handle('file-open', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'InfiWord / Text', extensions: ['infiword', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    currentFilePath = result.filePaths[0];
    const content = fs.readFileSync(currentFilePath, 'utf-8');
    const ext = path.extname(currentFilePath).toLowerCase();
    return { success: true, filePath: currentFilePath, content: content, isHtml: ext === '.infiword' };
  }
  return { success: false };
});

ipcMain.handle('file-save', async (event, content, isHtml) => {
  if (!currentFilePath) {
    return await saveFileAs(content, isHtml);
  } else {
    try {
      fs.writeFileSync(currentFilePath, content, 'utf-8');
      return { success: true, filePath: currentFilePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
});

ipcMain.handle('file-save-as', async (event, content, isHtml) => {
  return await saveFileAs(content, isHtml);
});

async function saveFileAs(content, isHtml) {
  let defaultExt = isHtml ? 'infiword' : 'txt';
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `Nouveau document.${defaultExt}`,
    filters: [
      { name: 'Document InfiWord', extensions: ['infiword'] },
      { name: 'Texte brut', extensions: ['txt'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    currentFilePath = result.filePath;
    try {
      fs.writeFileSync(currentFilePath, content, 'utf-8');
      return { success: true, filePath: currentFilePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false };
}

// -- IMPRESSION ET EXPORT --

ipcMain.handle('file-export-pdf', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'document.pdf',
    filters: [{ name: 'Fichiers PDF', extensions: ['pdf'] }]
  });

  if (!result.canceled && result.filePath) {
    try {
      const pdfBuffer = await mainWindow.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        margins: { marginType: 'default' }
      });
      fs.writeFileSync(result.filePath, pdfBuffer);
      return { success: true, filePath: result.filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false };
});

ipcMain.on('file-print', () => {
  mainWindow.webContents.print({ silent: false, printBackground: true });
});
