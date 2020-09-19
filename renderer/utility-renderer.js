// Dom
const musicImageDom = document.querySelector('.music-image')
const musicTitleDom = document.querySelector('.music-title')
const musicAlbumDom = document.querySelector('.music-album')
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
