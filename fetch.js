module.exports = async (url, obj) => {
  const response = await fetch(url, obj)
  const res = await response.json()
  console.log(response.status)
  return res
}
