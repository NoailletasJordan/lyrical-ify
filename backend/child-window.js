const path = require('path')
const { BrowserWindow } = require('electron')

module.exports = () => {
  let childWindow = new BrowserWindow({
    parent: mainWindow,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, '..', 'renderer', 'preloadChild.js'),
      offscreen: true,
    },
  })

  // Child window script (crawler)
  childWindow.webContents.on('did-finish-load', function () {
    const windowUrl = childWindow.webContents.getURL()
    // Checkpoint - Google.com
    if (windowUrl.includes('google.com/webhp?as_q=&as_epq=&as_oq=&as')) {
      childWindow.webContents.send(
        'launch-search',
        store.getState().current_music
      )
    }

    // Checkpoint - Google search
    if (windowUrl.includes('google.com/search?')) {
      childWindow.webContents.send(
        'enter-genius',
        store.getState().current_music
      )
    }

    // Checkpoint - Genius.com
    if (windowUrl.includes('genius.com')) {
      childWindow.webContents.send(
        'sendbackhtml',
        store.getState().current_music
      )
    } else return console.log('fin')
  })
  return childWindow
}
