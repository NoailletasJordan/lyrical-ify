// Renderer
// Dom
const bLoginDom = document.querySelector('.login-button-hover')
const bLogoutDom = document.querySelector('.logout-button-hover')
const lyricsDom = document.querySelector('.lyrics')

// Require

const { ipcRenderer } = require('electron/renderer')
const { removeDisplay } = require('./utility-renderer')

const { authorize, refreshTheToken } = require('./auth')
const { runSpotifyAndGenius } = require('./current-music')
console.log('debug 3')

// Variables
let client_id = null
let redirect_uri = null
let genius_token = null
let access_token = null
let musicState = null
let tokenTimerExpire = null

// Listeners
// Button 1
bLoginDom.addEventListener('click', () => {
  authorize(client_id, redirect_uri)
})

// search music
/* b3.addEventListener('click', () => {
  musicState = runSpotifyAndGenius(access_token, genius_token, musicState)
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
ipcRenderer.on('trigger-refresh', (e, refr) => {
  access_token = refreshTheToken()
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
  lyricsDom.innerHTML = html
})

// trigger runSpotifyAndGenius
ipcRenderer.on('trigger-run-script', () => {
  runSpotifyAndGenius(access_token, genius_token, musicState)
})

// Reniew token when expire
ipcRenderer.on('token-expire', (event, sec) => {
  console.log('token will be reniewed in', sec, 'seconds')
  // Right before the
  tokenTimerExpire = setTimeout(() => {
    console.log('token expired, asking for a new one')
    access_token = refreshTheToken()
  }, sec * 900)
})

ipcRenderer.on('mess', (e, arg) => {
  console.log(arg)
})

// Logout - Cant be imported
const handleLogout = () => {
  removeDisplay()
  ipcRenderer.send('logout')
  access_token = null
  clearInterval(tokenTimerExpire)
}
