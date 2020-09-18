const { ipcRenderer } = require('electron')

console.log('preload: child')

ipcRenderer.on('sendbackhtml', (event, arg) => {
  console.log('preload: received sendbackhtml')
  ipcRenderer.send(
    'hereishtml',
    document.querySelector('.lyrics p:first-of-type').innerHTML
  )
})

ipcRenderer.on('mess', (e, arg) => {
  console.log(arg)
})
