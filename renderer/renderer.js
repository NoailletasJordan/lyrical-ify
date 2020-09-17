// Renderer
// Dom
const b1 = document.querySelector('.button1')
const b2 = document.querySelector('.button2')
const b3 = document.querySelector('.button3')

// Require
const { shell } = require('electron')
var querystring = require('querystring')
const { ipcRenderer } = require('electron/renderer')

// Variables
let client_id = null
let redirect_uri = null
let access_token = null
let refreshtoken = null

// Fonctions
const Authorize = () => {
  if (!client_id) return console.log('no client_id or uri')

  const scope = 'user-read-currently-playing'
  shell.openExternal(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
      })
  )
}

const getCurrentMusic = async () => {
  if (!access_token) return console.log('access_token null')

  const resBrut = await fetch(
    'https://api.spotify.com/v1/me/player/currently-playing',
    {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    }
  )

  console.log(resBrut.status)

  if (resBrut.status > 200 && resBrut.status < 400) {
    // Not listening music
    return console.log('user not listening music')
  } else if (resBrut.status >= 400) {
    // Error 400+
    return console.log('Error ' + resBrut.status)
  }

  // OK
  const res = await resBrut.json()

  console.log(resBrut)
  console.log(res)
  const currentMusic = {
    name: res.item.name,
    artist: res.item.artists[0].name,
    album: res.item.album.name,
  }
  console.log('current : ' + currentMusic.name)
  console.log('current : ' + currentMusic.artist)
  console.log('current : ' + currentMusic.album)
  return currentMusic
}

// Listeners
// Button 1
b1.addEventListener('click', () => {
  Authorize()
})

b3.addEventListener('click', () => {
  getCurrentMusic()
  // Update genius
})

// Get current info
b2.addEventListener('click', async () => {})

// ipcRenderer
ipcRenderer.on('mess', (e, args) => {
  console.log(args)
})

// ipcRenderer
ipcRenderer.on('reply-token', (e, args) => {
  access_token = args.access_token
  refresh_token = args.refresh_token
  console.log(args.access_token, args.refresh_token)
})

// ipcRenderer
ipcRenderer.on('initial-variable', (e, args) => {
  client_id = args.client_id
  redirect_uri = args.redirect_uri
})

//ipcRenderer.invoke('require-token')
