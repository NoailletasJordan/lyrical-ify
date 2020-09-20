// Require
const { shell } = require('electron')
var querystring = require('querystring')
const { ipcRenderer } = require('electron/renderer')
const cryptoRandomString = require('crypto-random-string')
const {
  fetchMethod,
  pkce_challenge_from_verifier,
  modalBrowserDisplay,
} = require('./utility-renderer')

module.exports.authorize = authorize = async (client_id, redirect_uri) => {
  if (!client_id) return console.log('no client_id or uri')

  // Create code Verifier and Challenge for OAuth PKCE
  const code_verifier = cryptoRandomString({
    length: 128,
    type: 'alphanumeric',
  })
  const code_challenge = await pkce_challenge_from_verifier(code_verifier)

  // Set up Query
  console.log('authorize()')
  const scope = 'user-read-currently-playing'

  // Open Browser
  shell.openExternal(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id,
        scope,
        redirect_uri,
        code_challenge,
        code_challenge_method: 'S256',
      })
  )

  // Show modal
  modalBrowserDisplay(true)
  toggleLoadingDisplay(false)

  // Send codeVerifier to main
  ipcRenderer.send('code-verifier-created', code_verifier)
}

module.exports.refreshTheToken = refreshTheToken = async () => {
  const fetchUrl = 'http://localhost:8888/refresh_token?'

  const data = await fetchMethod(fetchUrl)

  //error
  if (data.e) return

  console.log('refresh : ' + data.res.access_token)
  return data.res.access_token
}
