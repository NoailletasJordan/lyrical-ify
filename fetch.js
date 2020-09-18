module.exports = async (url, obj) => {
  const resBrut = await fetch(url, obj)

  console.log(resBrut.status)

  if (resBrut.status > 200 && resBrut.status < 400) {
    return { e: { status: resBrut.status }, res: null }
  } else if (resBrut.status >= 400) {
    // Error 400+
    console.log('Error ' + resBrut.status, resBrut)
    return { e: { status: resBrut.status }, res: null }
  }

  // OK
  const res = await resBrut.json()

  return { e: null, res }
}
