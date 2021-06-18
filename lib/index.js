const ApkParser = require('./apk')
const IpaParser = require('./ipa')
const AabParser = require('./aab')
const SupportFileTypes = ['ipa', 'apk', 'aab']

class AppInfoParser {
  /**
   * parser for parsing .ipa or .apk file
   * @param {String | File | Blob} file // file's path in Node, instance of File or Blob in Browser
   */
  constructor (file) {
    if (!file) {
      throw new Error('Param miss: file(file\'s path in Node, instance of File or Blob in browser).')
    }
    const splits = (file.name || file).split('.')
    const fileType = splits[splits.length - 1].toLowerCase()
    if (!SupportFileTypes.includes(fileType)) {
      throw new Error('Unsupported file type, only support .ipa or .apk file.')
    }
    this.file = file

    switch (fileType) {
      case 'ipa':
        this.parser = new IpaParser(this.file)
        break
      case 'apk':
        this.parser = new ApkParser(this.file)
        break
      case 'aab':
        this.parser = new AabParser(this.file)
    }
  }
  parse () {
    return this.parser.parse()
  }
}

module.exports = AppInfoParser
