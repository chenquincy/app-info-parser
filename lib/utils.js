module.exports = {
  findEntry: function (entries, regex) {
    let result
    entries.forEach(function (path, entry) {
      if (regex.test(entry.name)) {
        result = entry
      }
    })
    return result
  }
}
