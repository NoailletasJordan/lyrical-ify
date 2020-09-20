// Require
var querystring = require('querystring')
const { ipcRenderer } = require('electron/renderer')

const {
  fetchMethod,
  updateHeaderContainerDisplay,
  musicHeaderContainerDisplay,
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

  // Get all artists string with separated by ', '
  let allArtists = ''
  data.res.item.artists.forEach((elem) => {
    allArtists = allArtists + ' ' + elem.name
  })
  allArtists = allArtists.slice(1)
  console.log(allArtists)

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
    featuring,
  }

  // Updating display
  updateHeaderContainerDisplay(currentMusic)
  musicHeaderContainerDisplay(true)

  return currentMusic
}

const getUrlFromGenius = async (name, artist, allArtists, genius_token) => {
  if (!genius_token) return console.log('error no genius_token')

  console.log('geturlfromgenius : ', name, allArtists)

  // Remove also the content of parenthesis
  const nameMinusParentheses = name.replace(/\(.*?\)/gm, '')

  console.log('query : ' + nameMinusParentheses + ' ' + allArtists)

  const option = {
    headers: {
      Authorization: 'Bearer ' + genius_token,
    },
  }
  const fetchUrl =
    'https://api.genius.com/search?' +
    querystring.stringify({
      q: `${nameMinusParentheses} ${allArtists}`,
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
  if (!currentMusic) return null

  // Return is same music
  if (musicState === currentMusic.name) {
    console.log('Curent music, prevent crawling')
    return currentMusic.name
  }

  // Get url and  thumbnail from genius
  const { url } = await getUrlFromGenius(
    currentMusic.name,
    currentMusic.artist,
    currentMusic.allArtists,
    genius_token
  )

  // Send url to to crawl
  toggleLoadingDisplay(true)
  ipcRenderer.send('load-url', url)
  console.log(url)

  // return new music State
  return currentMusic.name
}
