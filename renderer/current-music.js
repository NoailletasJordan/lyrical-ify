// Require
var querystring = require('querystring')
const { ipcRenderer } = require('electron/renderer')

const { fetchMethod, updateDisplay } = require('./utility-renderer')

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

  return {
    name: data.res.item.name,
    artist: data.res.item.artists[0].name,
    album: data.res.item.album.name,
    image: data.res.item.album.images[1].url,
  }
}

const getUrlFromGenius = async (name, artist, genius_token) => {
  if (!genius_token) return console.log('error no genius_token')

  console.log('geturlfromgenius : ', name, artist)

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
  if (data.e) return console.log('error : ' + data.e)

  if (data.res.response.hits.length === 0) {
    // Genius didn't found the track
    return console.log("Sorry we could't get this tracks lyrics ...")
  }

  return {
    url: data.res.response.hits[0].result.url,
    thumbnail: data.res.response.hits[0].result.song_art_image_thumbnail_url,
  }
}

module.exports.runSpotifyAndGenius = runSpotifyAndGenius = async (
  access_token,
  genius_token,
  musicState
) => {
  if (!genius_token) return console.log('error no genius_token')
  if (!access_token) return console.log('access_token null')

  // Get music from spotify
  const currentMusic = await getCurrentMusicInfos(access_token)

  // Return if no music playing
  if (!currentMusic) return

  // Crawl if new music
  if (musicState === currentMusic.name)
    return console.log('Curent music, prevent crawling')

  // Get url and  thumbnail from genius
  const { url } = await getUrlFromGenius(
    currentMusic.name,
    currentMusic.artist,
    genius_token
  )

  // Update html from spotify infos
  updateDisplay(currentMusic)

  // Send url to main
  ipcRenderer.send('load-url', url)
  console.log(url)

  // return new music State
  return currentMusic.name
}
