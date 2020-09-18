const { app, BrowserWindow, session } = require('electron')
require('dotenv').config()
const path = require('path')
const windowStateKeeper = require('electron-window-state')
const express = require('express')
const fetch = require('node-fetch')
const server = express()
var request = require('request') // "Request" library
var cors = require('cors')
var querystring = require('querystring')
var cookieParser = require('cookie-parser')
const { ipcMain } = require('electron/main')
const storage = require('electron-json-storage')
const fs = require('fs')
const defaultDataPath = storage.getDefaultDataPath()

var client_id = process.env.CLIENT_ID // Your client id
var client_secret = process.env.CLIENT_SECRET // Your secret
var redirect_uri = process.env.REDIRECT_URI // Your redirect uri
var genius_token = process.env.GENIUS_TOKEN

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 1000,
  })

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minHeight: 500,
    minWidth: 400,

    webPreferences: { nodeIntegration: true },
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

  serverWithWindowWrapper(mainWindow, childWindow)

  // Send env variable to renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('update-variable', {
      client_id,
      redirect_uri,
      genius_token,
    })
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname + '/renderer', 'index.html'))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Child Window (crawl lyrics)
  ipcMain.on('load-url', (event, url) => {
    childWindow.loadURL(url)
    console.log('load-url')
  })

  // Ask html when main loaded
  mainWindow.webContents.on('did-finish-load', function () {
    console.log('main did-finish-load')
    getFromLocalStorage(mainWindow)
  })

  // Auto-update song on focus
  /*   mainWindow.on('focus', () => {
    mainWindow.webContents.send('trigger-run-script')
    const inter = setInterval(() => {
      mainWindow.webContents.send('trigger-run-script')
    }, 7000)
    mainWindow.on('blur', () => {
      clearInterval(inter)
    })
  }) */

  // Ask html when child loaded
  childWindow.webContents.on('did-finish-load', function () {
    console.log('did-finish-load -> sendbackhtml')
    childWindow.send('sendbackhtml')
  })

  ipcMain.on('hereishtml', (event, html) => {
    //childWindow.close()
    //childWindow = null
    console.log('html received -> hereishtml')
    const removeTagsExeptBr = html.replace(/(<?b>|<?i>|<.?a>|<a.*?>)/gm, '')
    //const oneBrMax = removeTagsExeptBr.replace(/(<br*>){2,}/gm, '<br>')
    //const BrBeforeBracket = oneBrMax.replace(/\[/gm, '<br>[')

    mainWindow.webContents.send('reply-html', html)
  })
}

// Remove storage
/* storage.remove('refresh_token', function (error) {
  if (error) throw error
}) */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const getFromLocalStorage = (mainWindow) => {
  // Logic : if refresh_token found we API/refresh_token to get new one
  // and if not found we ask for auth
  storage.get('refresh_token', function (error, data) {
    if (error) throw error

    if (Object.keys(data).length === 0 && data.constructor === Object) {
      // refresh_token not found
      // Ask for auth
      console.log('refresh_token not found')
      return mainWindow.webContents.send('trigger-auth', null)
    }

    // refresh_token found
    // Ask for refresh
    console.log('refresh_token found : ' + data.refresh_token)
    return mainWindow.webContents.send('trigger-refresh', data.refresh_token)
  })
}

const setFromLocalStorage = (refresh_token) => {
  storage.set('refresh_token', { refresh_token }, function (error) {
    if (error) throw error
  })
}

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

const setTokenAndRefreshFromstorage = (name, obj) => {}

//require('update-electron-app')({ logger: require('electron-log') })

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

// Server
const serverWithWindowWrapper = (mainWindow, childWindow) => {
  // Static serve close page.html
  server
    .use(express.static(__dirname + '/renderer/static'))
    .use(cors())
    .use(cookieParser())

  server.get('/callback', function (req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization:
          'Basic ' +
          new Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      json: true,
    }

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // Access and refresh token received

        console.log('refresh', body.refresh_token)
        var access_token = body.access_token,
          refresh_token = body.refresh_token

        // Save to localstore
        setFromLocalStorage(refresh_token)

        mainWindow.webContents.send('reply-token', {
          access_token,
          refresh_token,
        })
        console.log('token : ' + access_token)

        // Close page
        res.redirect('/close.html')
      } else {
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
    console.log('refresh reached', req.query.refresh_token)
    var refresh_token = req.query.refresh_token
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization:
          'Basic ' +
          new Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      },
      json: true,
    }

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token
        console.log(access_token)

        res.status(200).send({ e: null, access_token })
      } else {
        console.log('error status : ' + error)
        res.status(400).send()
      }
    })
  })

  console.log('Listening on 8888')
  server.listen(8888)
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
// Crawl
