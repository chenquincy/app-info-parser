const fs = require('fs')
const path = require('path')
const ApkParser = require('./apk')
const IpaParser = require('./ipa')
const supportFileTypes = ['ipa', 'apk']

class AppInfoParser {
  constructor (filename) {
    if (!filename) {
      throw new Error('Param miss: filename')
    }
    const splits = filename.split('.')
    const fileType = splits[splits.length - 1]
    if (!supportFileTypes.includes(fileType)) {
      throw new Error('Unsupport file type')
    }
    this.filename = filename
    this.file = fs.readFileSync(path.resolve(filename))

    switch (fileType) {
      case 'ipa':
        this.parser = new IpaParser(this.file)
        break
      case 'apk':
        this.parser = new ApkParser(this.file)
        break
    }
  }
  parse () {
    return this.parser.parse()
  }
}

module.exports = AppInfoParser
