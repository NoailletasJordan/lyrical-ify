const { app, BrowserWindow, Menu } = require('electron')
require('dotenv').config()
const path = require('path')
const windowStateKeeper = require('electron-window-state')
const express = require('express')
const server = express()
var request = require('request') // "Request" library
var cors = require('cors')
var querystring = require('querystring')
var cookieParser = require('cookie-parser')
const { ipcMain } = require('electron/main')
const storage = require('electron-json-storage')
var tcpPortUsed = require('tcp-port-used')
const {
  updateRefreshToken,
  updateCurrentMusic,
  updateCodeVerifier,
} = require('./actions')

const {
  handleTokenReceived,
  logoutFromLocalStorage,
  setBackgroundColorFromLocalStorage,
  setTextColorFromLocalStorage,
} = require('./utility')

// Set up store and declare as global
require('./reducers')

const client_id = '***REMOVED***'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = () => {
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
    icon: path.join(__dirname + '\\assets/favicon-32x32.png'),
    webPreferences: { nodeIntegration: true, enableRemoteModule: true },
  })

  let childWindow = new BrowserWindow({
    parent: mainWindow,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname + '\\renderer', 'preloadChild.js'),
      offscreen: true,
    },
  })

  mainWindowState.manage(mainWindow)

  tcpPortUsed.check(54860, '127.0.0.1').then(
    function (inUse) {
      console.log('Port 54860 usage: ' + inUse)
      if (!inUse) serverWithWindowWrapper(mainWindow)
      else app.quit()
    },
    function (err) {
      console.error('Error on check:', err.message)
    }
  )

  // Create right-click menu
  let contextMenu = Menu.buildFromTemplate([{ role: 'copy' }])

  mainWindow.webContents.on('context-menu', (e) => {
    contextMenu.popup()
  })

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

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname + '/renderer', 'index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Child window Loaded
  childWindow.webContents.on('did-finish-load', function () {
    const windowUrl = childWindow.webContents.getURL()
    // Google.com
    if (windowUrl.includes('google.com/webhp?as_q=&as_epq=&as_oq=&as')) {
      childWindow.webContents.send(
        'launch-search',
        store.getState().current_music
      )
    }

    // Google search
    if (windowUrl.includes('google.com/search?')) {
      childWindow.webContents.send(
        'enter-genius',
        store.getState().current_music
      )
    }

    // Genius.com
    if (windowUrl.includes('genius.com')) {
      childWindow.webContents.send(
        'sendbackhtml',
        store.getState().current_music
      )
    } else return console.log('fin')
  })

  // Child Window (crawl lyrics)
  ipcMain.on('load-url', async (event, current_music) => {
    childWindow.loadURL(
      'https://www.google.com/webhp?as_q=&as_epq=&as_oq=&as_eq=&as_nlo=&as_nhi=&lr=&cr=countryUS&as_qdr=all&as_sitesearch=&as_occt=any&safe=images&as_filetype=&tbs='
    )
    childWindow.webContents.setAudioMuted(true)
  })

  // No Valid url from crawler - > trigger display
  ipcMain.on('no-url-found', async (event, obj) => {
    mainWindow.webContents.send('trigger-no-lyrics-display')
  })

  // Main window Loaded
  mainWindow.webContents.on('did-finish-load', function () {
    console.log('main did-finish-load')
    // Send version
    mainWindow.webContents.send('version-stored-display', app.getVersion())

    // can't be put in utility.js
    const getFromLocalStorage = (mainWindow) => {
      // Get token from storage
      storage.get('refresh_token', function (error, data) {
        if (error) throw error
        if (Object.keys(data).length === 0 && data.constructor === Object) {
          // refresh_token not found, ask for auth
          console.log('refresh_token not found')
          mainWindow.webContents.send('no-token-stored-display')
          return
        }
        // refresh_token found
        console.log('refresh_token found : ' + data.refresh_token)

        // Update Refresh
        store.dispatch(updateRefreshToken(data.refresh_token))
        mainWindow.webContents.send('token-stored-display')
        mainWindow.webContents.send('trigger-refresh')
      })

      // Get text colors from storage
      storage.get('textColor', function (error, data) {
        if (error) throw error
        if (Object.keys(data).length === 0 && data.constructor === Object)
          return console.log('Text not found')
        // Text color found -> send
        mainWindow.webContents.send('text-color-stored-display', data.textColor)
      })

      // Get background colors from storage
      storage.get('backgroundColor', function (error, data) {
        if (error) throw error
        if (Object.keys(data).length === 0 && data.constructor === Object)
          return console.log('Background not found')
        // background color found -> send
        mainWindow.webContents.send(
          'background-color-stored-display',
          data.backgroundColor
        )
      })
    }
    getFromLocalStorage(mainWindow)
  })

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

  ipcMain.on('hereishtml', (event, html) => {
    console.log('html received -> hereishtml')
    const removeLinks = html.replace(/(<a.*?>|<\/a>)/gm, '')
    const addSpanBrackets1 = removeLinks.replace(
      /\[/gm,
      '<span class="lyrics-in-brackets">['
    )
    const addSpanBrackets2 = addSpanBrackets1.replace(/\]/gm, ']</span>')

    mainWindow.webContents.send('reply-html', addSpanBrackets2)
  })
}

// Initialisation
app.disableHardwareAcceleration()
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// App Updater
require('update-electron-app')({ logger: require('electron-log') })

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

// Server
const serverWithWindowWrapper = (mainWindow) => {
  // Static serve close page.html
  server
    .use(express.static(__dirname + '/renderer/static'))
    .use(cors())
    .use(cookieParser())

  server.get('/callback', function (req, res) {
    var code = req.query.code || null
    console.log('code verifier :', store.getState())
    console.log('redirect_uri :', store.getState().redirect_uri)
    console.log('client_id  :', store.getState().client_id)
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        client_id: store.getState().client_id,
        redirect_uri: store.getState().redirect_uri,
        grant_type: 'authorization_code',
        code,
        code_verifier: store.getState().code_verifier,
      },
      json: true,
    }

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // Access and refresh token received
        console.log('token : ', body.access_token)
        console.log('refresh', body.refresh_token)

        handleTokenReceived(
          body.access_token,
          body.refresh_token,
          body.expires_in,
          mainWindow
        )

        // Trigger dyplay changes
        mainWindow.webContents.send('logged-success')

        // Close page
        res.redirect('/close.html')
      } else {
        console.log(response.statusCode)
        res.redirect(
          '/#' +
            querystring.stringify({
              error: 'invalid_token',
            })
        )
      }
    })
  })

  server.get('/refresh_token', function (req, res) {
    // requesting access token from refresh token
    console.log('refresh reached')

    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        grant_type: 'refresh_token',
        refresh_token: store.getState().refresh_token,
        client_id,
      },
      json: true,
    }

    // Api request
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log('token from refresh', body.access_token)
        //get access and refresh
        handleTokenReceived(
          body.access_token,
          body.refresh_token,
          body.expires_in,
          mainWindow
        )

        res.status(200).send({ e: null, access_token: body.access_token })
      } else {
        console.log('error status : ' + response.statusCode)
        console.log(body)
        res.status(400).send(body)
      }
    })
  })

  console.log('Listening on 54860')
  server.listen(54860)
}
