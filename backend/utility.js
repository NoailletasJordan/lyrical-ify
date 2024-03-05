// Require
const storage = require('electron-json-storage')
const { updateRefreshToken } = require('./actions')

module.exports.handleTokenReceived = (
  access_token,
  refresh_token,
  expires_in,
  mainWindow,
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

module.exports.logoutFromLocalStorage = () => {
  storage.remove('refresh_token', function (error) {
    if (error) throw error
    console.log('logged out')
  })
}

module.exports.setTextColorFromLocalStorage = (textColor) => {
  storage.set('textColor', { textColor }, function (error) {
    if (error) throw error
  })
}

module.exports.setBackgroundColorFromLocalStorage = (backgroundColor) => {
  storage.set('backgroundColor', { backgroundColor }, function (error) {
    if (error) throw error
  })
}

module.exports.getFromLocalStorageAndUpdateFront = (mainWindow) => {
  // Get token from storage
  storage.get('refresh_token', function (error, data) {
    if (error) throw error
    if (Object.keys(data).length === 0 && data.constructor === Object) {
      // refresh_token not found, ask for auth
      console.log('refresh_token not found')
      mainWindow.webContents.send('no-token-stored-display')
      return
    }

    // Found refresh_token - Update
    store.dispatch(updateRefreshToken(data.refresh_token))
    mainWindow.webContents.send('token-stored-display')
    mainWindow.webContents.send('trigger-refresh')
  })

  // Get text colors from storage
  storage.get('textColor', function (error, data) {
    if (error) throw error
    if (Object.keys(data).length === 0 && data.constructor === Object)
      return console.log('Text not found')

    mainWindow.webContents.send('text-color-stored-display', data.textColor)
  })

  // Get background colors from storage
  storage.get('backgroundColor', function (error, data) {
    if (error) throw error
    if (Object.keys(data).length === 0 && data.constructor === Object)
      return console.log('Background not found')

    mainWindow.webContents.send(
      'background-color-stored-display',
      data.backgroundColor,
    )
  })
}

// Developpement - Remove from storage
/* storage.remove("refresh_token", function (error) {
  if (error) throw error
})

storage.remove("backgroundColor", function (error) {
  if (error) throw error
})

storage.remove("textColor", function (error) {
  if (error) throw error
}) */
