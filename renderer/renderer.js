// Renderer
// Dom
const bLoginDom = document.querySelector('.login-button')
const bLogoutDom = document.querySelector('.logout-button')

// Require

const { ipcRenderer } = require('electron/renderer')
const {
  toggleLoadingDisplay,
  toggleLoggedDisplay,
  animateTitleDisplay,
  musicHeaderContainerDisplay,
  logRequestDisplay,
  closeStartModalDisplay,
  modalBrowserDisplay,
} = require('./utility-renderer')

const { authorize, refreshTheToken } = require('./auth')
const { runSpotifyAndGenius } = require('./current-music')
console.log('debug 3')

// Variables
let client_id = null
let redirect_uri = null
let genius_token = null
let access_token = null
let musicState = '_'
let tokenTimerExpire = null

// Listeners
// Button 1
bLoginDom.addEventListener('click', () => {
  authorize(client_id, redirect_uri)
})

// search music
/* b3.addEventListener('click', () => {
  musicState = async runSpotifyAndGenius(access_token, genius_token, musicState)
}) */

// Logout
bLogoutDom.addEventListener('click', () => {
  handleLogout()
})

// ipcRenderer
ipcRenderer.on('mess', (e, args) => {
  console.log(args)
})

// ipcRenderer
ipcRenderer.on('trigger-auth', (e, args) => {
  authorize(client_id, redirect_uri)
})

// trigger refresh
ipcRenderer.on('trigger-refresh', async (e, refr) => {
  access_token = await refreshTheToken()
  console.log('ref ipc', access_token)
  // Close modal if it wasnt already
  closeStartModalDisplay()
  animateTitleDisplay()
})

// Extract the tokens
ipcRenderer.on('reply-token', (e, args) => {
  access_token = args.access_token
})

// Get initial variables from .env
ipcRenderer.on('update-variable', (e, args) => {
  client_id = args.client_id
  redirect_uri = args.redirect_uri
  genius_token = args.genius_token
})

// Add the lyrics into html
ipcRenderer.on('reply-html', (e, html) => {
  console.log('reply-html')
  toggleLoadingDisplay(false)
  lyricsFoundDisplay(true, html)
})

// trigger runSpotifyAndGenius
ipcRenderer.on('trigger-run-script', async () => {
  if (access_token)
    musicState = await runSpotifyAndGenius(
      access_token,
      genius_token,
      musicState
    )
})

// Reniew token when expire
ipcRenderer.on('token-expire', (event, sec) => {
  console.log('token will be reniewed in', sec, 'seconds')
  // Right before the
  tokenTimerExpire = setTimeout(async () => {
    console.log('token expired, asking for a new one')
    access_token = await refreshTheToken()
  }, sec * 900)
})

ipcRenderer.on('mess', (e, arg) => {
  console.log(arg)
})

// Logout - Cant be imported
const handleLogout = () => {
  ipcRenderer.send('logout')
  access_token = null
  clearInterval(tokenTimerExpire)
  musicState = '_'

  // Display
  removeLyricsDisplay()
  logRequestDisplay(true)
  toggleLoggedDisplay(false)
  musicHeaderContainerDisplay(false)
}

// Display IPC
ipcRenderer.on('no-token-stored-display', () => {
  closeStartModalDisplay()
  animateTitleDisplay()
  logRequestDisplay(true)
})

ipcRenderer.on('token-stored-display', () => {
  closeStartModalDisplay()
  logRequestDisplay(false)
  toggleLoggedDisplay(true)
})

ipcRenderer.on('logged-success', () => {
  // close modal
  modalBrowserDisplay(false)
  logRequestDisplay(false)
  toggleLoggedDisplay(true)
  toggleLoadingDisplay(false)
})
