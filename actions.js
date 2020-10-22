module.exports.updateRefreshToken = updateRefreshToken = (refresh_token) => {
  return {
    type: 'UPDATE_REFRESH_TOKEN',
    payload: refresh_token,
  }
}

module.exports.updateAccessToken = updateAccessToken = (access_token) => {
  return {
    type: 'UPDATE_ACCESS_TOKEN',
    payload: access_token,
  }
}

module.exports.updateMusicState = updateMusicState = (music_state) => {
  return {
    type: 'UPDATE_MUSIC_STATE',
    payload: music_state,
  }
}

module.exports.updateCurrentMusic = updateCurrentMusic = (current_music) => {
  return {
    type: 'UPDATE_CURRENT_MUSIC',
    payload: current_music,
  }
}

module.exports.updateCodeVerifier = updateCodeVerifier = (code_verifier) => {
  return {
    type: 'UPDATE_CODE_VERIFIER',
    payload: code_verifier,
  }
}
