// Require
var querystring = require('querystring')
const { ipcRenderer } = require('electron/renderer')

const {
  fetchMethod,
  updateHeaderContainerDisplay,
  musicHeaderContainerDisplay,
  urlChecker,
  lyricsFoundDisplay,
} = require('./utility-renderer')

const getCurrentMusicInfos = async (access_token) => {
  if (!access_token) return console.log('access_token null')

  const fetchUrl = 'https://api.spotify.com/v1/me/player/currently-playing'

  const option = {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  }

  const data = await fetchMethod(fetchUrl, option)
  console.log(data)

  // Error received
  if (data.e) {
    // No music currently playing
    if (data.e.status === 204) {
      console.log('No music currently playing')
      return null
    }
    // Other error
    console.log('error fetching spotify : ' + data.e)
    return null
  }

  // OK

  // Get allArtists and artistsMax2 string with separated by ' '
  let allArtists = ''
  data.res.item.artists.forEach((elem) => {
    allArtists = allArtists + ' ' + elem.name
  })
  allArtists = allArtists.slice(1)
  console.log(allArtists)

  let artistsMax2 = ''
  for (let i = 0; i < data.res.item.artists.length; i++) {
    if (i <= 1) artistsMax2 = artistsMax2 + ' ' + data.res.item.artists[i].name
  }

  // Get all featuring string with separated by ', '
  let featuring = []
  data.res.item.artists.forEach((elem) => {
    featuring.push(elem.name)
  })
  featuring.shift()
  featuring = featuring.join(', ')

  const currentMusic = {
    name: data.res.item.name,
    artist: data.res.item.artists[0].name,
    album: data.res.item.album.name,
    image: data.res.item.album.images[1].url,
    allArtists,
    artistsMax2,
    featuring,
  }

  // Updating display
  updateHeaderContainerDisplay(currentMusic)
  musicHeaderContainerDisplay(true)

  return currentMusic
}

module.exports.runSpotifyAndGenius = runSpotifyAndGenius = async (
  access_token,

  musicState
) => {
  if (!access_token) return console.log('access_token null')

  // Get music from spotify
  const currentMusic = await getCurrentMusicInfos(access_token)

  // Return if no music playing
  if (!currentMusic) return null

  // Return is same music
  if (musicState === currentMusic.name) {
    console.log('Same music, prevent crawling')
    return currentMusic.name
  }

  // Send url to to crawl
  toggleLoadingDisplay(true)
  ipcRenderer.send('load-url', {
    name: currentMusic.name,
    artistsMax2: currentMusic.artistsMax2,
  })

  // return new music State
  return currentMusic.name
}
