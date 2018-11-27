module.exports = {
  findEntry: function (entries, regex) {
    let result
    entries.forEach(function (path, entry) {
      console.log(' ----> ', entry.name)
      if (regex.test(entry.name)) {
        console.log(' ----> ', entry)
        result = entry
      }
    })
    return result
  }
}
