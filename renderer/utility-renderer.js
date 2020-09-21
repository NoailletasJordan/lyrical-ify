// Dom
const musicImageDom = document.querySelector('.music-image')
const musicTitleDom = document.querySelector('.music-title')
const musicArtistDom = document.querySelector('.music-artist')
const musicAlbumDom = document.querySelector('.music-album')
const musicFeaturingDom = document.querySelector('.music-featuring')
const bLoginDom = document.querySelector('.login-button')
const logoutContainerDom = document.querySelector('.logout-button')
const appTitleDom = document.querySelector('h1')
const logRequestDom = document.querySelector('.log-request')
//const loggedWithoutMusicDom = document.querySelector('.logged-without-music')
const musicHeaderContainerEmptyDom = document.querySelector(
  '.music-header-container-empty'
)
const musicHeaderContainerDom = document.querySelector(
  '.music-header-container'
)
const noLyricsFoundTextDom = document.querySelector('.no-lyrics-found-text')
const lyricsDom = document.querySelector('.lyrics')
const modalStartDom = document.querySelector('.modal-start')
const modalBrowserDom = document.querySelector('.modal-browser')
const modal = document.querySelector('.modal')
const loader = document.querySelector('.loader')
const lyrics = document.querySelector('.lyrics')
const modalBrowserBlock = document.querySelector('.modal-browser-block')
const musicFeaturingContainer = document.querySelector(
  '.music-featuring-container'
)

// Require
var querystring = require('querystring')
const { start } = require('repl')

function sha256(plain) {
  // returns promise ArrayBuffer
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

function base64urlencode(a) {
  // Convert the ArrayBuffer to string using Uint8 array.
  // btoa takes chars from 0-255 and base64 encodes.
  // Then convert the base64 encoded to base64url encoded.
  // (replace + with -, replace / with _, trim trailing =)
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// Create PKCE
module.exports.pkce_challenge_from_verifier = async function pkce_challenge_from_verifier(
  v
) {
  console.log(this)
  hashed = await sha256(v)
  base64encoded = base64urlencode(hashed)
  return base64encoded
}

// Update state
const updateHeaderContainerDisplay = (currentMusic) => {
  musicImageDom.src = currentMusic.image
  musicImageDom.style.opacity = 1
  musicTitleDom.innerHTML = currentMusic.name
  musicArtistDom.innerHTML = currentMusic.artist
  musicAlbumDom.innerHTML = currentMusic.album
  musicFeaturingDom.innerHTML = currentMusic.featuring
  currentMusic.featuring
    ? musicFeaturingContainer.classList.remove('u-display-none')
    : musicFeaturingContainer.classList.add('u-display-none')
}
module.exports.updateHeaderContainerDisplay = updateHeaderContainerDisplay

// remove lyrics state
const removeLyricsDisplay = () => {
  musicImageDom.src = null
  musicImageDom.style.opacity = 0
  musicTitleDom.innerHTML = null
  musicAlbumDom.innerHTML = null
  musicArtistDom.innerHTML = null
  lyrics.innerHTML = null
}
module.exports.removeLyricsDisplay = removeLyricsDisplay

// FETCH METHOD
const fetchMethod = async (url, obj) => {
  const resBrut = await fetch(url, obj)

  console.log(resBrut.status)

  if (resBrut.status > 200 && resBrut.status < 400) {
    return { e: { status: resBrut.status }, res: null }
  } else if (resBrut.status >= 400) {
    // Error 400+
    console.log('Error ' + resBrut.status, res)
    return { e: { status: resBrut.status }, res: null }
  }

  // OK
  const res = await resBrut.json()

  return { e: null, res }
}
module.exports.fetchMethod = fetchMethod

module.exports.urlChecker = urlChecker = async (
  option,
  startingUrl,
  artist,
  nameCutPastParenthesis,
  nameBrut
) => {
  const listOfBannedWords = [
    'top-hits',
    'traduccion-al',
    'traducao',
    'turkce-ceviri',
    'ubersetzungen',
    'traduction-francaise',
    'nederlandse-vertaling',
    'deutsche-ubersetzung',
    'russian-translations',
    'annotated',
    'english-translation',
    'genius-users',
    'summer-playlist',
  ]

  const urlIsOk = (listOfBannedWords) => {
    let valueReturned = true
    listOfBannedWords.forEach((word) => {
      startingUrl.includes(word) ? (valueReturned = false) : null
    })

    if (!startingUrl.includes('lyrics')) valueReturned = false

    // settings if is a remix
    if (
      nameBrut.toLowerCase().includes('remix') &&
      !startingUrl.toLowerCase().includes('remix')
    )
      valueReturned = false

    if (
      !nameBrut.toLowerCase().includes('remix') &&
      startingUrl.toLowerCase().includes('remix')
    ) {
      valueReturned = false
    }

    if (
      // url do not contains artist name
      !startingUrl
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ +/gm, '-')
        .toLowerCase()
        .includes(
          artist
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/ +/gm, '-')
            .toLowerCase()
        )
    )
      valueReturned = false

    return valueReturned
  }

  if (urlIsOk(listOfBannedWords)) {
    // OK
    console.log('url checked: true')
    return startingUrl
  } else {
    console.log('url checked: false')
    // Bad url, try new query with artist 1 only
    const fetchUrl =
      'https://api.genius.com/search?' +
      querystring.stringify({
        q: `${nameCutPastParenthesis} ${artist}`,
      })
    console.log('url from checker', fetchUrl)
    const data = await fetchMethod(fetchUrl, option)

    if (!data.res.response.hits.length) {
      // Didnt find any song
      url = ''
    } else {
      // OK - Extract url
      url = data.res.response.hits[0].result.url || ''
    }

    // Genius didn't found the track

    if (
      data.e ||
      data.res.response.hits.length === 0 ||
      !url.includes('lyrics') ||
      // url do not contain artist name
      !url
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ +/gm, '-')
        .toLowerCase()
        .includes(
          artist
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/ +/gm, '-')
            .toLowerCase()
        )
    ) {
      return null
    }

    // OK
    return url
  }
}

