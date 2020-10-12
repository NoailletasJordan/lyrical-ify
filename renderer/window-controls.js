// Dom
const minimizeDom = document.querySelector('.minimize-window')
const maximizeDom = document.querySelector('.maximize-window')
const CloseDom = document.querySelector('.close-window')

// Require
const { ipcRenderer } = require('electron/renderer')

// Listeners
minimizeDom.addEventListener('click', () => {
  ipcRenderer.send('minimize-window')
})

maximizeDom.addEventListener('click', () => {
  ipcRenderer.send('toggle-maximize-window')
})

CloseDom.addEventListener('click', () => {
  ipcRenderer.send('close-window')
})
