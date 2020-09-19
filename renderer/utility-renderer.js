// Dom
const musicImageDom = document.querySelector('.music-image')
const musicTitleDom = document.querySelector('.music-title')
const musicAlbumDom = document.querySelector('.music-album')
const bLoginDom = document.querySelector('.login-button-hover')
const logoutContainerDom = document.querySelector('.logout-container')
const appTitleDom = document.querySelector('h1')
const logRequestDom = document.querySelector('.log-request')
const loggedWithoutMusicDom = document.querySelector('.logged-without-music')
const musicHeaderContainerEmptyDom = document.querySelector(
  '.music-header-container-empty'
)
const musicHeaderContainerDom = document.querySelector(
  '.music-header-container'
)
const noLyricsFoundTextDom = document.querySelector('.no-lyrics-found-text')
const lyricsDom = document.querySelector('.lyrics')

const modal = document.querySelector('.modal')
const loader = document.querySelector('.loader')
const lyrics = document.querySelector('.lyrics')

// Require

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
const updateDisplay = (currentMusic) => {
  musicImageDom.src = currentMusic.image
  musicImageDom.style.opacity = 1
  musicTitleDom.innerHTML = currentMusic.name
  musicAlbumDom.innerHTML = currentMusic.album
}
module.exports.updateDisplay = updateDisplay

// remove lyrics state
const removeDisplay = () => {
  musicImageDom.src = null
  musicImageDom.style.opacity = 0
  musicTitleDom.innerHTML = null
  musicAlbumDom.innerHTML = null
  lyrics.innerHTML = null
}
module.exports.removeDisplay = removeDisplay

// FETCH METHOD
module.exports.fetchMethod = async (url, obj) => {
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

module.exports.scrolling = scrolling = (type) => {
  // Enable or disable scrolling
  if (type !== 'stop')
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
    logoutContainerDom.classList.bLoginDom('u-display-none')
  } else {
    bLoginDom.classList.remove('u-display-none')
    logoutContainerDom.classList.add('u-display-none')
  }
}

module.exports.animateTitleDisplay = animateTitleDisplay = () => {
  appTitleDom.classList.add('u-display-none')
}

module.exports.wizzLogButtonDisplay = wizzLogButtonDisplay = () => {
  bLoginDom.classList.add('wobble-hor-bottom')
  setTimeout(() => {
    bLoginDom.classList.remove('wobble-hor-bottom')
  }, 1000)
}

module.exports.animateTitleDisplay = animateTitleDisplay = () => {
  appTitleDom.classList.add('u-display-none')
}

module.exports.logRequestDisplay = logRequestDisplay = (isLogged) => {
  isLogged
    ? logRequestDom.classList.add('u-display-none')
    : logRequestDom.classList.remove('u-display-none')
}

module.exports.loggedWithoutMusicDisplay = loggedWithoutMusicDisplay = (
  isLogged
) => {
  isLogged
    ? loggedWithoutMusicDom.classList.add('u-display-none')
    : loggedWithoutMusicDom.classList.remove('u-display-none')
}

module.exports.musicHeaderContainerEmptyDisplay = musicHeaderContainerEmptyDisplay = (
  bool
) => {
  bool
    ? musicHeaderContainerEmptyDom.classList.remove('u-display-none')
    : musicHeaderContainerEmptyDom.classList.add('u-display-none')
}

module.exports.musicHeaderContainerDisplay = musicHeaderContainerDisplay = (
  bool
) => {
  bool
    ? musicHeaderContainerDom.classList.remove('u-display-none')
    : musicHeaderContainerDom.classList.add('u-display-none')
}

module.exports.lyricsFoundDisplay = lyricsFoundDisplay = (bool) => {
  if (bool) {
    noLyricsFoundTextDom.classList.add('u-display-none')
    lyricsDom.classList.remove('u-display-none')
  } else {
    noLyricsFoundTextDom.classList.remove('u-display-none')
    lyricsDom.classList.add('u-display-none')
  }
}
