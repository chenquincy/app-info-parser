const { assert } = require('./utils')
const ApkParser = require('./lib/apk')
const IpaParser = require('./lib/ipa')
const supportFileTypes = ['ipa', 'apk']

class AppInfoParser {
  constructor (file) {
    assert(file, 'Param miss: file')
    const splits = file.name.split('.')
    const fileType = splits[splits.length - 1]
    assert(supportFileTypes.includes(fileType), 'Unsupport file type')
    this.file = file

    switch (fileType) {
      case 'ipa':
        this.parser = new IpaParser(file)
        break
      case 'apk':
        this.parser = new ApkParser(file)
        break
    }
  }
  parse () {
    return this.parser.parse()
  }
}

module.exports = AppInfoParser
