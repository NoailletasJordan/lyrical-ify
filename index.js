const { app, BrowserWindow } = require('electron')
require('dotenv').config()
const setupMainWindow = require('./backend/main-window')
const setupChildWindow = require('./backend/child-window')
var tcpPortUsed = require('tcp-port-used')
const { serverWithWindowWrapper } = require('./backend/server')
const ipcListeners = require('./backend/ipcListeners')

// Set up store and declare as global in backend
global.store = require('./backend/reducers')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

// Initialisation
app.disableHardwareAcceleration()
app.on('ready', () => {
  // Creating the windows
  const mainWindow = setupMainWindow(app)
  const childWindow = setupChildWindow()

  // Setting the ipcListeners
  ipcListeners(app, mainWindow, childWindow)

  // Close if port 54860 is used
  tcpPortUsed.check(54860, '127.0.0.1').then(
    function (inUse) {
      console.log('Port 54860 usage: ' + inUse)
      if (!inUse) serverWithWindowWrapper(mainWindow)
      else app.quit()
    },
    function (err) {
      console.error('Error on check:', err.message)
    },
  )
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

// App Updater
require('update-electron-app')({ logger: require('electron-log') })
