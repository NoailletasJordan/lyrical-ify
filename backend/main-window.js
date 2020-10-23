const path = require('path')
const storage = require('electron-json-storage')
const { updateRefreshToken } = require('./actions')
const windowStateKeeper = require('electron-window-state')
const { BrowserWindow, Menu } = require('electron')
const { getFromLocalStorageAndUpdateFront } = require('./utility')

module.exports = (app) => {
  // Create the browser window.
  let mainWindowState = windowStateKeeper({
    defaultWidth: 550,
    defaultHeight: 700,
  })

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    frame: false,
    minHeight: 500,
    minWidth: 500,
    icon: path.join(__dirname, '..', 'assets', 'favicon-32x32.png'),
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
  })

  mainWindowState.manage(mainWindow)

  // Create right-click menu
  let contextMenu = Menu.buildFromTemplate([{ role: 'copy' }])
  mainWindow.webContents.on('context-menu', (e) => {
    contextMenu.popup()
  })

  // Display the front.
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'))

  // Developpement - Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Main window Loaded
  mainWindow.webContents.on('did-finish-load', function () {
    // Send version
    mainWindow.webContents.send('version-stored-display', app.getVersion())

    // Set up stored variables
    getFromLocalStorageAndUpdateFront(mainWindow)
  })

  // Auto-update song on focus
  let inter = null
  const intervalManager = () => {
    if (!mainWindow.isMinimized() && mainWindow) {
      mainWindow.webContents.send('trigger-run-script')
    } else clearInterval(inter)
  }
  setInterval(() => {
    intervalManager()
  }, 5000)

  return mainWindow
}

// Function