const scrolling = (bool) => {
  // Enable or disable scrolling
  if (bool)
    return document.querySelector('body').classList.remove('stop-scrolling')
  document.querySelector('body').classList.add('stop-scrolling')
}
module.exports.closeModal = closeModal = () => {
  modal.classList.add('slide-out-bck-center')
}

module.exports.toggleLoadingDisplay = toggleLoadingDisplay = (isLoading) => {
  isLoading
    ? loader.classList.remove('u-display-none')
    : loader.classList.add('u-display-none')
}

module.exports.toggleLoggedDisplay = toggleLoggedDisplay = (isLogged) => {
  if (isLogged) {
    bLoginDom.classList.add('u-display-none')
    logoutContainerDom.classList.remove('u-display-none')
    console.log('-- should show logout')
  } else {
    bLoginDom.classList.remove('u-display-none')
    logoutContainerDom.classList.add('u-display-none')
    console.log('-- should hide logout')
  }
}

module.exports.animateTitleDisplay = animateTitleDisplay = () => {
  appTitleDom.classList.add('text-shadow-pop-bl')
}

module.exports.wizzLogButtonDisplay = wizzLogButtonDisplay = () => {
  bLoginDom.classList.add('wobble-hor-bottom')
  setTimeout(() => {
    bLoginDom.classList.remove('wobble-hor-bottom')
  }, 1000)
}

module.exports.logRequestDisplay = logRequestDisplay = (bool) => {
  bool
    ? logRequestDom.classList.remove('u-display-none')
    : logRequestDom.classList.add('u-display-none')
}

module.exports.musicHeaderContainerDisplay = musicHeaderContainerDisplay = (
  bool
) => {
  if (bool) {
    musicHeaderContainerDom.classList.remove('u-display-none')
    musicHeaderContainerEmptyDom.classList.add('u-display-none')
  } else {
    musicHeaderContainerDom.classList.add('u-display-none')
    musicHeaderContainerEmptyDom.classList.remove('u-display-none')
  }
}

module.exports.lyricsFoundDisplay = lyricsFoundDisplay = (bool, html) => {
  if (bool) {
    noLyricsFoundTextDom.classList.add('u-display-none')
    lyricsDom.classList.remove('u-display-none')
    lyricsDom.innerHTML = html
  } else {
    noLyricsFoundTextDom.classList.remove('u-display-none')
    lyricsDom.classList.add('u-display-none')
  }
}

module.exports.closeStartModalDisplay = closeStartModalDisplay = () => {
  modalStartDom.classList.add('slide-out-bck-center')
  setTimeout(() => {
    modalStartDom.classList.add('u-display-none')
    modalStartDom.classList.remove('slide-out-bck-center')
  }, 500)
}

module.exports.modalBrowserDisplay = modalBrowserDisplay = (bool) => {
  if (bool) {
    modalBrowserDom.classList.remove('u-display-none')
    modalBrowserBlock.classList.add('slide-in-elliptic-top-fwd')
    scrolling(false)
    setTimeout(() => {
      modalBrowserBlock.classList.remove('slide-out-bck-center')
    }, 700)
  } else {
    modalBrowserDom.classList.add('u-display-none')
    scrolling(true)
  }
}
