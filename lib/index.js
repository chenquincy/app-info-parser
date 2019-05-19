const ApkParser = require('./apk')
const IpaParser = require('./ipa')
const supportFileTypes = ['ipa', 'apk']

class AppInfoParser {
  /**
   *
   * @param {String | File | Blob} file // node：file path，browser: file or blob
   */
  constructor (file) {
    if (!file) {
      throw new Error('Param miss: file(file path in Node, File or Blob in browser).')
    }
    const splits = (file.name || file).split('.')
    const fileType = splits[splits.length - 1].toLowerCase()
    if (!supportFileTypes.includes(fileType)) {
      throw new Error('Unsupport file type, only support .ipa or .apk file.')
    }
    this.file = file

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
