// Dom
const colorButtonDom = document.querySelector('.color-button')
const colorContainerDom = document.querySelector('.color-container')
const colorInnerListDom = document.querySelectorAll('.color-inner')
const colorOuterListDom = document.querySelectorAll('.color-outer')
const bodyDom = document.querySelector('body')
const lyricsDom = document.querySelector('.lyrics')
const lyricsInBracketsDom = document.querySelector('.lyrics-in-brackets')
const versionDom = document.querySelector('.version')

// Require
const { ipcRenderer } = require('electron/renderer')

// Variables
let isShow = false
let islocked = false

// Functions
const toggleShowColors = (bool) => {
  if (islocked) return

  islocked = true
  isShow = !isShow

  if (bool) {
    // Show
    colorContainerDom.classList.remove('u-display-none')
    colorContainerDom.classList.add('slide-in-right')
    setTimeout(() => {
      colorContainerDom.classList.remove('slide-in-right')
      islocked = false
    }, 200)
  } else {
    // Hide
    colorContainerDom.classList.add('slide-in-right-reverse')
    setTimeout(() => {
      colorContainerDom.classList.add('u-display-none')
      colorContainerDom.classList.remove('slide-in-right-reverse')
      islocked = false
    }, 200)
  }
}

const setBackgroundColorStorage = (currentBackgroundColor) => {
  ipcRenderer.send('set-background-color-storage', currentBackgroundColor)
}

const setTextColorStorage = (currentTextColor) => {
  ipcRenderer.send('set-text-color-storage', currentTextColor)
}

const changeTextColorDisplay = (color) => {
  console.log(lyricsDom)
  lyricsDom.style.color = color
  versionDom.style.color = color
  lyricsInBracketsDom.style.color = color
}

const changeBackgroundColorDisplay = (color) => {
  bodyDom.style.backgroundColor = color
}

// listeners
colorButtonDom.addEventListener('click', () => {
  toggleShowColors(!isShow)
})

// Ipc
ipcRenderer.on('text-color-stored-display', (e, arg) => {
  changeTextColorDisplay(arg)
})
ipcRenderer.on('background-color-stored-display', (e, arg) => {
  changeBackgroundColorDisplay(arg)
})

ipcRenderer.on('version-stored-display', (e, arg) => {
  versionDom.innerHTML = 'v' + arg
})

// Initialize functions
const iniColors = () => {
  Array.from(colorInnerListDom).forEach((element) => {
    const color = element.getAttribute('data-color')
    element.style.backgroundColor = color
  })
}
iniColors()

const addEventToColorDom = () => {
  Array.from(colorOuterListDom).forEach((element) => {
    element.addEventListener('click', () => {
      const inner = element.children[0]
      const color = inner.getAttribute('data-color')
      if (inner.classList.contains('text-color')) {
        // Text Color
        changeTextColorDisplay(color)
        setTextColorStorage(color)
      } else {
        // Background Color
        changeBackgroundColorDisplay(color)
        setBackgroundColorStorage(color)
      }
    })
  })
}
addEventToColorDom()

const dissmissColorPalette = () => {
  // Prevent dismiss inside the palette
  colorContainerDom.addEventListener('click', (e) => {
    e.stopPropagation()
  })
  bodyDom.addEventListener('click', (e) => {
    toggleShowColors(false)
  })
}
dissmissColorPalette()
