const { createStore } = require('redux')

const initialState = {
  client_id: 'b10450b54169458a891922a191333187',
  redirect_uri: 'http://localhost:54860/callback',
  refresh_token: null,
  access_token: null,
  music_state: '_', // Name only, used in main renderer.js
  current_music: {}, // Obj set on renderer, used on backend/preloadChild.js
  code_verifier: null, // OAuth workflow requirement
}

const generalState = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_REFRESH_TOKEN':
      return { ...state, refresh_token: action.payload }

    case 'UPDATE_ACCESS_TOKEN':
      return { ...state, access_token: action.payload }

    case 'UPDATE_MUSIC_STATE':
      return { ...state, music_state: action.payload }

    case 'UPDATE_CURRENT_MUSIC':
      return { ...state, current_music: action.payload }

    case 'UPDATE_CODE_VERIFIER':
      return { ...state, code_verifier: action.payload }

    default:
      return state
  }
}

// Create Store
const store = createStore(generalState)

// Developpement - print redux state after each changes
//const readState = () => console.log(store.getState())
//store.subscribe(readState)

module.exports = store
