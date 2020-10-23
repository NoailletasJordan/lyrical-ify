const express = require('express')
const path = require('path')
const server = express()
var request = require('request')
var cors = require('cors')
var querystring = require('querystring')
var cookieParser = require('cookie-parser')
const { handleTokenReceived } = require('./utility')

const serverWithWindowWrapper = (mainWindow) => {
  // Static serve close page.html
  server
    .use(express.static(path.join(__dirname, '..', 'renderer', 'static')))
    .use(cors())
    .use(cookieParser())

  // Use code provided in query to ask access_token
  server.get('/callback', function (req, res) {
    // Creating request options
    var code = req.query.code || null
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        client_id: store.getState().client_id,
        redirect_uri: store.getState().redirect_uri,
        grant_type: 'authorization_code',
        code,
        code_verifier: store.getState().code_verifier,
      },
      json: true,
    }

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // Access and refresh token received
        console.log('token : ', body.access_token)
        console.log('refresh', body.refresh_token)

        handleTokenReceived(
          body.access_token,
          body.refresh_token,
          body.expires_in,
          mainWindow
        )

        // Trigger dyplay changes
        mainWindow.webContents.send('logged-success')

        // Redirect to close page
        res.redirect('/close.html')
      } else {
        console.log(response.statusCode)
        res.redirect(
          '/#' +
            querystring.stringify({
              error: 'invalid_token',
            })
        )
      }
    })
  })

  server.get('/refresh_token', function (req, res) {
    // Creating request options
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        grant_type: 'refresh_token',
        refresh_token: store.getState().refresh_token,
        client_id: store.getState().client_id,
      },
      json: true,
    }

    // Sending Api request
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // Get access and refresh
        handleTokenReceived(
          body.access_token,
          body.refresh_token,
          body.expires_in,
          mainWindow
        )

        // Send back the access_token
        res.status(200).send({ e: null, access_token: body.access_token })
      } else {
        console.log('error status : ' + response.statusCode)
        console.log(body)
        res.status(400).send(body)
      }
    })
  })

  console.log('Listening on 54860')
  server.listen(54860)
}

module.exports.serverWithWindowWrapper = serverWithWindowWrapper
