const { app, BrowserWindow } = require('electron')
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
const { session } = require('electron')
const { ipcMain } = require('electron/main')

var client_id = process.env.CLIENT_ID // Your client id
var client_secret = process.env.CLIENT_SECRET // Your secret
var redirect_uri = process.env.REDIRECT_URI // Your redirect uri

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

  /* const loginWindow = new BrowserWindow({
    width: 800,
    height: 900,
    parent: mainWindow,
    modal: true,
  }) */

  serverWithWindowWrapper(mainWindow)

  // Send env variable to renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('initial-variable', { client_id, redirect_uri })
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname + '/renderer', 'index.html'))

  // and load the client login page of the app.
  //loginWindow.loadURL('https://google.com')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

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

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

//require('update-electron-app')({ logger: require('electron-log') })

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
// Server

// Static serve close page.html
server
  .use(express.static(__dirname + '/renderer/static'))
  .use(cors())
  .use(cookieParser())

const serverWithWindowWrapper = (mainWindow) => {
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
        // Access token received
        var access_token = body.access_token,
          refresh_token = body.refresh_token

        mainWindow.webContents.send('reply-token', {
          access_token,
          refresh_token,
        })

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
        res.send({
          access_token: access_token,
        })
      }
    })
  })

  console.log('Listening on 8888')
  server.listen(8888)
}
