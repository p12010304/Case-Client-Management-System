const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// 註冊您自訂的協定
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('client-info-system', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('client-info-system');
}

// 讓 app 自動更新相關的日誌可以被記錄
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // 建議保持 false 以策安全
      contextIsolation: true, // 建議保持 true
    },
  });

  // 判斷是開發模式還是生產模式
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('open-url', (event, url) => {
  event.preventDefault();
  // 將 url 傳遞給渲染進程
  if (mainWindow) {
    mainWindow.webContents.send('auth-url-received', url);
  }
});

// Windows 的處理方式
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 當有人嘗試運行第二個實例時，我們應該關注第一個實例的視窗
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      // 透過 commandLine 傳遞 url
      const url = commandLine.find((arg) => arg.startsWith('client-info-system://'));
      if (url) {
        mainWindow.webContents.send('auth-url-received', url);
      }
    }
  });
}

app.on('ready', () => {
  createWindow();
  // 在 App 準備就緒後，檢查更新
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// 當收到更新可用的通知時，可以回覆給渲染程序
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

// 當下載完成後，可以通知渲染程序準備重啟安裝
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

// 讓渲染程序可以觸發安裝更新
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});
