// Require
const storage = require('electron-json-storage')
const { updateRefreshToken } = require('./actions')

module.exports.handleTokenReceived = handleTokenReceived = (
  access_token,
  refresh_token,
  expires_in,
  mainWindow
) => {
  // Save to localstore
  setRefreshFromLocalStorage(refresh_token)
  console.log('refresh set on storage', refresh_token)

  // Update access_token
  store.dispatch(updateAccessToken(access_token))

  // Set Up expiration from token
  mainWindow.webContents.send('token-expire', expires_in)

  store.dispatch(updateRefreshToken(refresh_token))
  return
}

const setRefreshFromLocalStorage = (refresh_token) => {
  storage.set('refresh_token', { refresh_token }, function (error) {
    if (error) throw error
  })
}

module.exports.logoutFromLocalStorage = logoutFromLocalStorage = () => {
  storage.remove('refresh_token', function (error) {
    if (error) throw error
    console.log('logged out')
  })
}

module.exports.setTextColorFromLocalStorage = logoutFromLocalStorage = (
  textColor
) => {
  storage.set('textColor', { textColor }, function (error) {
    if (error) throw error
  })
}

module.exports.setBackgroundColorFromLocalStorage = logoutFromLocalStorage = (
  backgroundColor
) => {
  storage.set('backgroundColor', { backgroundColor }, function (error) {
    if (error) throw error
  })
}

// Remove storage
/* storage.remove('refresh_token', function (error) {
  if (error) throw error
}) */
