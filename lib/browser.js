const ApkParser = require('./apk')
const IpaParser = require('./ipa')
const supportFileTypes = ['ipa', 'apk']

class AppInfoParser {
  constructor (file) {
    const splits = file.name.split('.')
    const fileType = splits[splits.length - 1]
    if (!supportFileTypes.includes(fileType)) {
      throw new Error('Unsupport file type!')
    }
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
