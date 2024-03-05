const { ipcMain } = require('electron/main')

module.exports = (app, mainWindow, childWindow) => {
  const {
    logoutFromLocalStorage,
    setBackgroundColorFromLocalStorage,
    setTextColorFromLocalStorage,
  } = require('./utility')

  // Handle Window controls
  ipcMain.on('minimize-window', () => {
    mainWindow.minimize()
  })
  ipcMain.on('toggle-maximize-window', () => {
    if (mainWindow.isMaximized()) return mainWindow.unmaximize()
    mainWindow.maximize()
  })
  ipcMain.on('close-window', () => {
    app.quit()
  })

  // Main Window
  ipcMain.on('logout', () => {
    logoutFromLocalStorage()
    store.dispatch(updateRefreshToken(null))
    store.dispatch(updateCodeVerifier(null))
  })

  ipcMain.on('set-background-color-storage', (event, arg) => {
    setBackgroundColorFromLocalStorage(arg)
  })

  ipcMain.on('set-text-color-storage', (event, arg) => {
    setTextColorFromLocalStorage(arg)
  })

  // Child Window
  ipcMain.on('load-url', async (event, current_music) => {
    childWindow.loadURL('https://www.google.com/')
    childWindow.webContents.setAudioMuted(true)
  })

  // No Valid url from crawler - > trigger display
  ipcMain.on('no-url-found', async (event, obj) => {
    mainWindow.webContents.send('trigger-no-lyrics-display')
  })

  ipcMain.on('hereishtml', (event, html) => {
    console.log('html received -> hereishtml')
    const removeLinks = html.replace(/(<a.*?>|<\/a>)/gm, '')
    const addSpanBrackets1 = removeLinks.replace(
      /\[/gm,
      '<span class="lyrics-in-brackets">[',
    )
    const addSpanBrackets2 = addSpanBrackets1.replace(/\]/gm, ']</span>')

    mainWindow.webContents.send('reply-html', addSpanBrackets2)
  })
}
