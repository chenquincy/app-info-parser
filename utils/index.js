const assert = require('assert')

module.exports = {
  assert: function (condition, msg) {
    assert(condition, `[app-info-parser] ${msg}`)
  },
  findEntry (entries, regex) {
    let result
    entries.forEach(function (path, entry) {
      if (regex.test(entry.name)) {
        result = entry
      }
    })
    return result
  }
}
