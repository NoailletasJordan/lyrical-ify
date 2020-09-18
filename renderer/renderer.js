// Renderer
// Dom
const b1 = document.querySelector('.button1')
const b2 = document.querySelector('.button2')
const b3 = document.querySelector('.button3')
const lyrics = document.querySelector('.lyrics')

// Require
const { shell } = require('electron')
var querystring = require('querystring')
const { ipcRenderer } = require('electron/renderer')
const fetchMethod = require('../fetch')

// Variables
let client_id = null
let redirect_uri = null
let genius_token = null

let access_token = null
let refresh_token = null

// Fonctions
const authorize = () => {
  if (!client_id) return console.log('no client_id or uri')

  console.log('authorize()')
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

const refreshTheToken = async () => {
  const fetchUrl =
    'http://localhost:8888/refresh_token?' +
    querystring.stringify({
      refresh_token,
    })

  const data = await fetchMethod(fetchUrl)

  //error
  if (data.e) return

  console.log('refresh : ' + data.res.access_token)
  access_token = data.res.access_token
}

const getCurrentMusic = async () => {
  if (!access_token) return console.log('access_token null')

  const fetchUrl = 'https://api.spotify.com/v1/me/player/currently-playing'

  const option = {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  }

  const data = await fetchMethod(fetchUrl, option)

  //error
  if (data.e) return

  const currentMusic = {
    name: data.res.item.name,
    artist: data.res.item.artists[0].name,
    album: data.res.item.album.name,
  }

  return currentMusic
}

const getUrlFromGenius = async (name, artist) => {
  if (!genius_token) return console.log('error no genius_token')

  console.log('bgeturlfromgenius : ', name, artist)

  const nameMinusParentheses = name.replace(/\(.*?\)/gm, '')

  console.log('query : ' + nameMinusParentheses + ' ' + artist)

  const option = {
    headers: {
      Authorization: 'Bearer ' + genius_token,
    },
  }
  const fetchUrl =
    'https://api.genius.com/search?' +
    querystring.stringify({
      q: `${nameMinusParentheses} ${artist}`,
    })

  const data = await fetchMethod(fetchUrl, option)

  //error
  if (data.e) return

  return {
    url: data.res.response.hits[0].result.url,
    thumbnail: data.res.response.hits[0].result.song_art_image_thumbnail_url,
  }
}

const runSpotifyAndGenius = async () => {
  if (!genius_token) return console.log('error no genius_token')
  if (!access_token) return console.log('access_token null')

  // Get music from spotify
  const currentMusic = await getCurrentMusic()

  console.log('b3 : ', currentMusic.name, currentMusic.artist)
  // Get url and thumbnail from genius
  const { url, thumbnail } = await getUrlFromGenius(
    currentMusic.name,
    currentMusic.artist
  )

  // Send url to main
  ipcRenderer.send('load-url', url)
  console.log(url)
}

// Listeners
// Button 1
b1.addEventListener('click', () => {
  authorize()
})

b3.addEventListener('click', () => {
  runSpotifyAndGenius()
})

// Get current info
b2.addEventListener('click', () => {
  refreshTheToken()
})

// ipcRenderer
ipcRenderer.on('mess', (e, args) => {
  console.log(args)
})

// ipcRenderer
ipcRenderer.on('trigger-auth', (e, args) => {
  authorize()
})

// trigger refresh
ipcRenderer.on('trigger-refresh', (e, refr) => {
  refresh_token = refr
  refreshTheToken()
})

// ipcRenderer
ipcRenderer.on('reply-token', (e, args) => {
  access_token = args.access_token
  refresh_token = args.refresh_token
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
  lyrics.innerHTML = html
  console.log(html)
})

// trigger runSpotifyAndGenius
ipcRenderer.on('trigger-run-script', (e, html) => {
  runSpotifyAndGenius()
})

ipcRenderer.on('mess', (e, arg) => {
  console.log(arg)
})
