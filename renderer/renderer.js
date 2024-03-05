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
  lyricsFoundDisplay,
  removeLyricsDisplay,
} = require('./utility-renderer')

const { authorize, refreshTheToken } = require('./auth')
const { runSpotifyAndGenius } = require('./current-music')
const { updateMusicState } = require('../backend/actions')
const remote = require('electron').remote

// Get store (backend) and set it as global (front)
window.store = remote.getGlobal('store')

// Run other scripts
require('./colors')
require('./window-controls')

// Variables
let tokenTimerExpire = null // The interval

// Listeners
bLoginDom.addEventListener('click', () => {
  authorize(store.getState().client_id, store.getState().redirect_uri)
})

bLogoutDom.addEventListener('click', () => {
  handleLogout()
})

// IpcRenderers
ipcRenderer.on('mess', (e, args) => {
  console.log(args)
})

ipcRenderer.on('trigger-auth', (e, args) => {
  authorize(store.getState().client_id, store.getState().redirect_uri)
})

ipcRenderer.on('trigger-refresh', async (e, refr) => {
  await refreshTheToken()
  if (!store.getState().access_token) handleLogout()
  console.log('ref ipc', store.getState().access_token)
  // Close modal if it wasnt already
  closeStartModalDisplay()
  animateTitleDisplay()
})

ipcRenderer.on('reply-html', (e, html) => {
  // Add the lyrics into html
  console.log('reply-html')
  toggleLoadingDisplay(false)
  lyricsFoundDisplay(true, html)
})

ipcRenderer.on('trigger-run-script', async () => {
  // trigger runSpotifyAndGenius
  if (store.getState().access_token)
    await runSpotifyAndGenius(
      store.getState().access_token,
      store.getState().music_state,
    )
})

ipcRenderer.on('token-expire', (event, sec) => {
  // Reniew token when expire
  tokenTimerExpire = setTimeout(async () => {
    console.log('token expired, asking for a new one')
    await refreshTheToken()
  }, sec * 900)
})

// Display IpcRenderers
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

ipcRenderer.on('trigger-no-lyrics-display', () => {
  lyricsFoundDisplay(false)
  toggleLoadingDisplay(false)
})

// Functions
const handleLogout = () => {
  ipcRenderer.send('logout')
  store.dispatch(updateAccessToken(null))
  clearInterval(tokenTimerExpire)
  store.dispatch(updateMusicState('_'))

  // Display
  removeLyricsDisplay()
  logRequestDisplay(true)
  toggleLoggedDisplay(false)
  musicHeaderContainerDisplay(false)
}
