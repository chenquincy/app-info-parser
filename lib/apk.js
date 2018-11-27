const Zip = require('jszip')
const { findEntry } = require('../utils')
const regex = /^AndroidManifest\.xml$/
const ManifestXmlParser = require('./xml-parser/manifest')

class ApkParser {
  constructor (file) {
    if (!file) {
      throw new Error('Param miss: filePath')
    }

    this.file = file
  }
  parse () {
    const file = this.file
    return new Promise(function (resolve, reject) {
      const zip = new Zip()
      zip.loadAsync(file).then(function (entries) {
        const entry = findEntry(entries, regex)
        if (!entry) {
          reject(new Error('AndroidManifest.xml not found'))
        }
        entries.file(entry.name).async('nodebuffer').then(function (binaryString) {
          const buffer = new ManifestXmlParser(binaryString)
          const result = buffer.parse()
          resolve(result)
        })
      })
    })
  }
}

module.exports = ApkParser
