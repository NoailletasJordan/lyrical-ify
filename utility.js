// Require
const storage = require('electron-json-storage')

module.exports.handleTokenReceived = handleTokenReceived = (
  access_token,
  refresh_token,
  expires_in,
  mainWindow
) => {
  // Save to localstore
  setFromLocalStorage(refresh_token)
  console.log('refresh set on storage', refresh_token)

  // Send token and refresh to rederrer
  mainWindow.webContents.send('reply-token', {
    access_token,
  })

  // Set Up expiration from token
  mainWindow.webContents.send('token-expire', expires_in)

  return refresh_token
}

const setFromLocalStorage = (refresh_token) => {
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

// Remove storage
storage.remove('refresh_token', function (error) {
  if (error) throw error
})
