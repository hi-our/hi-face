const toHump = (name) => {
  return name.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  })
}

export const transformList = (list) => {
  return list.map(item => {
    let keys = Object.keys(item)
    let one = {}
    keys.forEach(key => {
      one[toHump(key)] = item[key]
    })
    return one
  })
}