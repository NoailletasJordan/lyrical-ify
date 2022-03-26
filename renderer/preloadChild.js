const { ipcRenderer } = require('electron')
const listOfBannedWords = require('./banned-words')

ipcRenderer.on('launch-search', (event, args) => {
  console.log('launch-search')

  document.querySelector('.gLFyf.gsfi').value = `genius lyrics ${nameFormatter(
    args.name
  )}${args.artistsMax2}`
  document.querySelector('.gNO89b').click()
})

ipcRenderer.on('enter-genius', (event, args) => {
  console.log('enter-genius')
  let secondLinkUrl
  let secondLinkNode
  let thirdLinkNode
  let thirdLinkUrl
  let fourthLinkNode
  let fourthLinkUrl
  const linkUrl = document.querySelector('.g a').getAttribute('href')
  const linkNode = document.querySelector('.g a')
  const list = document.querySelectorAll('.g')
  try {
    secondLinkNode = list[1].querySelector('a')
    secondLinkUrl = list[1].querySelector('a').getAttribute('href')
    thirdLinkNode = list[2].querySelector('a')
    thirdLinkUrl = list[2].querySelector('a').getAttribute('href')
    fourthLinkNode = list[3].querySelector('a')
    fourthLinkUrl = list[3].querySelector('a').getAttribute('href')
  } catch (error) {
    console.log(error)
  }

  //linkNode.click()
  const linkSelected = linkSelector(
    args.name,
    linkUrl,
    secondLinkUrl,
    thirdLinkUrl,
    fourthLinkUrl
  )
  console.log('link selector number :', linkSelected)
  if (linkSelected === 0) return linkNode.click()
  if (linkSelected === 1) return secondLinkNode.click()
  if (linkSelected === 2) return thirdLinkNode.click()
  if (linkSelected === 3) return fourthLinkNode.click()
  if (linkSelected === -1) return ipcRenderer.send('no-url-found')
})

ipcRenderer.on('sendbackhtml', (event, arg) => {
  console.log('preload: received sendbackhtml')
  ipcRenderer.send(
    'hereishtml',
    [...document.querySelectorAll('div[data-lyrics-container="true"]')]
      .map((node) => node.innerHTML)
      .join('<br/>')
  )
})

ipcRenderer.on('mess', (e, arg) => {
  console.log(arg)
})

// Function select link
const linkSelector = (title, link, secondLink, thirdLink, fourthLink) => {
  let linkBool = true
  let secondLinkBool = true
  let thirdLinkBool = true
  let fourthLinkBool = true

  // Check if link exist and be on genius.com and  include "lyrics"
  if (
    !link ||
    !link.includes('https://genius.com/') ||
    !link.includes('lyrics')
  )
    linkBool = false
  if (
    !secondLink ||
    !secondLink.includes('https://genius.com/') ||
    !secondLink.includes('lyrics')
  )
    secondLinkBool = false
  if (
    !thirdLink ||
    !thirdLink.includes('https://genius.com/') ||
    !thirdLink.includes('lyrics')
  )
    thirdLinkBool = false
  if (
    !fourthLink ||
    !fourthLink.includes('https://genius.com/') ||
    !fourthLink.includes('lyrics')
  )
    fourthLinkBool = false

  // check for banned words
  if (!urlWithoutBannedWords(listOfBannedWords, link)) linkBool = false
  if (!urlWithoutBannedWords(listOfBannedWords, secondLink))
    secondLinkBool = false
  if (!urlWithoutBannedWords(listOfBannedWords, thirdLink))
    thirdLinkBool = false
  if (!urlWithoutBannedWords(listOfBannedWords, fourthLink))
    fourthLinkBool = false

  // if "remix in url but not title" - this test should be last
  if (
    !title.toLowerCase().includes('remix') &&
    link.toLowerCase().includes('remix') &&
    !secondLink.toLowerCase().includes('remix') &&
    secondLinkBool
  ) {
    linkBool = false
  }

  console.log('linkbool', linkBool)
  console.log('secondLinkBool', secondLinkBool)
  console.log('thirdLinkBool', thirdLinkBool)
  console.log('fourthLinkBool', fourthLinkBool)

  // return -1 : error ; 0 = link ; 1 = secondLink
  if (linkBool) return 0
  if (secondLinkBool) return 1
  if (thirdLinkBool) return 2
  if (fourthLinkBool) return 3
  return -1
}

function urlWithoutBannedWords(listOfBannedWords, currentLink) {
  if (!currentLink) return false
  let valueReturned = true
  listOfBannedWords.forEach((word) => {
    currentLink.toLowerCase().includes(word.toLowerCase())
      ? (valueReturned = false)
      : null
  })
  return valueReturned
}

function nameFormatter(name) {
  // Filter "(feat." and max 25 caracter
  return name.replace(/(\(feat.*|\(with.* | feat\..*)/gm, '').slice(0, 25)
}
